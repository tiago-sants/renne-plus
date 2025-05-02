import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

// Interface para o payload do token JWT
interface JwtPayload {
  id: string;
  email: string;
  role: string;
}

// Interface para estender o objeto Request do Express
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

// Middleware para autenticar tokens JWT
export const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: 'Token de autenticação não fornecido' });
  }

  // Verifica se o cabeçalho segue o formato 'Bearer <token>'
  const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    return res.status(401).json({ message: 'Token malformado ou ausente' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret', (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Token inválido ou expirado' });
    }

    req.user = user as JwtPayload;
    next();
  });
};

// Middleware para verificar permissões de administrador
export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.user && req.user.role === 'ADMIN') {
    next();
  } else {
    res.status(403).json({ message: 'Acesso negado: permissão de administrador necessária' });
  }
};

// Middleware para verificar permissões de barbeiro
export const isBarber = (req: Request, res: Response, next: NextFunction) => {
  if (req.user && (req.user.role === 'BARBER' || req.user.role === 'ADMIN')) {
    next();
  } else {
    res.status(403).json({ message: 'Acesso negado: permissão de barbeiro necessária' });
  }
};

// Middleware para verificar permissões de cliente
export const isClient = (req: Request, res: Response, next: NextFunction) => {
  if (req.user && (req.user.role === 'CLIENT' || req.user.role === 'BARBER' || req.user.role === 'ADMIN')) {
    next();
  } else {
    res.status(403).json({ message: 'Acesso negado: permissão de cliente necessária' });
  }
};
