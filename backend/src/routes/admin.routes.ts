import express from 'express';
import * as adminController from '../controllers/admin.controller';
// Importar middleware de verificação de admin (criaremos/ajustaremos depois)
import { isAdmin } from '../middlewares/auth.middleware';

const router = express.Router();

// Aplicar middleware isAdmin a todas as rotas admin
router.use(isAdmin);

// --- Rotas Admin ---

// Exemplo: Listar todos os usuários
router.get('/users', adminController.listUsers);

// Exemplo: Listar todas as barbearias
router.get('/barbershops', adminController.listBarbershops);

// Exemplo: Obter estatísticas gerais
router.get('/stats', adminController.getStats);

// TODO: Adicionar rotas para gerenciar usuários (ativar/desativar, mudar role)
// TODO: Adicionar rotas para gerenciar barbearias (aprovar, suspender)
// TODO: Adicionar rotas para configurações do sistema

export default router;
