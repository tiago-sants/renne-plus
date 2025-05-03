import { Request, Response } from 'express';
import { PrismaClient, QueueStatus, AddedBy } from '@prisma/client';
import { validationResult } from 'express-validator';
import { getIoInstance } from '../services/socket.service'; // Importa a função para obter o io

const prisma = new PrismaClient();

// Helper function to calculate estimated wait time (simple version)
const calculateEstimatedWaitTime = async (barberId: string): Promise<number> => {
  const waitingCount = await prisma.queueentry.count({
    where: {
      barberId,
      status: { in: ['WAITING', 'IN_PROGRESS'] },
    },
  });
  const averageServiceTime = 20; // minutes - This could be dynamic later
  return waitingCount * averageServiceTime;
};

// Helper function to get the next position in the queue for a barber
const getNextPosition = async (barberId: string): Promise<number> => {
  const lastEntry = await prisma.queueentry.findFirst({
    where: { barberId },
    orderBy: { position: 'desc' },
  });
  return (lastEntry?.position || 0) + 1;
};

// Add entry to the queue
export const addToQueue = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  if (!req.user) {
    return res.status(401).json({ message: 'Usuário não autenticado' });
  }

  const { barbershopId, barberId, clientName, clientPhone, notes } = req.body;
  const currentUser = req.user;

  try {
    const barber = await prisma.barber.findUnique({ where: { id: barberId } });
    if (!barber || barber.barbershopId !== barbershopId) {
      return res.status(404).json({ message: 'Barbeiro ou barbearia inválida.' });
    }

    let clientId: string | undefined = undefined;
    let addedBy: AddedBy;

    if (currentUser.role === 'CLIENT') {
      clientId = currentUser.id;
      addedBy = AddedBy.CLIENT;
      const existingEntry = await prisma.queueentry.findFirst({
        where: {
          clientId,
          barbershopId,
          status: { in: ['WAITING', 'IN_PROGRESS'] },
        },
      });
      if (existingEntry) {
        return res.status(400).json({ message: 'Você já está na fila desta barbearia.' });
      }
    } else if (currentUser.role === 'BARBER') {
      const barberProfile = await prisma.barber.findFirst({ where: { userId: currentUser.id } });
      if (barberProfile?.id !== barberId) {
        return res.status(403).json({ message: 'Barbeiro não autorizado a adicionar para outro barbeiro.' });
      }
      addedBy = AddedBy.BARBER;
      if (!clientName) {
        return res.status(400).json({ message: 'Nome do cliente é obrigatório ao adicionar pela barbearia.' });
      }
    } else {
      return res.status(403).json({ message: 'Apenas clientes ou barbeiros podem adicionar à fila.' });
    }

    const position = await getNextPosition(barberId);
    const estimatedWaitTime = await calculateEstimatedWaitTime(barberId);

    const queueEntry = await prisma.queueentry.create({
      data: {
        barbershopId,
        barberId,
        clientId: clientId,
        clientName: addedBy === AddedBy.BARBER ? clientName : undefined,
        clientPhone: addedBy === AddedBy.BARBER ? clientPhone : undefined,
        position,
        estimatedWaitTime,
        status: QueueStatus.WAITING,
        addedBy,
        notes,
      },
      include: {
        client: { select: { id: true, name: true } },
        barber: { select: { id: true, user: { select: { name: true } } } },
      }
    });

    // --- EMITIR EVENTO SOCKET.IO --- 
    try {
      const io = getIoInstance();
      io.to(queueEntry.barbershopId).emit('queue_updated', { 
          barbershopId: queueEntry.barbershopId, 
          barberId: queueEntry.barberId 
      });
      console.log(`Socket event 'queue_updated' emitted for barbershop ${queueEntry.barbershopId} after adding entry`);
    } catch (socketError) {
      console.error("Erro ao emitir evento socket 'queue_updated' após adicionar:", socketError);
    }
    // --- FIM EMITIR EVENTO ---

    res.status(201).json(queueEntry);
  } catch (error) {
    console.error('Erro ao adicionar à fila:', error);
    res.status(500).json({ message: 'Erro interno ao adicionar à fila.', error: (error as Error).message });
  }
};

