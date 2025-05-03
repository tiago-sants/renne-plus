'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/components/providers/auth-provider';
import { FiCalendar, FiClock, FiUser, FiMapPin, FiLoader, FiAlertCircle } from 'react-icons/fi';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Função para buscar os agendamentos do cliente
const fetchClientAppointments = async (token: string | null) => {
  if (!token) throw new Error('Usuário não autenticado');

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/appointments/client`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || 'Erro ao buscar agendamentos');
  }
  return res.json();
};

export default function ClientDashboardPage() {
  const { token, isAuthenticated, user } = useAuth();

  const { data: appointments = [], isLoading, error } = useQuery<any[]>({
    queryKey: ['clientAppointments', user?.id, token],
    queryFn: () => fetchClientAppointments(token),
    enabled: isAuthenticated && !!user?.id, // Só busca se logado e com ID do usuário
  });

  if (!isAuthenticated) {
    // Idealmente, um middleware deveria redirecionar para o login
    return <p className="text-center text-muted-foreground p-8">Você precisa estar logado para acessar o dashboard.</p>;
  }

  // Separa agendamentos futuros e passados
  const now = new Date();
  const upcomingAppointments = appointments
    .filter(app => new Date(`${app.date}T${app.time}`) >= now && app.status !== 'CANCELLED' && app.status !== 'COMPLETED')
    .sort((a, b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime());

  const pastAppointments = appointments
    .filter(app => new Date(`${app.date}T${app.time}`) < now || app.status === 'CANCELLED' || app.status === 'COMPLETED')
    .sort((a, b) => new Date(`${b.date}T${b.time}`).getTime() - new Date(`${a.date}T${a.time}`).getTime());

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Meu Painel</h1>

      {/* Seção de Boas-vindas (Opcional) */}
      <div className="mb-8 p-6 bg-card border border-border rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-2">Olá, {user?.name || 'Cliente'}!</h2>
        <p className="text-muted-foreground">Aqui você pode gerenciar seus agendamentos e acompanhar sua posição na fila.</p>
        {/* TODO: Adicionar link/botão para encontrar barbearias ou ver fila */}
      </div>

      {/* Seção de Agendamentos */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Meus Agendamentos</h2>

        {isLoading && (
          <div className="flex items-center justify-center space-x-2 p-4">
            <FiLoader className="animate-spin h-6 w-6 text-primary" />
            <span>Carregando agendamentos...</span>
          </div>
        )}

        {error && (
          <div className="flex items-center justify-center space-x-2 p-4 bg-red-100 text-red-700 rounded-md">
            <FiAlertCircle className="h-6 w-6" />
            <span>Erro ao carregar agendamentos: {(error as Error).message}</span>
          </div>
        )}

        {!isLoading && !error && appointments.length === 0 && (
          <p className="text-center text-muted-foreground p-4">Você ainda não possui agendamentos.</p>
          // TODO: Adicionar botão para fazer novo agendamento
        )}

        {/* Próximos Agendamentos */}
        {upcomingAppointments.length > 0 && (
          <div className="mb-6">
            <h3 className="text-xl font-medium mb-3">Próximos</h3>
            <div className="space-y-4">
              {upcomingAppointments.map(app => (
                <div key={app.id} className="bg-card border border-border rounded-lg p-4 shadow-sm flex flex-col sm:flex-row justify-between items-start">
                  <div className="mb-2 sm:mb-0">
                    <p className="font-semibold text-lg">{app.service?.name || 'Serviço não encontrado'}</p>
                    <div className="flex items-center text-sm text-muted-foreground mt-1">
                      <FiCalendar className="mr-1.5 h-4 w-4" />
                      {format(new Date(`${app.date}T00:00:00`), 'dd/MM/yyyy', { locale: ptBR })}
                      <FiClock className="ml-3 mr-1.5 h-4 w-4" />
                      {app.time.substring(0, 5)}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground mt-1">
                      <FiUser className="mr-1.5 h-4 w-4" />
                      {app.barber?.user?.name || 'Barbeiro não encontrado'}
                    </div>
                     <div className="flex items-center text-sm text-muted-foreground mt-1">
                      <FiMapPin className="mr-1.5 h-4 w-4" />
                      {app.barbershop?.name || 'Barbearia não encontrada'}
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    {/* TODO: Adicionar botão para cancelar ou reagendar? */}
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${app.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                      {app.status === 'CONFIRMED' ? 'Confirmado' : app.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Histórico de Agendamentos */}
        {pastAppointments.length > 0 && (
          <div>
            <h3 className="text-xl font-medium mb-3">Histórico</h3>
            <div className="space-y-3">
              {pastAppointments.map(app => (
                <div key={app.id} className="bg-card border border-border rounded-lg p-3 shadow-sm opacity-75 flex flex-col sm:flex-row justify-between items-start">
                  <div className="mb-2 sm:mb-0">
                    <p className="font-medium">{app.service?.name || 'Serviço'}</p>
                    <div className="flex items-center text-xs text-muted-foreground mt-1">
                      <FiCalendar className="mr-1.5 h-3 w-3" />
                      {format(new Date(`${app.date}T00:00:00`), 'dd/MM/yy', { locale: ptBR })}
                      <FiClock className="ml-2 mr-1.5 h-3 w-3" />
                      {app.time.substring(0, 5)}
                      <FiUser className="ml-2 mr-1.5 h-3 w-3" />
                      {app.barber?.user?.name || 'Barbeiro'}
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                     <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${app.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : (app.status === 'CANCELLED' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800')}`}>
                      {app.status === 'COMPLETED' ? 'Concluído' : (app.status === 'CANCELLED' ? 'Cancelado' : app.status)}
                    </span>
                    {/* TODO: Adicionar botão para avaliar (se COMPLETED)? */}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* TODO: Adicionar seção para visualizar fila (ClientQueueView) se aplicável */}

    </div>
  );
}

