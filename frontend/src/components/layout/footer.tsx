'use client';

import Link from 'next/link';
import { FiGithub, FiInstagram, FiTwitter } from 'react-icons/fi';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-background border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="text-2xl font-bold text-primary">
              renne-plus
            </Link>
            <p className="mt-2 text-sm text-muted-foreground">
              Sistema completo para gerenciamento de barbearias e salões, com agendamento, fila e muito mais.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground tracking-wider uppercase">
              Navegação
            </h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link href="/" className="text-sm text-muted-foreground hover:text-primary">
                  Início
                </Link>
              </li>
              <li>
                <Link href="/agendamento" className="text-sm text-muted-foreground hover:text-primary">
                  Agendamento
                </Link>
              </li>
              <li>
                <Link href="/fila" className="text-sm text-muted-foreground hover:text-primary">
                  Fila
                </Link>
              </li>
              <li>
                <Link href="/sobre" className="text-sm text-muted-foreground hover:text-primary">
                  Sobre
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground tracking-wider uppercase">
              Legal
            </h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link href="/privacidade" className="text-sm text-muted-foreground hover:text-primary">
                  Política de Privacidade
                </Link>
              </li>
              <li>
                <Link href="/termos" className="text-sm text-muted-foreground hover:text-primary">
                  Termos de Uso
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground">
            &copy; {currentYear} renne-plus. Todos os direitos reservados.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-muted-foreground hover:text-primary">
              <span className="sr-only">Instagram</span>
              <FiInstagram size={20} />
            </a>
            <a href="#" className="text-muted-foreground hover:text-primary">
              <span className="sr-only">Twitter</span>
              <FiTwitter size={20} />
            </a>
            <a href="#" className="text-muted-foreground hover:text-primary">
              <span className="sr-only">GitHub</span>
              <FiGithub size={20} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
