/*import express from 'express';
import { authenticateJWT } from '../middlewares/auth.middleware';

const router = express.Router();

// Rotas serão implementadas posteriormente
router.get('/', authenticateJWT, (req, res) => {
  res.status(200).json({ message: 'User routes working' });
});

export default router; */


import express from 'express';
import { authenticateJWT } from '../middlewares/auth.middleware';
import { createUser } from '../controllers/user.controller';
import { validateRegisterData } from '../middlewares/validateRegister.middleware';

const router = express.Router();

// Teste público: criar usuário com validação
router.post('/', validateRegisterData, createUser);

// Rota protegida de exemplo
router.get('/', authenticateJWT, (req, res) => {
  res.status(200).json({ message: 'User routes working' });
});

export default router;

