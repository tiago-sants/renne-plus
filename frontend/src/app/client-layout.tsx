// frontend/src/app/client-layout.tsx
'use client'; // Marca este como um Componente Cliente

import { ThemeProvider } from '@/components/providers/theme-provider';
import { Toaster } from 'react-hot-toast';
import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';
import { AuthProvider } from '@/components/providers/auth-provider';
import { QueryProvider } from '@/components/providers/query-provider';
// Remova a importação de SocketProvider se não for usada globalmente aqui
// import { SocketProvider } from '@/components/providers/socket-provider';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <AuthProvider>
        {/* Se SocketProvider for global, descomente e envolva aqui */}
        {/* <SocketProvider> */}
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <Navbar />
            <main className="flex-grow">{children}</main>
            <Footer />
            <Toaster position="top-center" />
          </ThemeProvider>
        {/* </SocketProvider> */}
      </AuthProvider>
    </QueryProvider>
  );
}
