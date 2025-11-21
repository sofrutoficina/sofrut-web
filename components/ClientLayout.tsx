/**
 * Client Layout
 * Componente del lado del cliente que envuelve la navegación
 */

'use client';

import { ThemeProvider } from '@/contexts/ThemeContext';
import Navigation from './Navigation';
import { usePathname } from 'next/navigation';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // No mostrar Navigation en la página de login
  const isLoginPage = pathname === '/login';

  if (isLoginPage) {
    return (
      <ThemeProvider>
        {children}
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <div className="flex">
        <Navigation />
        <div className="ml-64 flex-1">
          {children}
        </div>
      </div>
    </ThemeProvider>
  );
}
