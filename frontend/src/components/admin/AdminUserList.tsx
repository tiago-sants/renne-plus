'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/components/providers/auth-provider';
import { FiLoader, FiAlertCircle, FiChevronLeft, FiChevronRight, FiUser, FiMail, FiPhone, FiShield } from 'react-icons/fi';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Função para buscar usuários (admin)
const fetchAdminUsers = async (token: string | null, page: number, limit: number) => {
  if (!token) throw new Error('Usuário não autenticado');

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/users?page=${page}&limit=${limit}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || 'Erro ao buscar usuários');
  }
  return res.json(); // Espera { data: [], total: number, page: number, limit: number, totalPages: number }
};

const AdminUserList: React.FC = () => {
  const { token, isAuthenticated, user } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Quantos itens por página

  const queryKey = ['adminUsers', currentPage, itemsPerPage, token];

  const { data, isLoading, error, isFetching } = useQuery<{
    data: any[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>({
    queryKey: queryKey,
    queryFn: () => fetchAdminUsers(token, currentPage, itemsPerPage),
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
        <span>Carregando usuários...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center space-x-2 p-4 bg-red-100 text-red-700 rounded-md">
        <FiAlertCircle className="h-6 w-6" />
        <span>Erro ao carregar usuários: {(error as Error).message}</span>
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
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Email</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Telefone</th>
              <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">Role</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Criado em</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data?.data && data.data.length > 0 ? (
              data.data.map((u) => (
                <tr key={u.id}>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm font-medium text-foreground">{u.name}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm text-muted-foreground">{u.email}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-muted-foreground">
                    {u.phone || 'N/A'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-center">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${u.role === 'ADMIN' ? 'bg-red-100 text-red-800' : (u.role === 'BARBER' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800')}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-muted-foreground">
                    {format(new Date(u.createdAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                    {/* TODO: Adicionar botões de ação (Ver, Editar Role, Ativar/Desativar) */}
                    <button className="text-primary hover:text-primary/80 mr-2">Ver</button>
                    <button className="text-yellow-600 hover:text-yellow-800">Editar</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-4 py-4 text-center text-sm text-muted-foreground">
                  Nenhum usuário encontrado.
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

export default AdminUserList;

