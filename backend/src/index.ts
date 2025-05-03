import express, { Express } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import http from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';

// Carrega variáveis de ambiente
dotenv.config() ;

// Importa rotas
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import barberRoutes from './routes/barber.routes';
// Importa os routers separados de appointments
import { appointmentPublicRoutes, appointmentProtectedRoutes } from './routes/appointment.routes'; 
import queueRoutes from './routes/queue.routes';
import paymentRoutes from './routes/payment.routes';
import adminRoutes from './routes/admin.routes';
import barbershopRoutes from './routes/barbershop.routes';

// Importa middleware de autenticação
import { authenticateJWT } from './middlewares/auth.middleware';

// Importa serviço de socket
import { initializeSocketService } from './services/socket.service';

// Inicializa o app Express
const app: Express = express();
const server = http.createServer(app) ;
const io = new Server(server, {
  cors: {
    // Ajuste a origem conforme necessário para seu ambiente de desenvolvimento/produção
    origin: process.env.FRONTEND_URL || 'http://localhost:3000', 
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Adicione outros métodos se necessário
    credentials: true
  }
}) ;

// Middleware
app.use(cors({ 
    origin: process.env.FRONTEND_URL || 'http://localhost:3000', 
    credentials: true 
}) );
app.use(express.json());
app.use(morgan('dev'));

// --- Rotas Públicas ---
// Rotas que não exigem autenticação devem vir ANTES do app.use(authenticateJWT)
app.use('/api/auth', authRoutes);
app.use('/api/appointments', appointmentPublicRoutes); // Rotas públicas de appointments (ex: /availability)
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'renne-plus API is running' });
});

// --- Middleware de Autenticação Global ---
// Todas as rotas definidas ABAIXO desta linha exigirão um token JWT válido
app.use(authenticateJWT);

// --- Rotas Protegidas ---
app.use('/api/users', userRoutes);
app.use('/api/barbers', barberRoutes);
app.use('/api/appointments', appointmentProtectedRoutes); // Rotas protegidas de appointments
app.use('/api/queue', queueRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/queue', queueRoutes);
app.use('/api/barbershops', barbershopRoutes);

// Inicializa o serviço de socket
initializeSocketService(io);

// Porta
const PORT = process.env.PORT || 3001;

// Inicia o servidor
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export { app, server };
