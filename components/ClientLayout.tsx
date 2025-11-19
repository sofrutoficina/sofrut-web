/**
 * Client Layout
 * Componente del lado del cliente que envuelve la navegación
 */

'use client';

import { ThemeProvider } from '@/contexts/ThemeContext';
import Navigation from './Navigation';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
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
