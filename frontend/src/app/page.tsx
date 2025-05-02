'use client';

import React from 'react';
import { FiCalendar, FiClock, FiUsers, FiSettings } from 'react-icons/fi';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="hero-gradient py-20 px-4 sm:px-6 lg:px-8 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
              renne-plus
            </h1>
            <p className="mt-3 max-w-md mx-auto text-xl text-gray-300 sm:text-2xl md:mt-5 md:max-w-3xl">
              Sistema completo para gerenciamento de barbearias e salões
            </p>
            <div className="mt-10 flex justify-center">
              <Link
                href="/registro"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                Começar agora
              </Link>
              <Link
                href="/sobre"
                className="ml-4 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-primary bg-primary-foreground hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                Saiba mais
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-foreground sm:text-4xl">
              Funcionalidades principais
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-muted-foreground">
              Tudo o que você precisa para gerenciar seu salão ou barbearia em um só lugar.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div className="card-hover bg-card rounded-lg shadow-md p-6 border border-border">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary text-primary-foreground">
                <FiCalendar className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-lg font-medium text-foreground">Sistema de Agendamento</h3>
              <p className="mt-2 text-base text-muted-foreground">
                Permita que seus clientes agendem horários online, escolhendo serviço, profissional e horário.
              </p>
            </div>

            <div className="card-hover bg-card rounded-lg shadow-md p-6 border border-border">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary text-primary-foreground">
                <FiClock className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-lg font-medium text-foreground">Sistema de Fila</h3>
              <p className="mt-2 text-base text-muted-foreground">
                Gerencie filas de espera em tempo real, permitindo que clientes vejam o tempo estimado de espera.
              </p>
            </div>

            <div className="card-hover bg-card rounded-lg shadow-md p-6 border border-border">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary text-primary-foreground">
                <FiUsers className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-lg font-medium text-foreground">Gestão de Clientes</h3>
              <p className="mt-2 text-base text-muted-foreground">
                Mantenha um histórico completo de clientes, serviços realizados e preferências.
              </p>
            </div>

            <div className="card-hover bg-card rounded-lg shadow-md p-6 border border-border">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary text-primary-foreground">
                <FiSettings className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-lg font-medium text-foreground">Painel Administrativo</h3>
              <p className="mt-2 text-base text-muted-foreground">
                Controle completo sobre sua barbearia ou salão, com relatórios e métricas importantes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl font-extrabold text-foreground sm:text-4xl">
            Pronto para transformar seu negócio?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Crie sua conta agora e comece a usar o renne-plus gratuitamente.
          </p>
          <div className="mt-8">
            <Link
              href="/registro"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Criar conta
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
