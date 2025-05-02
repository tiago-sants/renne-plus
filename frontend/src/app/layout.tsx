import { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import ClientLayout from './client-layout'; // Novo componente cliente

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'renne-plus | Sistema de Gerenciamento para Barbearias e Salões',
  description: 'Sistema completo para agendamento, fila e gerenciamento de barbearias e salões',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
