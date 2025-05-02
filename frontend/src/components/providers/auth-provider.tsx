'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { toast } from 'react-hot-toast';

// Tipos
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'CLIENT' | 'BARBER' | 'ADMIN';
  phone?: string;
  loyaltyPoints?: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, phone?: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// API base URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Verificar se o usuário está autenticado ao carregar a página
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      verifyToken(storedToken);
    } else {
      setIsLoading(false);
    }
  }, []);

  // Verificar token
  const verifyToken = async (token: string) => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${API_URL}/api/auth/verify-token`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.user) {
        // Buscar dados completos do usuário
        const userResponse = await axios.get(`${API_URL}/api/auth/profile`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        setUser(userResponse.data.user);
        setToken(token);
      }
    } catch (error) {
      console.error('Erro ao verificar token:', error);
      localStorage.removeItem('token');
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Login
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await axios.post(`${API_URL}/api/auth/login`, {
        email,
        password
      });

      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      setUser(user);
      setToken(token);
      
      toast.success('Login realizado com sucesso!');
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Erro ao fazer login:', error);
      toast.error(error.response?.data?.message || 'Erro ao fazer login');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Registro
  const register = async (name: string, email: string, password: string, phone?: string) => {
    try {
      setIsLoading(true);
      const response = await axios.post(`${API_URL}/api/auth/register`, {
        name,
        email,
        password,
        phone
      });

      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      setUser(user);
      setToken(token);
      
      toast.success('Registro realizado com sucesso!');
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Erro ao registrar:', error);
      toast.error(error.response?.data?.message || 'Erro ao registrar');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setToken(null);
    toast.success('Logout realizado com sucesso!');
    router.push('/');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        logout,
        isAuthenticated: !!user
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook para usar o contexto de autenticação
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
