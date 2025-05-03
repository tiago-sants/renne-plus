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
import { body, param } from 'express-validator';
import * as userController from '../controllers/user.controller'; 

const router = express.Router();

// Teste público: criar usuário com validação
router.post('/', validateRegisterData, createUser);

// Rota protegida de exemplo
router.get('/', authenticateJWT, (req, res) => {
  res.status(200).json({ message: 'User routes working' });
});

// Rota para obter o perfil do usuário logado (exemplo)
router.get('/me', userController.getMe); 

// Rota NOVA para obter o perfil de barbeiro do usuário logado
router.get('/me/barber-profile', userController.getMyBarberProfile);

export default router;

