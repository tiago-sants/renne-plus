import { Server, Socket } from 'socket.io';

let ioInstance: Server | null = null; // Variável para guardar a instância

export const initializeSocketService = (io: Server) => {
  ioInstance = io; // Guarda a instância quando inicializada

  io.on('connection', (socket: Socket) => {
    console.log('Client connected:', socket.id);

    // Exemplo: Entrar em uma sala específica (ex: por barbearia)
    socket.on('join_barbershop_room', (barbershopId: string) => {
      socket.join(barbershopId);
      console.log(`Socket ${socket.id} joined room ${barbershopId}`);
    });

    // Exemplo: Sair de uma sala
    socket.on('leave_barbershop_room', (barbershopId: string) => {
      socket.leave(barbershopId);
      console.log(`Socket ${socket.id} left room ${barbershopId}`);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });

    // Adicione outros listeners de eventos do socket aqui, se necessário
  });
};

// Exporta a instância para ser usada em outros lugares (como controllers)
export const getIoInstance = (): Server => {
  if (!ioInstance) {
    throw new Error('Socket.IO não foi inicializado!');
  }
  return ioInstance;
};

