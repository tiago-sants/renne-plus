'use client';

import React, { useState, useEffect } from 'react'; // Import useEffect
import { useQuery, useQueryClient } from '@tanstack/react-query'; // Import useQueryClient
import { useAuth } from '@/components/providers/auth-provider';
import { useSocket } from '@/components/providers/socket-provider'; // Import useSocket
import { FiUsers, FiClock, FiLoader } from 'react-icons/fi';

// Função para buscar a entrada do cliente na fila
const fetchClientQueueEntry = async (token: string | null, barbershopId: string, userId: string | undefined) => {
  if (!token) throw new Error('Usuário não autenticado');
  if (!userId) throw new Error('ID do usuário não encontrado'); // Precisa do ID para filtrar

  // Busca a fila da barbearia filtrando por status ativos
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/queue?barbershopId=${barbershopId}&status=WAITING&status=IN_PROGRESS`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || 'Erro ao buscar fila');
  }

  const queue: any[] = await res.json();
  // Encontra a entrada específica do cliente logado
  const clientEntry = queue.find(entry => entry.clientId === userId);

  // Se encontrou a entrada, calcula a posição real na fila de espera
  if (clientEntry) {
    const waitingQueue = queue.filter(entry => entry.status === 'WAITING' || entry.status === 'IN_PROGRESS');
    // Ordena por posição para garantir a contagem correta
    waitingQueue.sort((a, b) => a.position - b.position);
    const clientIndex = waitingQueue.findIndex(entry => entry.id === clientEntry.id);
    // A posição visual é o índice + 1
    clientEntry.displayPosition = clientIndex + 1;
  }

  return clientEntry; // Retorna a entrada do cliente (ou null se não encontrado)
};

interface ClientQueueViewProps {
  barbershopId: string;
}

const ClientQueueView: React.FC<ClientQueueViewProps> = ({ barbershopId }) => {
  const { token, isAuthenticated, user } = useAuth();
  const { socket } = useSocket(); // Obtém o socket do provider
  const queryClient = useQueryClient(); // Obtém o queryClient

  const queryKey = ['clientQueueEntry', barbershopId, user?.id, token]; // Define a queryKey

  const { data: queueEntry, isLoading, error } = useQuery({
    queryKey: queryKey, // Usa a queryKey definida
    queryFn: () => fetchClientQueueEntry(token, barbershopId, user?.id),
    enabled: isAuthenticated && !!barbershopId && !!user?.id,
    // Remove refetchInterval: 30000, // Não precisamos mais de polling!
  });

  // --- EFEITO PARA SOCKET.IO --- 
  useEffect(() => {
    if (!socket || !isAuthenticated || !barbershopId) return; // Só executa se tiver socket, logado e barbershopId

    // Entra na sala da barbearia ao montar o componente
    console.log(`ClientQueueView: Joining room ${barbershopId}`);
    socket.emit('join_barbershop_room', barbershopId);

    // Define o listener para o evento 'queue_updated'
    const handleQueueUpdate = (data: { barbershopId: string; barberId: string }) => {
      console.log("ClientQueueView: Received 'queue_updated' event", data);
      // Verifica se a atualização é para esta barbearia
      if (data.barbershopId === barbershopId) {
        console.log("ClientQueueView: Queue update matches current barbershop. Invalidating query.");
        // Invalida a query para forçar o refetch dos dados
        queryClient.invalidateQueries({ queryKey: queryKey });
      }
    };

    socket.on('queue_updated', handleQueueUpdate);

    // Função de limpeza: remove o listener e sai da sala ao desmontar
    return () => {
      console.log(`ClientQueueView: Leaving room ${barbershopId}`);
      socket.emit('leave_barbershop_room', barbershopId);
      socket.off('queue_updated', handleQueueUpdate);
    };

  }, [socket, isAuthenticated, barbershopId, queryClient, JSON.stringify(queryKey)]);

  // TODO: Implementar useEffect para ouvir Socket.IO e chamar refetch() em 'queue_updated'

  if (!isAuthenticated) {
    return <p className="text-center text-muted-foreground">Faça login para ver sua posição na fila.</p>;
  }

  if (!barbershopId) {
     return <p className="text-center text-muted-foreground">Barbearia não especificada.</p>;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center space-x-2 p-4">
        <FiLoader className="animate-spin h-5 w-5 text-primary" />
        <span>Carregando sua posição na fila...</span>
      </div>
    );
  }

  if (error) {
    return <p className="text-center text-red-500">Erro ao buscar sua posição: {(error as Error).message}</p>;
  }

  if (!queueEntry) {
    return (
        <div className="bg-card border border-border rounded-lg p-6 shadow-md text-center">
            <p className="text-muted-foreground mb-4">Você não está na fila desta barbearia.</p>
            {/* TODO: Adicionar botão/link para entrar na fila */}
            {/* <button className="...">Entrar na Fila</button> */}
        </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-md">
      <h3 className="text-lg font-semibold mb-4 text-center">Sua Vez na Fila</h3>
      <div className="flex flex-col items-center space-y-3">
        <div className="flex items-center text-muted-foreground">
          <FiUsers className="mr-2 h-5 w-5" />
          <span>Posição Atual:</span>
          {/* Usa a displayPosition calculada */}
          <span className="font-bold text-primary text-xl ml-2">{queueEntry.displayPosition}º</span>
        </div>
        <div className="flex items-center text-muted-foreground">
          <FiClock className="mr-2 h-5 w-5" />
          <span>Espera Estimada:</span>
          <span className="font-bold text-primary text-lg ml-2">
            {queueEntry.estimatedWaitTime > 0 ? `${queueEntry.estimatedWaitTime} min` : 'Logo será atendido'}
          </span>
        </div>
        <div className="text-sm text-muted-foreground mt-2">
          Barbeiro: {queueEntry.barber?.user?.name || 'N/A'}
        </div>
        {queueEntry.status === 'IN_PROGRESS' && (
           <div className="mt-3 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
             Em atendimento
           </div>
        )}
         {queueEntry.status === 'WAITING' && queueEntry.displayPosition === 1 && (
           <div className="mt-3 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
             Você é o próximo!
           </div>
        )}
      </div>
      {/* TODO: Adicionar botão para sair da fila */}
      {/* <button className="mt-4 w-full text-sm text-red-600 hover:text-red-800">Sair da Fila</button> */}
    </div>
  );
};

export default ClientQueueView;
