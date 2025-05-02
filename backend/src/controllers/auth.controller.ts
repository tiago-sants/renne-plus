import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';

const prisma = new PrismaClient();

// Interfaces para tipagem
interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role?: 'CLIENT' | 'BARBER' | 'ADMIN';
}

interface LoginRequest {
  email: string;
  password: string;
}

interface UpdateProfileRequest {
  name?: string;
  phone?: string;
  password?: string;
}

// Registro de novo usuário
export const register = async (req: Request, res: Response) => {
  try {
    // Verificar erros de validação
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, phone, role }: RegisterRequest = req.body;

    // Verificar se o usuário já existe
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    
    if (existingUser) {
      return res.status(400).json({ message: 'Este e-mail já está em uso' });
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Criar novo usuário
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone,
        role: role || 'CLIENT' // Padrão é cliente
      }
    });

    // Gerar token JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as jwt.SignOptions
    );

    // Retornar dados do usuário (sem a senha) e token
    const { password: _, ...userData } = user;

    res.status(201).json({
      message: 'Usuário registrado com sucesso',
      user: userData,
      token
    });
  } catch (error) {
    console.error('Erro ao registrar usuário:', error);
    res.status(500).json({ message: 'Erro ao registrar usuário', error: (error as Error).message });
  }
};

// Login de usuário
export const login = async (req: Request, res: Response) => {
  try {
    // Verificar erros de validação
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password }: LoginRequest = req.body;

    // Buscar usuário pelo e-mail
    const user = await prisma.user.findUnique({
      where: { email }
    });
    
    if (!user) {
      return res.status(401).json({ message: 'E-mail ou senha inválidos' });
    }

    // Verificar se o usuário está ativo
    if (!user.active) {
      return res.status(401).json({ message: 'Conta desativada. Entre em contato com o suporte.' });
    }

    // Verificar senha
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'E-mail ou senha inválidos' });
    }

    // Gerar token JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as jwt.SignOptions
    );

    // Retornar dados do usuário (sem a senha) e token
    const { password: _, ...userData } = user;

    res.status(200).json({
      message: 'Login realizado com sucesso',
      user: userData,
      token
    });
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    res.status(500).json({ message: 'Erro ao fazer login', error: (error as Error).message });
  }
};

// Obter perfil do usuário atual
export const getProfile = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Usuário não autenticado' });
    }
    
    const userId = req.user.id;

    // Buscar usuário pelo ID
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        active: true,
        loyaltyPoints: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error('Erro ao obter perfil do usuário:', error);
    res.status(500).json({ message: 'Erro ao obter perfil do usuário', error: (error as Error).message });
  }
};

// Atualizar perfil do usuário
export const updateProfile = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Usuário não autenticado' });
    }
    
    const userId = req.user.id;
    const { name, phone, password }: UpdateProfileRequest = req.body;

    // Preparar dados para atualização
    const updateData: any = {};
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (password) updateData.password = await bcrypt.hash(password, 10);

    // Atualizar usuário
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        active: true,
        loyaltyPoints: true,
        createdAt: true,
        updatedAt: true
      }
    });

    res.status(200).json({
      message: 'Perfil atualizado com sucesso',
      user: updatedUser
    });
  } catch (error) {
    console.error('Erro ao atualizar perfil do usuário:', error);
    res.status(500).json({ message: 'Erro ao atualizar perfil do usuário', error: (error as Error).message });
  }
};

// Verificar token JWT
export const verifyToken = (req: Request, res: Response) => {
  // Se chegou aqui, o token é válido (verificado pelo middleware authenticateJWT)
  if (!req.user) {
    return res.status(401).json({ message: 'Usuário não autenticado' });
  }
  
  res.status(200).json({
    message: 'Token válido',
    user: {
      id: req.user.id,
      email: req.user.email,
      role: req.user.role
    }
  });
};
