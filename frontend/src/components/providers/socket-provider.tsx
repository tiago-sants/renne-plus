'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './auth-provider';

// Tipos para eventos de socket
interface QueueUpdate {
  barbershopId: string;
  barberId?: string;
  action: 'add' | 'remove' | 'update' | 'complete';
  data: any;
}

interface BarberStatusUpdate {
  barbershopId: string;
  barberId: string;
  isAvailable: boolean;
}

interface BarbershopStatusUpdate {
  barbershopId: string;
  isOpen: boolean;
}

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  joinBarbershop: (barbershopId: string) => void;
  leaveBarbershop: (barbershopId: string) => void;
  updateQueue: (data: QueueUpdate) => void;
  updateBarberStatus: (data: BarberStatusUpdate) => void;
  updateBarbershopStatus: (data: BarbershopStatusUpdate) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

// API base URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { token } = useAuth();

  // Inicializar socket quando o usuário estiver autenticado
  useEffect(() => {
    if (!token) return;

    const socketInstance = io(API_URL, {
      auth: {
        token
      }
    });

    socketInstance.on('connect', () => {
      console.log('Socket conectado');
      setIsConnected(true);
    });

    socketInstance.on('disconnect', () => {
      console.log('Socket desconectado');
      setIsConnected(false);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [token]);

  // Entrar em uma sala específica da barbearia
  const joinBarbershop = (barbershopId: string) => {
    if (socket && isConnected) {
      socket.emit('join-barbershop', barbershopId);
    }
  };

  // Sair de uma sala específica da barbearia
  const leaveBarbershop = (barbershopId: string) => {
    if (socket && isConnected) {
      socket.emit('leave-barbershop', barbershopId);
    }
  };

  // Atualização da fila
  const updateQueue = (data: QueueUpdate) => {
    if (socket && isConnected) {
      socket.emit('queue-update', data);
    }
  };

  // Atualização do status do barbeiro
  const updateBarberStatus = (data: BarberStatusUpdate) => {
    if (socket && isConnected) {
      socket.emit('barber-status-update', data);
    }
  };

  // Atualização do status da barbearia
  const updateBarbershopStatus = (data: BarbershopStatusUpdate) => {
    if (socket && isConnected) {
      socket.emit('barbershop-status-update', data);
    }
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        joinBarbershop,
        leaveBarbershop,
        updateQueue,
        updateBarberStatus,
        updateBarbershopStatus
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

// Hook para usar o contexto de socket
export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket deve ser usado dentro de um SocketProvider');
  }
  return context;
};
