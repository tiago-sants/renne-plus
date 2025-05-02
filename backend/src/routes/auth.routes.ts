import express from 'express';
import { body } from 'express-validator';
import * as authController from '../controllers/auth.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';

const router = express.Router();

// Validação para registro
const registerValidation = [
  body('name').notEmpty().withMessage('Nome é obrigatório'),
  body('email').isEmail().withMessage('E-mail inválido'),
  body('password').isLength({ min: 6 }).withMessage('Senha deve ter pelo menos 6 caracteres'),
  body('phone').optional()
];

// Validação para login
const loginValidation = [
  body('email').isEmail().withMessage('E-mail inválido'),
  body('password').notEmpty().withMessage('Senha é obrigatória')
];

// Rotas públicas
router.post('/register', registerValidation, authController.register);
router.post('/login', loginValidation, authController.login);

// Rotas protegidas
router.get('/profile', authenticateJWT, authController.getProfile);
router.put('/profile', authenticateJWT, authController.updateProfile);
router.get('/verify-token', authenticateJWT, authController.verifyToken);

export default router;
