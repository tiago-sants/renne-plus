'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/components/providers/auth-provider';
import { FiUsers, FiHome, FiBarChart2, FiLoader, FiAlertCircle } from 'react-icons/fi';
import AdminBarbershopList from '@/components/admin/AdminBarbershopList';
import AdminUserList from '@/components/admin/AdminUserList';


// Função para buscar estatísticas gerais (admin)
const fetchAdminStats = async (token: string | null) => {
  if (!token) throw new Error('Usuário não autenticado');

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/stats`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || 'Erro ao buscar estatísticas');
  }
  return res.json();
};

// TODO: Criar componentes separados para listar usuários e barbearias
// import AdminUserList from '@/components/admin/AdminUserList';
// import AdminBarbershopList from '@/components/admin/AdminBarbershopList';

export default function AdminDashboardPage() {
  const { token, isAuthenticated, user } = useAuth();
  const [activeTab, setActiveTab] = useState<'stats' | 'users' | 'barbershops'>('stats');

  // Busca as estatísticas gerais
  const { data: stats, isLoading: isLoadingStats, error: statsError } = useQuery<any>({
    queryKey: ['adminStats', token],
    queryFn: () => fetchAdminStats(token),
    enabled: isAuthenticated && user?.role === 'ADMIN',
  });

  // Verifica se está autenticado e se é ADMIN
  if (!isAuthenticated) {
    // Idealmente, um middleware/redirector cuidaria disso
    return <p className="text-center text-muted-foreground p-8">Você precisa estar logado como administrador.</p>;
  }
  if (user?.role !== 'ADMIN') {
    return <p className="text-center text-red-500 p-8">Acesso negado. Esta área é exclusiva para administradores.</p>;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Painel Administrativo</h1>

      {/* Abas de Navegação */}
      <div className="mb-6 border-b border-border">
        <nav className="-mb-px flex space-x-6" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('stats')}
            className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'stats' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'}`}
          >
            <FiBarChart2 className="inline-block mr-1 h-4 w-4" /> Estatísticas
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'users' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'}`}
          >
            <FiUsers className="inline-block mr-1 h-4 w-4" /> Usuários
          </button>
          <button
            onClick={() => setActiveTab('barbershops')}
            className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'barbershops' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'}`}
          >
            <FiHome className="inline-block mr-1 h-4 w-4" /> Barbearias
          </button>
          {/* TODO: Adicionar mais abas (Configurações, etc.) */}
        </nav>
      </div>

      {/* Conteúdo das Abas */} 
      <div>
        {activeTab === 'stats' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Visão Geral</h2>
            {isLoadingStats && (
              <div className="flex items-center justify-center space-x-2 p-4">
                <FiLoader className="animate-spin h-6 w-6 text-primary" />
                <span>Carregando estatísticas...</span>
              </div>
            )}
            {statsError && (
              <div className="flex items-center justify-center space-x-2 p-4 bg-red-100 text-red-700 rounded-md">
                <FiAlertCircle className="h-6 w-6" />
                <span>Erro: {(statsError as Error).message}</span>
              </div>
            )}
            {stats && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-card border border-border rounded-lg p-4 shadow-sm">
                  <h3 className="text-sm font-medium text-muted-foreground">Usuários Totais</h3>
                  <p className="text-2xl font-semibold">{stats.totalUsers ?? 'N/A'}</p>
                </div>
                <div className="bg-card border border-border rounded-lg p-4 shadow-sm">
                  <h3 className="text-sm font-medium text-muted-foreground">Barbearias Totais</h3>
                  <p className="text-2xl font-semibold">{stats.totalBarbershops ?? 'N/A'}</p>
                </div>
                <div className="bg-card border border-border rounded-lg p-4 shadow-sm">
                  <h3 className="text-sm font-medium text-muted-foreground">Agendamentos Totais</h3>
                  <p className="text-2xl font-semibold">{stats.totalAppointments ?? 'N/A'}</p>
                </div>
                <div className="bg-card border border-border rounded-lg p-4 shadow-sm">
                  <h3 className="text-sm font-medium text-muted-foreground">Entradas na Fila (Histórico)</h3>
                  <p className="text-2xl font-semibold">{stats.totalQueueEntries ?? 'N/A'}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'users' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Gerenciar Usuários</h2>
            <AdminUserList /> {/* Renderiza o componente aqui */}
          </div>
        )}

        {activeTab === 'barbershops' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Gerenciar Barbearias</h2>
            <AdminBarbershopList /> {/* Renderiza o componente aqui */}
          </div>
        )}
      </div>
    </div>
  );
}
