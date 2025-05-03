'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation'; // Importar useRouter
import { useAuth } from '@/components/providers/auth-provider'; // Importar o hook useAuth

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null); // Estado para erros
  const { login } = useAuth(); // Obter a função login do contexto
  const router = useRouter(); // Hook para redirecionamento

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null); // Limpar erros anteriores

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Se a resposta não for OK, lança um erro com a mensagem da API
        throw new Error(data.message || 'Erro ao fazer login');
      }

      // Login bem-sucedido
      console.log('Usuário autenticado:', data.user);
      login(data.token, data.user); // Salva token e usuário no contexto

      // Redireciona para uma página após o login (ex: dashboard do cliente)
      // Vamos criar essa página depois, por enquanto pode redirecionar para a home
      router.push('/'); // Ou para '/dashboard/cliente' futuramente

    } catch (err: any) {
      console.error('Erro na autenticação:', err);
      setError(err.message || 'Erro ao tentar autenticar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-center text-gray-800">Entrar</h2>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )} 
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Senha
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* Remover "Lembrar-me" e "Esqueceu a senha?" por enquanto, para simplificar */}
          {/* <div className="flex items-center justify-between"> ... </div> */}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-primary text-white font-semibold rounded-md shadow-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {loading ? 'Carregando...' : 'Entrar'}
          </button>
        </form>
        <p className="text-center text-sm text-gray-600">
          Não tem uma conta?{' '}
          <a href="/registro" className="font-medium text-primary hover:text-primary/80">
            Cadastre-se
          </a>
        </p>
      </div>
    </div>
  );
}
