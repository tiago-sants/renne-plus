'use client';

import React, { useEffect } from 'react'; // Import useEffect
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'; // Import useQueryClient
import { useAuth } from '@/components/providers/auth-provider';
import { useSocket } from '@/components/providers/socket-provider'; // Import useSocket
import { FiUserCheck, FiUserX, FiChevronsRight, FiLoader, FiRefreshCw } from 'react-icons/fi';

// --- Funções API --- 
const fetchBarberQueue = async (token: string | null, barberId: string) => {
  if (!token || !barberId) throw new Error('Token ou ID do Barbeiro ausente');

  // Busca entradas com status WAITING ou IN_PROGRESS para o barbeiro específico
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/queue?barberId=${barberId}&status=WAITING&status=IN_PROGRESS`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || 'Erro ao buscar fila do barbeiro');
  }
  return res.json();
};

const updateQueueStatusAPI = async ({ token, entryId, status }: { token: string, entryId: string, status: string }) => {
  if (!token) throw new Error('Token não fornecido');
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/queue/${entryId}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || 'Erro ao atualizar status');
  }
  return res.json();
};

const removeQueueEntryAPI = async ({ token, entryId }: { token: string, entryId: string }) => {
  if (!token) throw new Error('Token não fornecido');
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/queue/${entryId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  // DELETE retorna 204 No Content
  if (!res.ok && res.status !== 204) {
    const errorData = await res.json().catch(() => ({ message: 'Erro ao remover da fila' }));
    throw new Error(errorData.message || 'Erro ao remover da fila');
  }
  return { success: true };
};

// --- Componente ---
interface BarberQueueManagementProps {
  barberId: string; // ID do perfil do barbeiro (obtido após login do barbeiro)
  barbershopId: string; // Adiciona barbershopId para entrar/sair da sala correta
}

const BarberQueueManagement: React.FC<BarberQueueManagementProps> = ({ barberId, barbershopId }) => {
  const { token, isAuthenticated, user } = useAuth();
  const { socket } = useSocket(); // Obtém o socket
  const queryClient = useQueryClient(); // Obtém o queryClient

  const queryKey = ['barberQueue', barberId, token]; // Define a queryKey

  const { data: queue = [], isLoading, error, refetch } = useQuery<any[]>({
    queryKey: queryKey, // Usa a queryKey definida
    queryFn: () => fetchBarberQueue(token, barberId),
    enabled: isAuthenticated && !!barberId && user?.role === 'BARBER',
    // Remove refetchInterval: 30000, // Não precisamos mais de polling!
  });

  const mutationOptions = {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['barberQueue', barberId, token] });
      // TODO: Emitir evento via Socket.IO para notificar clientes?
    },
    onError: (err: any) => {
      console.error("Erro na operação da fila:", err);
      alert(`Erro: ${err.message || 'Ocorreu um problema.'}`); // Usar um sistema de notificação melhor
    },
  };

  const updateStatusMutation = useMutation({
    mutationFn: updateQueueStatusAPI,
    ...mutationOptions,
  });

  const removeEntryMutation = useMutation({
    mutationFn: removeQueueEntryAPI,
    ...mutationOptions,
  });

  const handleUpdateStatus = (entryId: string, status: string) => {
    if (!token) return;
    updateStatusMutation.mutate({ token, entryId, status });
  };

  const handleRemoveEntry = (entryId: string) => {
    if (!token) return;
    // Confirmação antes de remover
    if (confirm('Tem certeza que deseja remover este cliente da fila?')) {
      removeEntryMutation.mutate({ token, entryId });
    }
  };

  // --- EFEITO PARA SOCKET.IO --- 
  useEffect(() => {
    // Só executa se tiver socket, logado, for barbeiro, e tiver IDs
    if (!socket || !isAuthenticated || user?.role !== 'BARBER' || !barberId || !barbershopId) return;

    // Entra na sala da barbearia ao montar
    console.log(`BarberQueueManagement: Joining room ${barbershopId}`);
    socket.emit('join_barbershop_room', barbershopId);

    // Define o listener para 'queue_updated'
    const handleQueueUpdate = (data: { barbershopId: string; barberId: string }) => {
      console.log("BarberQueueManagement: Received 'queue_updated' event", data);
      // Verifica se a atualização é para este barbeiro específico
      if (data.barberId === barberId) {
        console.log("BarberQueueManagement: Queue update matches current barber. Invalidating query.");
        // Invalida a query da fila do barbeiro para forçar o refetch
        queryClient.invalidateQueries({ queryKey: queryKey });
      }
    };

    socket.on('queue_updated', handleQueueUpdate);

    // Função de limpeza: remove o listener e sai da sala ao desmontar
    return () => {
      console.log(`BarberQueueManagement: Leaving room ${barbershopId}`);
      socket.emit('leave_barbershop_room', barbershopId);
      socket.off('queue_updated', handleQueueUpdate);
    };

    // Dependências: socket, isAuthenticated, user?.role, barberId, barbershopId, queryClient, queryKey
  }, [socket, isAuthenticated, user?.role, barberId, barbershopId, queryClient, JSON.stringify(queryKey)]);
  // --- FIM EFEITO SOCKET.IO ---

  // Verifica se está autenticado e se é um barbeiro
  if (!isAuthenticated || user?.role !== 'BARBER') {
    return <p className="text-center text-muted-foreground">Acesso restrito a barbeiros.</p>;
  }

  if (!barberId) {
     return <p className="text-center text-muted-foreground">ID do Barbeiro não fornecido.</p>;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center space-x-2 p-4">
        <FiLoader className="animate-spin h-5 w-5 text-primary" />
        <span>Carregando fila...</span>
      </div>
    );
  }

  if (error) {
    return <p className="text-center text-red-500">Erro ao carregar fila: {(error as Error).message}</p>;
  }

  // Separa a fila em 'em atendimento' e 'esperando'
  const waitingQueue = queue.filter(entry => entry.status === 'WAITING').sort((a, b) => a.position - b.position);
  const inProgressEntry = queue.find(entry => entry.status === 'IN_PROGRESS');

  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Gerenciar Fila</h3>
        <button onClick={() => refetch()} title="Atualizar Fila" className="text-muted-foreground hover:text-primary disabled:opacity-50" disabled={isLoading}>
          <FiRefreshCw className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Em Atendimento */} 
      {inProgressEntry && (
        <div className="mb-6 p-4 border border-blue-300 bg-blue-50 rounded-md">
          <h4 className="font-medium text-blue-800 mb-2">Em Atendimento</h4>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div className='mb-2 sm:mb-0'>
              <p className="font-semibold">{inProgressEntry.client?.name || inProgressEntry.clientName || 'Cliente'}</p>
              <p className="text-sm text-blue-600">{inProgressEntry.client?.phone || inProgressEntry.clientPhone || ''}</p>
              {inProgressEntry.notes && <p className="text-xs text-gray-500 mt-1">Nota: {inProgressEntry.notes}</p>}
            </div>
            <div className="flex space-x-2 flex-shrink-0">
              <button
                onClick={() => handleUpdateStatus(inProgressEntry.id, 'COMPLETED')}
                disabled={updateStatusMutation.isPending}
                className="p-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 flex items-center text-sm"
                title="Marcar como Concluído"
              >
                <FiUserCheck className="h-4 w-4 mr-1" /> Concluir
              </button>
              <button
                onClick={() => handleUpdateStatus(inProgressEntry.id, 'WAITING')} // Volta para espera
                disabled={updateStatusMutation.isPending}
                className="p-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:opacity-50 flex items-center text-sm"
                title="Voltar para Espera"
              >
                 <FiRefreshCw className="h-4 w-4 mr-1" /> Esperar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Próximo da Fila */} 
      <h4 className="font-medium text-foreground mb-2">Fila de Espera ({waitingQueue.length})</h4>
      {waitingQueue.length > 0 ? (
        <div className="space-y-3">
          {waitingQueue.map((entry, index) => (
            <div key={entry.id} className={`p-3 border rounded-md flex flex-col sm:flex-row justify-between items-start sm:items-center ${index === 0 ? 'border-green-300 bg-green-50' : 'border-border'}`}>
              <div className='mb-2 sm:mb-0'>
                <p className="font-semibold">
                  <span className="text-sm text-muted-foreground mr-2">{entry.position}º</span>
                  {entry.client?.name || entry.clientName || 'Cliente'}
                </p>
                <p className="text-sm text-gray-500">{entry.client?.phone || entry.clientPhone || ''}</p>
                 {entry.notes && <p className="text-xs text-gray-500 mt-1">Nota: {entry.notes}</p>}
              </div>
              <div className="flex space-x-2 flex-shrink-0">
                {/* Só mostra 'Chamar' para o primeiro se ninguém estiver em atendimento */}
                {index === 0 && !inProgressEntry && (
                  <button
                    onClick={() => handleUpdateStatus(entry.id, 'IN_PROGRESS')}
                    disabled={updateStatusMutation.isPending}
                    className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 flex items-center text-sm"
                    title="Chamar Próximo"
                  >
                    <FiChevronsRight className="h-4 w-4 mr-1" /> Chamar
                  </button>
                )}
                <button
                  onClick={() => handleRemoveEntry(entry.id)}
                  disabled={removeEntryMutation.isPending}
                  className="p-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50 flex items-center text-sm"
                  title="Remover da Fila"
                >
                  <FiUserX className="h-4 w-4 mr-1" /> Remover
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-muted-foreground mt-4">Ninguém na fila de espera.</p>
      )}

      {/* TODO: Adicionar botão/formulário para adicionar cliente manualmente */}
      {/* <button className="mt-6 w-full ...">Adicionar Cliente à Fila</button> */}
    </div>
  );
};

export default BarberQueueManagement;
