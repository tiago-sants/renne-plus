import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Listar todos os usuários (com paginação básica)
export const listUsers = async (req: Request, res: Response) => {
  // TODO: Implementar verificação isAdmin via middleware
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const skip = (page - 1) * limit;

  try {
    const users = await prisma.user.findMany({
      skip: skip,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
      // Não incluir senha no retorno
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        // Adicionar outros campos se necessário, exceto senha
      },
    });

    const totalUsers = await prisma.user.count();

    res.status(200).json({
      data: users,
      total: totalUsers,
      page,
      limit,
      totalPages: Math.ceil(totalUsers / limit),
    });
  } catch (error) {
    console.error('Erro ao listar usuários (admin):', error);
    res.status(500).json({ message: 'Erro interno ao listar usuários.', error: (error as Error).message });
  }
};

// Listar todas as barbearias (com paginação básica)
export const listBarbershops = async (req: Request, res: Response) => {
  // TODO: Implementar verificação isAdmin via middleware
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const skip = (page - 1) * limit;

  try {
    const barbershops = await prisma.barbershop.findMany({
      skip: skip,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        owner: { // Inclui dados básicos do proprietário
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        _count: { // Conta quantos barbeiros e serviços tem
          select: { barbers: true, services: true }
        }
      }
    });

    const totalBarbershops = await prisma.barbershop.count();

    res.status(200).json({
      data: barbershops,
      total: totalBarbershops,
      page,
      limit,
      totalPages: Math.ceil(totalBarbershops / limit),
    });
  } catch (error) {
    console.error('Erro ao listar barbearias (admin):', error);
    res.status(500).json({ message: 'Erro interno ao listar barbearias.', error: (error as Error).message });
  }
};

// Obter estatísticas gerais (exemplo)
export const getStats = async (req: Request, res: Response) => {
  // TODO: Implementar verificação isAdmin via middleware
  try {
    const totalUsers = await prisma.user.count();
    const totalBarbershops = await prisma.barbershop.count();
    const totalAppointments = await prisma.appointment.count();
    const totalQueueEntries = await prisma.queueentry.count(); // Total histórico

    // Poderia adicionar mais estatísticas: agendamentos hoje, receita (se houver), etc.

    res.status(200).json({
      totalUsers,
      totalBarbershops,
      totalAppointments,
      totalQueueEntries,
      // Adicionar outras estatísticas aqui
    });
  } catch (error) {
    console.error('Erro ao obter estatísticas (admin):', error);
    res.status(500).json({ message: 'Erro interno ao obter estatísticas.', error: (error as Error).message });
  }
};

// TODO: Implementar funções para gerenciar usuários (ativar/desativar, mudar role)
// TODO: Implementar funções para gerenciar barbearias (aprovar, suspender)

