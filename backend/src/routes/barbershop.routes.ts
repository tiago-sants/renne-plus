import express from 'express';
import { body } from 'express-validator';
import * as barbershopController from '../controllers/barbershop.controller';
// Importar middleware de autenticação/autorização apropriado
// Ex: verificar se usuário está logado e tem permissão para criar barbearia
// import { authenticateJWT, canCreateBarbershop } from '../middlewares/auth.middleware'; 

const router = express.Router();

// --- Validações ---
const createBarbershopValidation = [
  body('name').notEmpty().withMessage('Nome da barbearia é obrigatório'),
  body('address').notEmpty().withMessage('Endereço é obrigatório'),
  body('city').notEmpty().withMessage('Cidade é obrigatória'),
  body('state').notEmpty().withMessage('Estado é obrigatório'),
  body('zipCode').notEmpty().withMessage('CEP é obrigatório'),
  // Adicionar validações para telefone, horário de funcionamento, etc. se necessário
];

// --- Rotas ---

// Rota para CRIAR uma nova barbearia
// Aplicar middlewares: autenticar e verificar permissão
router.post(
  '/', 
  // authenticateJWT, // Garantir que está logado
  // canCreateBarbershop, // Garantir que tem permissão (criaremos/ajustaremos)
  createBarbershopValidation, 
  barbershopController.createBarbershop
);

// TODO: Adicionar rota para buscar detalhes de UMA barbearia (pública?)
// router.get('/:id', barbershopController.getBarbershopById);

// TODO: Adicionar rota para LISTAR barbearias (pública? com filtros?)
// router.get('/', barbershopController.listPublicBarbershops);

// TODO: Adicionar rotas para o DONO gerenciar a barbearia (atualizar dados, etc.)
// router.put('/:id', authenticateJWT, isOwner, updateBarbershopValidation, barbershopController.updateBarbershop);

export default router;
