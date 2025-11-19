/**
 * Componente de Navegación
 * Menú lateral con enlaces a páginas
 */

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, BarChart3, Package, ArrowDownCircle, ArrowUpCircle, Users } from 'lucide-react';
import dynamic from 'next/dynamic';

const ThemeToggle = dynamic(() => import('./ThemeToggle'), {
  ssr: false,
  loading: () => <div className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 w-9 h-9" />
});

const menuItems = [
  { href: '/', label: 'Dashboard', icon: Home },
  { href: '/variedad', label: 'Por Variedad', icon: Search },
  { href: '/cliente', label: 'Por Cliente', icon: Users },
  { href: '/comparar', label: 'Comparar', icon: BarChart3 },
  { href: '/salidas', label: 'Salidas', icon: ArrowUpCircle },
  { href: '/entradas', label: 'Entradas', icon: ArrowDownCircle },
  { href: '/productos', label: 'Productos', icon: Package },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="w-64 bg-white dark:bg-gray-800 shadow-lg h-screen fixed left-0 top-0 overflow-y-auto border-r border-gray-200 dark:border-gray-700">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-green-600 dark:text-green-500">Sofrut</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Análisis de Datos</p>
          </div>
          <ThemeToggle />
        </div>
      </div>

      {/* Menu Items */}
      <div className="p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors
                ${isActive
                  ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 font-semibold'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }
              `}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
        <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
          Temporada 2025
        </p>
      </div>
    </nav>
  );
}
