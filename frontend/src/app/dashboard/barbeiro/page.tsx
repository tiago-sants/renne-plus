'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/components/providers/auth-provider';
import BarberQueueManagement from '@/components/queue/BarberQueueManagement'; // Importa o componente de gerenciamento de fila
import { FiClock, FiLoader, FiAlertCircle, FiUsers } from 'react-icons/fi';
import { format } from 'date-fns';
// Removed unused import 'ptBR'

// Função para buscar o perfil de barbeiro associado ao usuário logado
// PRECISA SER IMPLEMENTADA NO BACKEND: GET /api/users/me/barber-profile (ou similar)
const fetchMyBarberProfile = async (token: string | null) => {
  if (!token) throw new Error('Usuário não autenticado');

  // TODO: Implementar esta rota no backend!
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/me/barber-profile`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    if (res.status === 404) {
      // Não é um erro se o usuário não tiver um perfil de barbeiro ainda
      return null;
    const errorData = await res.json();
    throw new Error(errorData.message || 'Erro ao buscar perfil de barbeiro');
  }
  return res.json(); // Deve retornar { id: '...', barbershopId: '...', ... }
};

// Função para buscar os agendamentos do barbeiro
// Rota já existe: GET /api/appointments/barber
const fetchBarberAppointments = async (token: string | null) => {
  if (!token) throw new Error('Usuário não autenticado');

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/appointments/barber`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || 'Erro ao buscar agendamentos do barbeiro');
  }
  return res.json();
};

export default function BarberDashboardPage() {
  const { token, isAuthenticated, user } = useAuth();

  // 1. Busca o perfil do barbeiro para obter o barberId
  const { data: barberProfile, isLoading: isLoadingProfile, error: profileError } = useQuery<any | null>({
    queryKey: ['myBarberProfile', user?.id, token],
    queryFn: () => fetchMyBarberProfile(token),
    enabled: isAuthenticated && user?.role === 'BARBER',
    staleTime: Infinity, // Perfil não muda frequentemente
  });

  // 2. Busca os agendamentos do barbeiro
  const { data: appointments = [], isLoading: isLoadingAppointments, error: appointmentsError } = useQuery<any[]>({
    queryKey: ['barberAppointments', barberProfile?.id, token], // Usa barberProfile.id se disponível
    queryFn: () => fetchBarberAppointments(token),
    enabled: isAuthenticated && !!barberProfile?.id, // Só busca se tiver perfil de barbeiro
  });

  // Estado para controlar a aba ativa (Fila ou Agendamentos)
  const [activeTab, setActiveTab] = useState<'queue' | 'appointments'>('queue');

  if (!isAuthenticated) {
    return <p className="text-center text-muted-foreground p-8">Você precisa estar logado para acessar o painel.</p>;
  }

  if (isLoadingProfile) {
    return (
      <div className="flex items-center justify-center space-x-2 p-8">
        <FiLoader className="animate-spin h-6 w-6 text-primary" />
        <span>Carregando perfil...</span>
      </div>
    );
  }

  // Verifica se é um barbeiro e se o perfil foi carregado
  if (user?.role !== 'BARBER') {
    return <p className="text-center text-muted-foreground p-8">Acesso restrito a barbeiros.</p>;
  }

  if (profileError) {
    return (
      <div className="flex items-center justify-center space-x-2 p-8 bg-red-100 text-red-700 rounded-md">
        <FiAlertCircle className="h-6 w-6" />
        <span>Erro ao carregar perfil: {(profileError as Error).message}</span>
      </div>
    );
  }

  if (!barberProfile) {
     return (
        <div className="container mx-auto py-8 px-4 text-center">
            <h1 className="text-3xl font-bold mb-4">Painel do Barbeiro</h1>
            <p className="text-muted-foreground mb-6">Você ainda não possui um perfil de barbeiro configurado.</p>
            {/* TODO: Adicionar link/botão para configurar perfil ou associar a uma barbearia */}
        </div>
    );
  }

  // Filtra agendamentos para hoje (exemplo)
  const today = format(new Date(), 'yyyy-MM-dd');
  const todayAppointments = appointments
    .filter(app => app.date === today && app.status !== 'CANCELLED' && app.status !== 'COMPLETED')
    .sort((a, b) => a.time.localeCompare(b.time));

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Painel do Barbeiro</h1>
    </div>

      {/* TODO: Adicionar informações do barbeiro/barbearia aqui */}

      {/* Abas de Navegação */}
      <div className="mb-6 border-b border-border">
        <nav className="-mb-px flex space-x-6" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('queue')}
            className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'queue' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'}`}
          >
            Gerenciar Fila
          </button>
          <button
            onClick={() => setActiveTab('appointments')}
            className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'appointments' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'}`}
          >
            Meus Agendamentos
          </button>
          {/* TODO: Adicionar aba para gerenciar disponibilidade */}
          {/* <button>Disponibilidade</button> */}
        </nav>
      {/* Conteúdo das Abas */} 
      <div>
        {activeTab === 'queue' && barberProfile && (
          <div>
        <BarberQueueManagement 
          barberId={barberProfile.id} 
          barbershopId={barberProfile.barbershopId} // Passa o barbershopId
        />
          </div>
        )}

        {activeTab === 'appointments' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Agendamentos de Hoje ({todayAppointments.length})</h2>
            {isLoadingAppointments && (
              <div className="flex items-center justify-center space-x-2 p-4">
                <FiLoader className="animate-spin h-5 w-5 text-primary" />
                <span>Carregando agendamentos...</span>
              </div>
            )}
            {appointmentsError && (
              <div className="flex items-center justify-center space-x-2 p-4 bg-red-100 text-red-700 rounded-md">
                <FiAlertCircle className="h-5 w-5" />
                <span>Erro: {(appointmentsError as Error).message}</span>
              </div>
            )}
            {!isLoadingAppointments && !appointmentsError && todayAppointments.length === 0 && (
              <p className="text-center text-muted-foreground p-4">Nenhum agendamento para hoje.</p>
            )}
            {!isLoadingAppointments && !appointmentsError && todayAppointments.length > 0 && (
              <div className="space-y-4">
                {todayAppointments.map(app => (
                  <div key={app.id} className="bg-card border border-border rounded-lg p-4 shadow-sm flex flex-col sm:flex-row justify-between items-start">
                    <div className="mb-2 sm:mb-0">
                      <p className="font-semibold">{app.service?.name || 'Serviço'}</p>
                      <div className="flex items-center text-sm text-muted-foreground mt-1">
                        <FiClock className="mr-1.5 h-4 w-4" />
                        {app.time.substring(0, 5)}
                        <FiUsers className="ml-3 mr-1.5 h-4 w-4" />
                        {app.client?.name || 'Cliente não identificado'}
                      </div>
                       {app.client?.phone && (
                          <p className="text-xs text-muted-foreground mt-1">Tel: {app.client.phone}</p>
                       )}
                    </div>
                    <div className="flex-shrink-0">
                      {/* TODO: Adicionar botões para marcar como concluído/não compareceu? */}
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${app.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                        {app.status === 'CONFIRMED' ? 'Confirmado' : app.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {/* TODO: Adicionar visualização de outros dias? */}
          </div>
        )}
      </div>
    </div>
  );
}

