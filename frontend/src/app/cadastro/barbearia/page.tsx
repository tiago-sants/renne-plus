'use client';

import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useAuth } from '@/components/providers/auth-provider';
import { useRouter } from 'next/navigation';
import { FiHome, FiMapPin, FiPhone, FiInfo, FiLoader, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';

// Função API para criar a barbearia
const createBarbershopAPI = async ({ token, barbershopData }: { token: string, barbershopData: any }) => {
  if (!token) throw new Error('Token não fornecido');

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/barbershops`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(barbershopData),
  });

  if (!res.ok) {
    const errorData = await res.json();
    // Tenta extrair a primeira mensagem de erro de validação, se houver
    const message = errorData.errors?.[0]?.msg || errorData.message || 'Erro desconhecido ao criar barbearia';
    throw new Error(message);
  }
  return res.json();
};

export default function CadastroBarbeariaPage() {
  const { token, isAuthenticated, user } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
    description: '',
    // TODO: Adicionar campo para horário de funcionamento (openingHours)
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  const createMutation = useMutation({
    mutationFn: createBarbershopAPI,
    onSuccess: (data) => {
      setFormError(null);
      setFormSuccess(`Barbearia "${data.name}" criada com sucesso! Redirecionando...`);
      console.log('Barbearia criada:', data);
      // TODO: Redirecionar para o painel do barbeiro/dono ou página de configuração
      setTimeout(() => {
        router.push('/dashboard/barbeiro'); // Ou outra rota apropriada
      }, 2000);
    },
    onError: (error) => {
      setFormSuccess(null);
      setFormError((error as Error).message);
      console.error('Erro ao criar barbearia:', error);
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    if (!isAuthenticated || !token) {
      setFormError('Você precisa estar logado para criar uma barbearia.');
      return;
    }

    // Validação básica no frontend (opcional)
    if (!formData.name || !formData.address || !formData.city || !formData.state || !formData.zipCode) {
      setFormError('Por favor, preencha todos os campos obrigatórios (Nome, Endereço, Cidade, Estado, CEP).');
      return;
    }

    createMutation.mutate({ token, barbershopData: formData });
  };

  // Verifica se está autenticado
  if (!isAuthenticated) {
    // Idealmente, um middleware/redirector cuidaria disso
    return <p className="text-center text-muted-foreground p-8">Você precisa estar logado para acessar esta página.</p>;
  }

  // TODO: Adicionar verificação se o usuário JÁ POSSUI uma barbearia?
  //       Poderia buscar o perfil de barbeiro/dono aqui e, se já existir,
  //       mostrar uma mensagem ou redirecionar.

  return (
    <div className="container mx-auto py-12 px-4 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8 text-center">Cadastre sua Barbearia</h1>
      <p className="text-center text-muted-foreground mb-8">
        Preencha os dados abaixo para registrar sua barbearia na plataforma.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Nome */} 
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1">
            <FiHome className="inline-block mr-1 h-4 w-4" /> Nome da Barbearia <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="mt-1 block w-full px-4 py-2 border border-border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-background"
            placeholder="Ex: Barbearia do Zé"
          />
        </div>

        {/* Endereço */} 
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-foreground mb-1">
              <FiMapPin className="inline-block mr-1 h-4 w-4" /> Endereço <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-4 py-2 border border-border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-background"
              placeholder="Rua Principal, 123"
            />
          </div>
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-foreground mb-1">
              Cidade <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="city"
              name="city"
              value={formData.city}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-4 py-2 border border-border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-background"
              placeholder="São Paulo"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="state" className="block text-sm font-medium text-foreground mb-1">
              Estado <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="state"
              name="state"
              value={formData.state}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-4 py-2 border border-border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-background"
              placeholder="SP"
            />
          </div>
          <div>
            <label htmlFor="zipCode" className="block text-sm font-medium text-foreground mb-1">
              CEP <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="zipCode"
              name="zipCode"
              value={formData.zipCode}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-4 py-2 border border-border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-background"
              placeholder="01000-000"
            />
          </div>
        </div>

        {/* Telefone */} 
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-1">
            <FiPhone className="inline-block mr-1 h-4 w-4" /> Telefone (Opcional)
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="mt-1 block w-full px-4 py-2 border border-border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-background"
            placeholder="(11) 99999-9999"
          />
        </div>

        {/* Descrição */} 
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-foreground mb-1">
            <FiInfo className="inline-block mr-1 h-4 w-4" /> Descrição (Opcional)
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            value={formData.description}
            onChange={handleChange}
            className="mt-1 block w-full px-4 py-2 border border-border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-background"
            placeholder="Descreva brevemente sua barbearia, serviços oferecidos, etc."
          />
        </div>

        {/* TODO: Adicionar campo para Horário de Funcionamento (openingHours) */} 
        {/* Pode ser um campo de texto simples ou algo mais estruturado */} 

        {/* Mensagens de Erro/Sucesso */} 
        {formError && (
          <div className="flex items-center space-x-2 p-3 bg-red-100 text-red-700 rounded-md text-sm">
            <FiAlertCircle className="h-5 w-5" />
            <span>{formError}</span>
          </div>
        )}
        {formSuccess && (
          <div className="flex items-center space-x-2 p-3 bg-green-100 text-green-700 rounded-md text-sm">
            <FiCheckCircle className="h-5 w-5" />
            <span>{formSuccess}</span>
          </div>
        )}

        {/* Botão de Envio */} 
        <button
          type="submit"
          disabled={createMutation.isPending}
          className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
        >
          {createMutation.isPending ? (
            <>
              <FiLoader className="animate-spin -ml-1 mr-3 h-5 w-5" />
              Cadastrando...
            </>
          ) : (
            'Cadastrar Barbearia'
          )}
        </button>
      </form>
    </div>
  );
}

