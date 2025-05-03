import express from 'express';
import { body, param } from 'express-validator';
import * as queueController from '../controllers/queue.controller';
import { authenticateJWT, isClient, isBarber } from '../middlewares/auth.middleware'; // Assuming isBarber middleware exists or will be created

const router = express.Router();

// --- Validações ---
const addToQueueValidation = [
  body('barbershopId').isUUID().withMessage('ID da barbearia inválido'),
  body('barberId').isUUID().withMessage('ID do barbeiro inválido'),
  // clientId pode vir do JWT ou ser opcional se adicionado pelo barbeiro
  body('clientName').optional().isString().withMessage('Nome do cliente inválido'),
  body('clientPhone').optional().isString().withMessage('Telefone do cliente inválido'),
  body('notes').optional().isString()
];

const updateStatusValidation = [
  param('id').isUUID().withMessage('ID da entrada na fila inválido'),
  body('status').isIn(['WAITING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).withMessage('Status inválido')
];

const queueIdParamValidation = [
  param('id').isUUID().withMessage('ID da entrada na fila inválido')
];

// --- Rotas ---

// Adicionar alguém à fila (Cliente logado ou Barbeiro adicionando)
// Se cliente logado, clientId vem do req.user. Se barbeiro, pode adicionar cliente anônimo
router.post('/', authenticateJWT, addToQueueValidation, queueController.addToQueue);

// Obter a fila de uma barbearia/barbeiro
// Query params opcionais: barbershopId, barberId, status
router.get('/', authenticateJWT, queueController.getQueue);

// Atualizar o status de uma entrada na fila (Barbeiro)
// TODO: Adicionar verificação se o usuário é o barbeiro correto ou admin
router.put('/:id/status', authenticateJWT, /* isBarber, */ updateStatusValidation, queueController.updateQueueStatus);

// Remover uma entrada da fila (Cliente pode remover a própria, Barbeiro pode remover qualquer uma da sua fila)
// TODO: Adicionar verificação de permissão
router.delete('/:id', authenticateJWT, queueIdParamValidation, queueController.removeFromQueue);

export default router;