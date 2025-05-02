import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { validationResult } from 'express-validator';

const prisma = new PrismaClient();

// Interfaces para tipagem
interface CreateAppointmentRequest {
  date: string;
  time: string;
  barberId: string;
  serviceId: string;
  barbershopId: string;
  notes?: string;
}

interface UpdateAppointmentStatusRequest {
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
}

interface RateAppointmentRequest {
  rating: number;
  comment?: string;
}

// Obter todos os agendamentos do cliente logado
export const getClientAppointments = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Usuário não autenticado' });
    }
    
    const clientId = req.user.id;
    const status = req.query.status as string | undefined;

    let whereClause: any = { clientId };
    
    // Filtrar por status se fornecido
    if (status) {
      whereClause.status = status;
    }

    const appointments = await prisma.appointment.findMany({
      where: whereClause,
      include: {
        service: {
          select: {
            id: true,
            name: true,
            price: true,
            duration: true
          }
        },
        barber: {
          select: {
            id: true,
            specialties: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        barbershop: {
          select: {
            id: true,
            name: true,
            address: true
          }
        }
      },
      orderBy: [
        { date: 'desc' },
        { time: 'asc' }
      ]
    });

    res.status(200).json({ appointments });
  } catch (error) {
    console.error('Erro ao obter agendamentos do cliente:', error);
    res.status(500).json({ message: 'Erro ao obter agendamentos', error: (error as Error).message });
  }
};

// Obter todos os agendamentos do barbeiro logado
export const getBarberAppointments = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Usuário não autenticado' });
    }
    
    const userId = req.user.id;
    const date = req.query.date as string | undefined;
    const status = req.query.status as string | undefined;

    // Encontrar o barbeiro pelo ID do usuário
    const barber = await prisma.barber.findFirst({
      where: { userId }
    });
    
    if (!barber) {
      return res.status(404).json({ message: 'Barbeiro não encontrado' });
    }

    let whereClause: any = { barberId: barber.id };
    
    // Filtrar por data se fornecida
    if (date) {
      whereClause.date = new Date(date);
    }
    
    // Filtrar por status se fornecido
    if (status) {
      whereClause.status = status;
    }

    const appointments = await prisma.appointment.findMany({
      where: whereClause,
      include: {
        service: {
          select: {
            id: true,
            name: true,
            price: true,
            duration: true
          }
        },
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
        barbershop: {
          select: {
            id: true,
            name: true,
            address: true
          }
        }
      },
      orderBy: [
        { date: 'asc' },
        { time: 'asc' }
      ]
    });

    res.status(200).json({ appointments });
  } catch (error) {
    console.error('Erro ao obter agendamentos do barbeiro:', error);
    res.status(500).json({ message: 'Erro ao obter agendamentos', error: (error as Error).message });
  }
};

// Criar novo agendamento
export const createAppointment = async (req: Request, res: Response) => {
  try {
    // Verificar erros de validação
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (!req.user) {
      return res.status(401).json({ message: 'Usuário não autenticado' });
    }

    const { date, time, barberId, serviceId, barbershopId, notes }: CreateAppointmentRequest = req.body;
    const clientId = req.user.id;

    // Verificar se o serviço existe
    const service = await prisma.service.findUnique({
      where: { id: serviceId }
    });
    
    if (!service) {
      return res.status(404).json({ message: 'Serviço não encontrado' });
    }

    // Verificar se o barbeiro existe
    const barber = await prisma.barber.findUnique({
      where: { id: barberId }
    });
    
    if (!barber) {
      return res.status(404).json({ message: 'Barbeiro não encontrado' });
    }

    // Verificar se a barbearia existe
    const barbershop = await prisma.barbershop.findUnique({
      where: { id: barbershopId }
    });
    
    if (!barbershop) {
      return res.status(404).json({ message: 'Barbearia não encontrada' });
    }

    // Verificar disponibilidade do horário
    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        barberId,
        date: new Date(date),
        time,
        status: {
          not: 'CANCELLED'
        }
      }
    });

    if (existingAppointment) {
      return res.status(400).json({ message: 'Horário não disponível' });
    }

    // Criar o agendamento
    const appointment = await prisma.appointment.create({
      data: {
        date: new Date(date),
        time,
        clientId,
        barberId,
        serviceId,
        barbershopId,
        notes,
        price: service.price,
        status: 'PENDING',
        paymentStatus: 'PENDING'
      }
    });

    // Adicionar pontos de fidelidade ao cliente se a barbearia usar o programa
    if (barbershop.usesLoyalty) {
      await prisma.user.update({
        where: { id: clientId },
        data: {
          loyaltyPoints: {
            increment: service.loyaltyPoints
          }
        }
      });
    }

    res.status(201).json({
      message: 'Agendamento criado com sucesso',
      appointment
    });
  } catch (error) {
    console.error('Erro ao criar agendamento:', error);
    res.status(500).json({ message: 'Erro ao criar agendamento', error: (error as Error).message });
  }
};

