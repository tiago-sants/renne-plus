'use client';

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

// Tipagem para os dados do usuário (ajuste conforme necessário)
interface User {
  id: string;
  name: string;
  email: string;
  role: 'CLIENT' | 'BARBER' | 'ADMIN';
  // Adicione outros campos se necessário
}

// Tipagem para o contexto de autenticação
interface AuthContextType {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean; // Para saber se ainda está carregando do localStorage
  login: (newToken: string, userData: User) => void;
  logout: () => void;
}

// Criação do contexto com valor inicial undefined para checagem
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Props do Provider
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Inicia carregando

  // Efeito para carregar token e usuário do localStorage ao iniciar
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('authToken');
      const storedUser = localStorage.getItem('authUser');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Erro ao carregar dados de autenticação do localStorage:", error);
      // Limpa em caso de erro ao parsear JSON, por exemplo
      localStorage.removeItem('authToken');
      localStorage.removeItem('authUser');
    } finally {
      setIsLoading(false); // Finaliza o carregamento
    }
  }, []);

  const login = (newToken: string, userData: User) => {
    try {
      localStorage.setItem('authToken', newToken);
      localStorage.setItem('authUser', JSON.stringify(userData));
      setToken(newToken);
      setUser(userData);
    } catch (error) {
      console.error("Erro ao salvar dados de autenticação no localStorage:", error);
    }
  };

  const logout = () => {
    try {
      localStorage.removeItem('authToken');
      localStorage.removeItem('authUser');
      setToken(null);
      setUser(null);
      // Opcional: redirecionar para a página de login
      // window.location.href = '/login'; // Use router se preferir
    } catch (error) {
      console.error("Erro ao remover dados de autenticação do localStorage:", error);
    }
  };

  const isAuthenticated = !!token && !!user;

  return (
    <AuthContext.Provider value={{ token, user, isAuthenticated, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook customizado para usar o contexto de autenticação
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

