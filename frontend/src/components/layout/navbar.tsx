'use client';

import Link from 'next/link';
import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';
import { useAuth } from '../providers/auth-provider';
import { FiMenu, FiX, FiSun, FiMoon, FiUser, FiLogOut } from 'react-icons/fi';

const Navbar = () => {
  const { theme, setTheme } = useTheme();
  const { user, logout, isAuthenticated } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Evitar problemas de hidratação
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleProfileMenu = () => {
    setIsProfileOpen(!isProfileOpen);
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <nav className="bg-background border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-2xl font-bold text-primary">
                renne-plus
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                href="/"
                className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-foreground hover:border-primary hover:text-primary"
              >
                Início
              </Link>
              <Link
                href="/agendamento"
                className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-foreground hover:border-primary hover:text-primary"
              >
                Agendamento
              </Link>
              <Link
                href="/fila"
                className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-foreground hover:border-primary hover:text-primary"
              >
                Fila
              </Link>
              {isAuthenticated && (
                <Link
                  href="/dashboard"
                  className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-foreground hover:border-primary hover:text-primary"
                >
                  Dashboard
                </Link>
              )}
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-md text-foreground hover:text-primary focus:outline-none"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <FiSun size={20} /> : <FiMoon size={20} />}
            </button>

            {isAuthenticated ? (
              <div className="ml-3 relative">
                <div>
                  <button
                    onClick={toggleProfileMenu}
                    className="flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                    id="user-menu"
                    aria-expanded="false"
                    aria-haspopup="true"
                  >
                    <span className="sr-only">Abrir menu do usuário</span>
                    <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                      {user?.name.charAt(0).toUpperCase()}
                    </div>
                  </button>
                </div>
                {isProfileOpen && (
                  <div
                    className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-card ring-1 ring-black ring-opacity-5 focus:outline-none z-10"
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="user-menu"
                  >
                    <div className="px-4 py-2 text-sm text-card-foreground border-b border-border">
                      <p className="font-medium">{user?.name}</p>
                      <p className="text-muted-foreground">{user?.email}</p>
                    </div>
                    <Link
                      href="/perfil"
                      className="block px-4 py-2 text-sm text-card-foreground hover:bg-muted"
                      role="menuitem"
                    >
                      Seu Perfil
                    </Link>
                    <button
                      onClick={logout}
                      className="w-full text-left block px-4 py-2 text-sm text-card-foreground hover:bg-muted"
                      role="menuitem"
                    >
                      Sair
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  href="/login"
                  className="text-sm font-medium text-foreground hover:text-primary"
                >
                  Entrar
                </Link>
                <Link
                  href="/registro"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-primary-foreground bg-primary hover:bg-primary/90"
                >
                  Cadastrar
                </Link>
              </div>
            )}
          </div>
          <div className="-mr-2 flex items-center sm:hidden">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-md text-foreground hover:text-primary focus:outline-none"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <FiSun size={20} /> : <FiMoon size={20} />}
            </button>
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-foreground hover:text-primary hover:bg-muted focus:outline-none"
              aria-expanded="false"
            >
              <span className="sr-only">Abrir menu principal</span>
              {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            <Link
              href="/"
              className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-foreground hover:bg-muted hover:border-primary hover:text-primary"
              onClick={() => setIsMenuOpen(false)}
            >
              Início
            </Link>
            <Link
              href="/agendamento"
              className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-foreground hover:bg-muted hover:border-primary hover:text-primary"
              onClick={() => setIsMenuOpen(false)}
            >
              Agendamento
            </Link>
            <Link
              href="/fila"
              className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-foreground hover:bg-muted hover:border-primary hover:text-primary"
              onClick={() => setIsMenuOpen(false)}
            >
              Fila
            </Link>
            {isAuthenticated && (
              <Link
                href="/dashboard"
                className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-foreground hover:bg-muted hover:border-primary hover:text-primary"
                onClick={() => setIsMenuOpen(false)}
              >
                Dashboard
              </Link>
            )}
          </div>
          {isAuthenticated ? (
            <div className="pt-4 pb-3 border-t border-border">
              <div className="flex items-center px-4">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                    {user?.name.charAt(0).toUpperCase()}
                  </div>
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-foreground">{user?.name}</div>
                  <div className="text-sm font-medium text-muted-foreground">{user?.email}</div>
                </div>
              </div>
              <div className="mt-3 space-y-1">
                <Link
                  href="/perfil"
                  className="block px-4 py-2 text-base font-medium text-foreground hover:bg-muted hover:text-primary"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Seu Perfil
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setIsMenuOpen(false);
                  }}
                  className="w-full text-left block px-4 py-2 text-base font-medium text-foreground hover:bg-muted hover:text-primary"
                >
                  Sair
                </button>
              </div>
            </div>
          ) : (
            <div className="pt-4 pb-3 border-t border-border">
              <div className="flex flex-col space-y-3 px-4">
                <Link
                  href="/login"
                  className="block text-base font-medium text-foreground hover:text-primary"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Entrar
                </Link>
                <Link
                  href="/registro"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-primary-foreground bg-primary hover:bg-primary/90"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Cadastrar
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
