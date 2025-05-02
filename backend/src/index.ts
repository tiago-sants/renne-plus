import express, { Express } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import http from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';

// Carrega variáveis de ambiente
dotenv.config();

// Importa rotas
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import barberRoutes from './routes/barber.routes';
import appointmentRoutes from './routes/appointment.routes';
import queueRoutes from './routes/queue.routes';
import paymentRoutes from './routes/payment.routes';
import adminRoutes from './routes/admin.routes';

// Importa middleware de autenticação
import { authenticateJWT } from './middlewares/auth.middleware';

// Importa serviço de socket
import { initializeSocketService } from './services/socket.service';

// Inicializa o app Express
const app: Express = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://frontend:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Rotas públicas
app.use('/api/auth', authRoutes);

// Rotas protegidas
app.use('/api/users', authenticateJWT, userRoutes);
app.use('/api/barbers', authenticateJWT, barberRoutes);
app.use('/api/appointments', authenticateJWT, appointmentRoutes);
app.use('/api/queue', authenticateJWT, queueRoutes);
app.use('/api/payments', authenticateJWT, paymentRoutes);
app.use('/api/admin', authenticateJWT, adminRoutes);

// Rota de saúde
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'renne-plus API is running' });
});

// Inicializa o serviço de socket
initializeSocketService(io);

// Porta
const PORT = process.env.PORT || 3001;

// Inicia o servidor
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export { app, server };
