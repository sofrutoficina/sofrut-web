/**
 * Componente KPICard
 * Muestra un indicador clave con título, valor y tendencia
 */

import { ArrowUp, ArrowDown, Minus } from 'lucide-react';

interface KPICardProps {
  titulo: string;
  valor: string | number;
  cambio?: number;
  tipo?: 'positivo' | 'negativo' | 'neutral';
  unidad?: string;
  icono?: React.ReactNode;
}

export default function KPICard({
  titulo,
  valor,
  cambio,
  tipo = 'neutral',
  unidad = '',
  icono
}: KPICardProps) {
  const getTendenciaColor = () => {
    if (tipo === 'positivo') return 'text-green-600 dark:text-green-400';
    if (tipo === 'negativo') return 'text-red-600 dark:text-red-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  const getTendenciaIcon = () => {
    if (!cambio) return null;
    if (tipo === 'positivo') return <ArrowUp className="w-4 h-4" />;
    if (tipo === 'negativo') return <ArrowDown className="w-4 h-4" />;
    return <Minus className="w-4 h-4" />;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{titulo}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {valor}
            {unidad && <span className="text-lg text-gray-600 dark:text-gray-400 ml-1">{unidad}</span>}
          </p>
          {cambio !== undefined && (
            <div className={`flex items-center mt-2 text-sm ${getTendenciaColor()}`}>
              {getTendenciaIcon()}
              <span className="ml-1">{Math.abs(cambio)}%</span>
            </div>
          )}
        </div>
        {icono && (
          <div className="text-gray-400 dark:text-gray-500">
            {icono}
          </div>
        )}
      </div>
    </div>
  );
}
