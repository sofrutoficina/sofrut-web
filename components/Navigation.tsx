/**
 * Componente de Navegación
 * Menú lateral con enlaces a páginas
 */

'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Search, BarChart3, Package, ArrowDownCircle, ArrowUpCircle, Users, LogOut, User, Mail, Shield } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useState } from 'react';
import { useUser } from '@/hooks/useUser';

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
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { userData } = useUser();

  const handleLogout = async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      setIsLoggingOut(false);
    }
  };

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

        {/* Sección Admin - Solo visible para administradores */}
        {userData && userData.rol === 'admin' && (
          <>
            <div className="pt-4 pb-2 border-t border-gray-200 dark:border-gray-700">
              <p className="px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Administración
              </p>
            </div>
            <Link
              href="/admin/usuarios"
              className={`
                flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors
                ${pathname === '/admin/usuarios'
                  ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 font-semibold'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }
              `}
            >
              <Shield className="w-5 h-5" />
              <span>Gestión Usuarios</span>
            </Link>
          </>
        )}
      </div>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 space-y-3">
        {/* Información del usuario */}
        {userData && (
          <div className="px-3 py-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 space-y-2">
            <div className="space-y-1.5">
              <div className="flex items-center space-x-2">
                <User className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {userData.nombre}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
                <span className="text-xs text-gray-600 dark:text-gray-400 truncate">
                  {userData.email}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
                <span className="text-xs font-medium text-green-600 dark:text-green-400 capitalize">
                  {userData.rol}
                </span>
              </div>
            </div>
            <Link
              href="/cambiar-password"
              className="block text-center text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700
                       dark:hover:text-blue-300 font-medium pt-1.5 border-t border-gray-200 dark:border-gray-700"
            >
              Cambiar contraseña
            </Link>
          </div>
        )}

        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg
                   bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400
                   hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors
                   disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <LogOut className="w-4 h-4" />
          <span className="text-sm font-medium">
            {isLoggingOut ? 'Cerrando...' : 'Cerrar Sesión'}
          </span>
        </button>
        <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
          Temporada 2025
        </p>
      </div>
    </nav>
  );
}
