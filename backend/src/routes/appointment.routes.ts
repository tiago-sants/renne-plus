import express from 'express';
import { body } from 'express-validator';
import * as appointmentController from '../controllers/appointment.controller';
import { authenticateJWT, isClient, isBarber } from '../middlewares/auth.middleware';

const publicRouter = express.Router();
const protectedRouter = express.Router();

// --- Rotas Públicas ---
publicRouter.get('/availability', appointmentController.checkAvailability);

// --- Rotas Protegidas ---

// Validação para criação de agendamento
const createAppointmentValidation = [
  body('date').isDate().withMessage('Data inválida'),
  body('time').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Formato de hora inválido (HH:MM)'),
  body('barberId').isUUID().withMessage('ID do barbeiro inválido'),
  body('serviceId').isUUID().withMessage('ID do serviço inválido'),
  body('barbershopId').isUUID().withMessage('ID da barbearia inválido'),
  body('notes').optional()
];

// Validação para atualização de status
const updateStatusValidation = [
  body('status').isIn(['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED']).withMessage('Status inválido')
];

// Validação para avaliação
const rateAppointmentValidation = [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Avaliação deve ser um número entre 1 e 5'),
  body('comment').optional()
];

// Rotas para clientes (protegidas)
protectedRouter.get('/client', authenticateJWT, isClient, appointmentController.getClientAppointments);
protectedRouter.post('/', authenticateJWT, isClient, createAppointmentValidation, appointmentController.createAppointment);
protectedRouter.put('/:id/rate', authenticateJWT, isClient, rateAppointmentValidation, appointmentController.rateAppointment);

// Rotas para barbeiros (protegidas)
protectedRouter.get('/barber', authenticateJWT, isBarber, appointmentController.getBarberAppointments);
protectedRouter.put('/:id/status', authenticateJWT, updateStatusValidation, appointmentController.updateAppointmentStatus);
// OBS: O middleware authenticateJWT já é aplicado globalmente em index.ts para estas rotas, 
// então pode ser removido daqui se preferir, mas mantê-lo não causa problema.

export { publicRouter as appointmentPublicRoutes, protectedRouter as appointmentProtectedRoutes };