// Atualizar status do agendamento
export const updateAppointmentStatus = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Usuário não autenticado' });
    }
    
    const { id } = req.params;
    const { status }: UpdateAppointmentStatusRequest = req.body;
    const userId = req.user.id;

    // Verificar se o agendamento existe
    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        barber: {
          select: {
            id: true,
            userId: true
          }
        },
        service: {
          select: {
            id: true,
            name: true,
            loyaltyPoints: true
          }
        },
        barbershop: {
          select: {
            id: true,
            usesLoyalty: true
          }
        }
      }
    });

    if (!appointment) {
      return res.status(404).json({ message: 'Agendamento não encontrado' });
    }

    // Verificar permissão (cliente só pode cancelar, barbeiro pode atualizar qualquer status)
    if (req.user.role === 'CLIENT' && userId !== appointment.clientId) {
      return res.status(403).json({ message: 'Sem permissão para atualizar este agendamento' });
    }

    if (req.user.role === 'BARBER' && userId !== appointment.barber.userId) {
      return res.status(403).json({ message: 'Sem permissão para atualizar este agendamento' });
    }

    // Atualizar status
    const updatedAppointment = await prisma.appointment.update({
      where: { id },
      data: {
        status,
        // Se o status for 'COMPLETED', atualizar pontos de fidelidade
        ...(status === 'COMPLETED' && appointment.barbershop.usesLoyalty
          ? { loyaltyPointsEarned: appointment.service.loyaltyPoints }
          : {})
      }
    });

    res.status(200).json({
      message: 'Status do agendamento atualizado com sucesso',
      appointment: updatedAppointment
    });
  } catch (error) {
    console.error('Erro ao atualizar status do agendamento:', error);
    res.status(500).json({ message: 'Erro ao atualizar status do agendamento', error: (error as Error).message });
  }
};

// Avaliar agendamento concluído
export const rateAppointment = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Usuário não autenticado' });
    }
    
    const { id } = req.params;
    const { rating, comment }: RateAppointmentRequest = req.body;
    const clientId = req.user.id;

    // Verificar se o agendamento existe
    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        barber: true
      }
    });

    if (!appointment) {
      return res.status(404).json({ message: 'Agendamento não encontrado' });
    }

    // Verificar se o cliente é o dono do agendamento
    if (appointment.clientId !== clientId) {
      return res.status(403).json({ message: 'Sem permissão para avaliar este agendamento' });
    }

    // Verificar se o agendamento está concluído
    if (appointment.status !== 'COMPLETED') {
      return res.status(400).json({ message: 'Apenas agendamentos concluídos podem ser avaliados' });
    }

    // Verificar se o agendamento já foi avaliado
    if (appointment.rated) {
      return res.status(400).json({ message: 'Este agendamento já foi avaliado' });
    }

    // Atualizar avaliação do agendamento
    const updatedAppointment = await prisma.appointment.update({
      where: { id },
      data: {
        rated: true,
        rating,
        ratingComment: comment
      }
    });

    // Atualizar avaliação média do barbeiro
    const barber = await prisma.barber.findUnique({
      where: { id: appointment.barberId }
    });
    
    if (barber) {
      const newRatingCount = barber.ratingCount + 1;
      const newRating = ((barber.rating * barber.ratingCount) + rating) / newRatingCount;
      
      await prisma.barber.update({
        where: { id: appointment.barberId },
        data: {
          rating: newRating,
          ratingCount: newRatingCount
        }
      });
    }

    res.status(200).json({
      message: 'Agendamento avaliado com sucesso',
      appointment: updatedAppointment
    });
  } catch (error) {
    console.error('Erro ao avaliar agendamento:', error);
    res.status(500).json({ message: 'Erro ao avaliar agendamento', error: (error as Error).message });
  }
};

// Verificar disponibilidade de horários
export const checkAvailability = async (req: Request, res: Response) => {
  try {
    const barberId = req.query.barberId as string;
    const date = req.query.date as string;

    if (!barberId || !date) {
      return res.status(400).json({ message: 'Barbeiro e data são obrigatórios' });
    }

    // Verificar se o barbeiro existe
    const barber = await prisma.barber.findUnique({
      where: { id: barberId }
    });
    
    if (!barber) {
      return res.status(404).json({ message: 'Barbeiro não encontrado' });
    }

    // Obter todos os agendamentos do barbeiro na data especificada
    const appointments = await prisma.appointment.findMany({
      where: {
        barberId,
        date: new Date(date),
        status: {
          not: 'CANCELLED'
        }
      },
      select: {
        time: true
      },
      orderBy: {
        time: 'asc'
      }
    });

    // Obter os horários ocupados
    const bookedTimes = appointments.map(appointment => appointment.time);

    // Obter o dia da semana (0 = domingo, 1 = segunda, etc.)
    const dayOfWeek = new Date(date).getDay();
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayName = days[dayOfWeek];

    // Verificar se o barbeiro trabalha neste dia
    const workingHours = barber.workingHours as any;
    if (!workingHours[dayName] || !workingHours[dayName].active) {
      return res.status(200).json({
        available: false,
        message: 'O barbeiro não trabalha neste dia',
        availableTimes: []
      });
    }

    // Gerar horários disponíveis com base no horário de trabalho do barbeiro
    const startTime = workingHours[dayName].start;
    const endTime = workingHours[dayName].end;
    
    // Converter para minutos para facilitar o cálculo
    const startMinutes = parseInt(startTime.split(':')[0]) * 60 + parseInt(startTime.split(':')[1]);
    const endMinutes = parseInt(endTime.split(':')[0]) * 60 + parseInt(endTime.split(':')[1]);
    
    // Intervalo de 30 minutos entre agendamentos
    const interval = 30;
    const availableTimes = [];
    
    for (let i = startMinutes; i < endMinutes; i += interval) {
      const hours = Math.floor(i / 60).toString().padStart(2, '0');
      const minutes = (i % 60).toString().padStart(2, '0');
      const timeSlot = `${hours}:${minutes}`;
      
      // Verificar se o horário não está ocupado
      if (!bookedTimes.includes(timeSlot)) {
        availableTimes.push(timeSlot);
      }
    }

    res.status(200).json({
      available: availableTimes.length > 0,
      availableTimes
    });
  } catch (error) {
    console.error('Erro ao verificar disponibilidade:', error);
    res.status(500).json({ message: 'Erro ao verificar disponibilidade', error: (error as Error).message });
  }
};
