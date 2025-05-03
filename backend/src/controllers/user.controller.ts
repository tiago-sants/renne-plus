import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { validationResult } from 'express-validator'; // Se usar validações em outras funções

const prisma = new PrismaClient();

export const createUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password, phone } = req.body;

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password,
        phone // idealmente hash antes
      },
    });

    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar usuário', details: error });
  }
};

// Função NOVA para buscar o perfil de barbeiro do usuário logado
export const getMyBarberProfile = async (req: Request, res: Response) => {
  // O middleware authenticateJWT já garante que req.user existe
  if (!req.user) {
    // Esta verificação é redundante se authenticateJWT sempre for usado antes,
    // mas é uma boa prática de segurança.
    return res.status(401).json({ message: 'Usuário não autenticado' });
  }

  const userId = req.user.id;

  try {
    const barberProfile = await prisma.barber.findUnique({
      where: {
        userId: userId, // Encontra o perfil de Barbeiro pelo ID do Usuário associado
      },
      include: { // Inclui dados relacionados que podem ser úteis no frontend
        barbershop: {
          select: {
            id: true,
            name: true,
          }
        },
        // Não inclua user aqui para evitar redundância
      }
    });

    if (!barberProfile) {
      // É importante retornar 404 para o frontend saber que o perfil não existe
      return res.status(404).json({ message: 'Perfil de barbeiro não encontrado para este usuário.' });
    }

    // Retorna o perfil encontrado
    res.status(200).json(barberProfile);

  } catch (error) {
    console.error('Erro ao buscar perfil de barbeiro:', error);
    res.status(500).json({ message: 'Erro interno ao buscar perfil de barbeiro.', error: (error as Error).message });
  }
};