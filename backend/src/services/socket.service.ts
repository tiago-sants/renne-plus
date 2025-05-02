import { PrismaClient } from '@prisma/client';
import { Server } from 'socket.io';

// Inicializa o cliente Prisma
const prisma = new PrismaClient();

// Tipos para eventos de socket
interface QueueUpdate {
  barbershopId: string;
  barberId?: string;
  action: 'add' | 'remove' | 'update' | 'complete';
  data: any;
}

interface BarberStatusUpdate {
  barbershopId: string;
  barberId: string;
  isAvailable: boolean;
}

interface BarbershopStatusUpdate {
  barbershopId: string;
  isOpen: boolean;
}

// Função para inicializar o serviço de socket
export const initializeSocketService = (io: Server) => {
  // Middleware para autenticação de socket (opcional)
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }
    // Aqui você pode verificar o token JWT se necessário
    next();
  });

  // Conexão de socket
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Entrar em uma sala específica da barbearia
    socket.on('join-barbershop', (barbershopId: string) => {
      socket.join(`barbershop-${barbershopId}`);
      console.log(`Client ${socket.id} joined barbershop-${barbershopId}`);
    });

    // Atualização da fila
    socket.on('queue-update', async (data: QueueUpdate) => {
      try {
        // Aqui você pode atualizar o banco de dados se necessário
        // Emitir atualização para todos os clientes na sala da barbearia
        io.to(`barbershop-${data.barbershopId}`).emit('queue-updated', data);
      } catch (error) {
        console.error('Error updating queue:', error);
      }
    });

    // Atualização do status do barbeiro
    socket.on('barber-status-update', async (data: BarberStatusUpdate) => {
      try {
        // Atualizar o status do barbeiro no banco de dados
        await prisma.barber.update({
          where: { id: data.barberId },
          data: { isAvailable: data.isAvailable }
        });

        // Emitir atualização para todos os clientes na sala da barbearia
        io.to(`barbershop-${data.barbershopId}`).emit('barber-status-updated', data);
      } catch (error) {
        console.error('Error updating barber status:', error);
      }
    });

    // Atualização do status da barbearia
    socket.on('barbershop-status-update', async (data: BarbershopStatusUpdate) => {
      try {
        // Atualizar o status da barbearia no banco de dados
        await prisma.barbershop.update({
          where: { id: data.barbershopId },
          data: { isOpen: data.isOpen }
        });

        // Emitir atualização para todos os clientes na sala da barbearia
        io.to(`barbershop-${data.barbershopId}`).emit('barbershop-status-updated', data);
      } catch (error) {
        console.error('Error updating barbershop status:', error);
      }
    });

    // Desconexão
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  return io;
};