// Get queue entries
export const getQueue = async (req: Request, res: Response) => {
  const { barbershopId, barberId, status } = req.query;

  try {
    const whereClause: any = {};
    if (barbershopId) whereClause.barbershopId = barbershopId as string;
    if (barberId) whereClause.barberId = barberId as string;
    if (status) {
        // If status is provided, handle single or multiple statuses
        const statuses = Array.isArray(status) ? status : [status];
        whereClause.status = { in: statuses as QueueStatus[] };
    } else {
      // Default to showing only active queue entries if no status is specified
      whereClause.status = { in: [QueueStatus.WAITING, QueueStatus.IN_PROGRESS] };
    }

    const queueEntries = await prisma.queueentry.findMany({
      where: whereClause,
      include: {
        client: { select: { id: true, name: true, phone: true } },
        barber: { select: { id: true, user: { select: { name: true } } } },
      },
      orderBy: {
        position: 'asc',
      },
    });

    res.status(200).json(queueEntries);
  } catch (error) {
    console.error('Erro ao buscar fila:', error);
    res.status(500).json({ message: 'Erro interno ao buscar fila.', error: (error as Error).message });
  }
};

// Update queue entry status
export const updateQueueStatus = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  if (!req.user) {
    return res.status(401).json({ message: 'Usuário não autenticado' });
  }

  const { id } = req.params;
  const { status } = req.body as { status: QueueStatus };
  const currentUser = req.user;

  try {
    const queueEntry = await prisma.queueentry.findUnique({ where: { id } });

    if (!queueEntry) {
      return res.status(404).json({ message: 'Entrada na fila não encontrada.' });
    }

    if (currentUser.role !== 'BARBER') {
       return res.status(403).json({ message: 'Apenas barbeiros podem atualizar o status da fila.' });
    }
    // TODO: Add check: Is currentUser.id the userId associated with queueEntry.barberId?

    const updatedEntry = await prisma.queueentry.update({
      where: { id },
      data: { status },
      include: {
        client: { select: { id: true, name: true } },
        barber: { select: { id: true, user: { select: { name: true } } } },
      }
    });

    // --- EMITIR EVENTO SOCKET.IO --- 
    try {
      const io = getIoInstance();
      io.to(updatedEntry.barbershopId).emit('queue_updated', { 
          barbershopId: updatedEntry.barbershopId, 
          barberId: updatedEntry.barberId 
      });
       console.log(`Socket event 'queue_updated' emitted for barbershop ${updatedEntry.barbershopId} after status update`);
    } catch (socketError) {
      console.error("Erro ao emitir evento socket 'queue_updated' após atualizar status:", socketError);
    }
    // --- FIM EMITIR EVENTO ---

    res.status(200).json(updatedEntry);
  } catch (error) {
    console.error('Erro ao atualizar status da fila:', error);
    res.status(500).json({ message: 'Erro interno ao atualizar status da fila.', error: (error as Error).message });
  }
};

// Remove entry from the queue
export const removeFromQueue = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  if (!req.user) {
    return res.status(401).json({ message: 'Usuário não autenticado' });
  }

  const { id } = req.params;
  const currentUser = req.user;

  try {
    // Find the entry BEFORE deleting to get barbershopId for the event
    const queueEntry = await prisma.queueentry.findUnique({ where: { id } });

    if (!queueEntry) {
      return res.status(404).json({ message: 'Entrada na fila não encontrada.' });
    }

    let canDelete = false;
    if (currentUser.role === 'CLIENT' && queueEntry.clientId === currentUser.id) {
      canDelete = true;
    } else if (currentUser.role === 'BARBER') {
      const barberProfile = await prisma.barber.findFirst({ where: { userId: currentUser.id } });
      if (barberProfile?.id === queueEntry.barberId) {
        canDelete = true;
      }
    }
    // TODO: Add ADMIN role check

    if (!canDelete) {
      return res.status(403).json({ message: 'Você não tem permissão para remover esta entrada.' });
    }

    await prisma.queueentry.delete({ where: { id } });

    // --- EMITIR EVENTO SOCKET.IO --- 
    try {
      const io = getIoInstance();
      io.to(queueEntry.barbershopId).emit('queue_updated', { 
          barbershopId: queueEntry.barbershopId, 
          barberId: queueEntry.barberId 
      });
       console.log(`Socket event 'queue_updated' emitted for barbershop ${queueEntry.barbershopId} after removing entry`);
    } catch (socketError) {
      console.error("Erro ao emitir evento socket 'queue_updated' após remover:", socketError);
    }
    // --- FIM EMITIR EVENTO ---

    res.status(204).send();
  } catch (error) {
    console.error('Erro ao remover da fila:', error);
    res.status(500).json({ message: 'Erro interno ao remover da fila.', error: (error as Error).message });
  }
};

