import { Request, Response } from 'express';
import { PrismaClient, UserRole } from '@prisma/client';
import { validationResult } from 'express-validator';

const prisma = new PrismaClient();

// Criar uma nova barbearia
export const createBarbershop = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  // 1. Verificar Autenticação (Middleware authenticateJWT deve ter rodado antes)
  if (!req.user) {
    return res.status(401).json({ message: 'Usuário não autenticado' });
  }

  // 2. Verificar Permissão para Criar
  //    Aqui, vamos assumir que QUALQUER usuário logado pode criar UMA barbearia
  //    se ele ainda não for dono de uma. Poderia ser uma role específica também.
  const userId = req.user.id;
  const userRole = req.user.role;

  // Opcional: Se apenas roles específicas podem criar, descomente e ajuste:
  // if (userRole !== UserRole.CLIENT && userRole !== UserRole.BARBER) { // Exemplo: Cliente ou Barbeiro podem virar donos
  //   return res.status(403).json({ message: 'Você não tem permissão para criar uma barbearia.' });
  // }

  // Verifica se o usuário já é dono de outra barbearia
  const existingOwnedBarbershop = await prisma.barbershop.findFirst({
    where: { ownerId: userId },
  });

  if (existingOwnedBarbershop) {
    return res.status(400).json({ message: 'Você já é proprietário de uma barbearia.' });
  }

  // 3. Extrair dados do corpo da requisição
  const { name, address, city, state, zipCode, phone, description, openingHours } = req.body;

  try {
    // 4. Criar a barbearia no banco de dados
    const newBarbershop = await prisma.barbershop.create({
      data: {
        name,
        address,
        city,
        state,
        zipCode,
        phone, // Opcional
        description, // Opcional
        openingHours, // Opcional (pode ser JSON ou string formatada)
        ownerId: userId, // Associa o usuário logado como proprietário
        // Definir outros campos padrão se necessário (ex: status = PENDING_APPROVAL?)
      },
    });

    // 5. Opcional: Atualizar a role do usuário para BARBER ou OWNER?
    //    Se um CLIENTE cria uma barbearia, talvez ele deva virar BARBER automaticamente?
    //    Ou talvez exista uma role OWNER?
    // if (userRole === UserRole.CLIENT) {
    //   await prisma.user.update({
    //     where: { id: userId },
    //     data: { role: UserRole.BARBER }, // Ou UserRole.OWNER se existir
    //   });
    //   console.log(`Usuário ${userId} atualizado para role BARBER após criar barbearia.`);
    // }

    res.status(201).json(newBarbershop);

  } catch (error) {
    console.error('Erro ao criar barbearia:', error);
    res.status(500).json({ message: 'Erro interno ao criar barbearia.', error: (error as Error).message });
  }
};

// TODO: Implementar getBarbershopById
// export const getBarbershopById = async (req: Request, res: Response) => { ... };

// TODO: Implementar listPublicBarbershops
// export const listPublicBarbershops = async (req: Request, res: Response) => { ... };

// TODO: Implementar updateBarbershop (para o dono)
// export const updateBarbershop = async (req: Request, res: Response) => { ... };

