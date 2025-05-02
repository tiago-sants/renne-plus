import { Request, Response, NextFunction } from 'express';

export const validateRegisterData = (req: Request, res: Response, next: NextFunction) => {
  const { name, email, password, phone } = req.body;

  if (!name || typeof name !== 'string') {
    return res.status(400).json({ message: 'Nome é obrigatório e deve ser uma string' });
  }

  if (!email || typeof email !== 'string') {
    return res.status(400).json({ message: 'Email é obrigatório e deve ser uma string' });
  }

  if (!password || typeof password !== 'string' || password.length < 6) {
    return res.status(400).json({ message: 'Senha é obrigatória e deve ter pelo menos 6 caracteres' });
  }

  if (phone && typeof phone !== 'string') {
    return res.status(400).json({ message: 'Telefone deve ser uma string' });
  }

  next(); // tudo certo, pode continuar
};
