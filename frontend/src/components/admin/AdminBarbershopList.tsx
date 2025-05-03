'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/components/providers/auth-provider';
import { FiLoader, FiAlertCircle, FiChevronLeft, FiChevronRight, FiHome, FiUser, FiTool, FiUsers } from 'react-icons/fi';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Função para buscar barbearias (admin)
const fetchAdminBarbershops = async (token: string | null, page: number, limit: number) => {
  if (!token) throw new Error('Usuário não autenticado');

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/barbershops?page=${page}&limit=${limit}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || 'Erro ao buscar barbearias');
  }
  return res.json(); // Espera { data: [], total: number, page: number, limit: number, totalPages: number }
};

const AdminBarbershopList: React.FC = () => {
  const { token, isAuthenticated, user } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Quantos itens por página

  const queryKey = ['adminBarbershops', currentPage, itemsPerPage, token];

  const { data, isLoading, error, isFetching } = useQuery<{
    data: any[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>({
    queryKey: queryKey,
    queryFn: () => fetchAdminBarbershops(token, currentPage, itemsPerPage),
    enabled: isAuthenticated && user?.role === 'ADMIN',
    keepPreviousData: true, // Mantém dados anteriores visíveis enquanto busca novos
  });

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, data?.totalPages || prev));
  };

  if (!isAuthenticated || user?.role !== 'ADMIN') {
    return <p className="text-center text-red-500 p-4">Acesso negado.</p>;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center space-x-2 p-4">
        <FiLoader className="animate-spin h-6 w-6 text-primary" />
        <span>Carregando barbearias...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center space-x-2 p-4 bg-red-100 text-red-700 rounded-md">
        <FiAlertCircle className="h-6 w-6" />
        <span>Erro ao carregar barbearias: {(error as Error).message}</span>
      </div>
    );
  }

  return (
    <div>
      {isFetching && <p className="text-sm text-muted-foreground mb-2">Atualizando...</p>}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-border bg-card">
          <thead className="bg-muted/50">
            <tr>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Nome</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Proprietário</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Localização</th>
              <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">Barbeiros</th>
              <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">Serviços</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Criada em</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data?.data && data.data.length > 0 ? (
              data.data.map((shop) => (
                <tr key={shop.id}>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm font-medium text-foreground">{shop.name}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm text-muted-foreground">{shop.owner?.name || 'N/A'}</div>
                    <div className="text-xs text-muted-foreground">{shop.owner?.email || ''}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-muted-foreground">
                    {shop.address}, {shop.city} - {shop.state}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-center text-sm text-muted-foreground">
                    {shop._count?.barbers ?? 0}
                  </td>
                   <td className="px-4 py-3 whitespace-nowrap text-center text-sm text-muted-foreground">
                    {shop._count?.services ?? 0}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-muted-foreground">
                    {format(new Date(shop.createdAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                    {/* TODO: Adicionar botões de ação (Ver, Editar, Suspender) */}
                    <button className="text-primary hover:text-primary/80 mr-2">Ver</button>
                    <button className="text-yellow-600 hover:text-yellow-800">Editar</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-4 py-4 text-center text-sm text-muted-foreground">
                  Nenhuma barbearia encontrada.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Paginação */} 
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <button
            onClick={handlePreviousPage}
            disabled={currentPage === 1 || isFetching}
            className="inline-flex items-center px-3 py-1 border border-border text-sm font-medium rounded-md text-muted-foreground bg-card hover:bg-muted disabled:opacity-50"
          >
            <FiChevronLeft className="mr-1 h-4 w-4" /> Anterior
          </button>
          <span className="text-sm text-muted-foreground">
            Página {data.page} de {data.totalPages}
          </span>
          <button
            onClick={handleNextPage}
            disabled={currentPage === data.totalPages || isFetching}
            className="inline-flex items-center px-3 py-1 border border-border text-sm font-medium rounded-md text-muted-foreground bg-card hover:bg-muted disabled:opacity-50"
          >
            Próxima <FiChevronRight className="ml-1 h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminBarbershopList;

