import express from 'express';
import { body } from 'express-validator';
import * as appointmentController from '../controllers/appointment.controller';
import { authenticateJWT, isClient, isBarber } from '../middlewares/auth.middleware';

const router = express.Router();

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

// Rotas para clientes
router.get('/client', authenticateJWT, isClient, appointmentController.getClientAppointments);
router.post('/', authenticateJWT, isClient, createAppointmentValidation, appointmentController.createAppointment);
router.put('/:id/rate', authenticateJWT, isClient, rateAppointmentValidation, appointmentController.rateAppointment);

// Rotas para barbeiros
router.get('/barber', authenticateJWT, isBarber, appointmentController.getBarberAppointments);
router.put('/:id/status', authenticateJWT, updateStatusValidation, appointmentController.updateAppointmentStatus);

// Rotas públicas
router.get('/availability', appointmentController.checkAvailability);

export default router;
