/**
 * Componente Filtros
 * Panel de filtros avanzados para datos
 */

'use client';

import { useState } from 'react';
import { Filter, X } from 'lucide-react';

interface FiltrosProps {
  especies: string[];
  variedades: string[];
  calibres: string[];
  clientes: string[];
  temporadas: number[];
  onFiltrar: (filtros: FiltrosAplicados) => void;
}

export interface FiltrosAplicados {
  especie?: string;
  variedad?: string;
  calibre?: string;
  cliente?: string;
  temporada?: number;
  fechaDesde?: string;
  fechaHasta?: string;
}

export default function Filtros({
  especies,
  variedades,
  calibres,
  clientes,
  temporadas,
  onFiltrar
}: FiltrosProps) {
  const [filtros, setFiltros] = useState<FiltrosAplicados>({});
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  const actualizarFiltro = (clave: keyof FiltrosAplicados, valor: any) => {
    const nuevosFiltros = {
      ...filtros,
      [clave]: valor || undefined
    };
    setFiltros(nuevosFiltros);
  };

  const aplicarFiltros = () => {
    onFiltrar(filtros);
  };

  const limpiarFiltros = () => {
    setFiltros({});
    onFiltrar({});
  };

  const contarFiltrosActivos = () => {
    return Object.values(filtros).filter(v => v !== undefined).length;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-4">
      {/* Botón toggle filtros */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setMostrarFiltros(!mostrarFiltros)}
          className="flex items-center space-x-3 px-4 py-2 bg-green-600 dark:bg-green-700 hover:bg-green-700 dark:hover:bg-green-600 text-white rounded-lg transition-colors shadow-sm"
        >
          <Filter className="w-5 h-5" />
          <span className="font-semibold">
            {mostrarFiltros ? 'Ocultar Filtros' : 'Mostrar Filtros'}
          </span>
          {contarFiltrosActivos() > 0 && (
            <span className="bg-white text-green-700 text-xs font-bold rounded-full px-2.5 py-0.5">
              {contarFiltrosActivos()}
            </span>
          )}
        </button>
        {contarFiltrosActivos() > 0 && (
          <button
            onClick={limpiarFiltros}
            className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 flex items-center space-x-1 font-medium px-3 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <X className="w-4 h-4" />
            <span>Limpiar Filtros</span>
          </button>
        )}
      </div>

      {/* Panel de filtros */}
      {mostrarFiltros && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Temporada */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Temporada
            </label>
            <select
              value={filtros.temporada || ''}
              onChange={(e) => actualizarFiltro('temporada', e.target.value ? parseInt(e.target.value) : undefined)}
              className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">Todas</option>
              {temporadas.map(temp => (
                <option key={temp} value={temp}>{temp}</option>
              ))}
            </select>
          </div>

          {/* Especie */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Especie
            </label>
            <select
              value={filtros.especie || ''}
              onChange={(e) => actualizarFiltro('especie', e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">Todas</option>
              {especies.map(esp => (
                <option key={esp} value={esp}>{esp}</option>
              ))}
            </select>
          </div>

          {/* Variedad */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Variedad
            </label>
            <select
              value={filtros.variedad || ''}
              onChange={(e) => actualizarFiltro('variedad', e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">Todas</option>
              {variedades.map(var1 => (
                <option key={var1} value={var1}>{var1}</option>
              ))}
            </select>
          </div>

          {/* Calibre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Calibre
            </label>
            <select
              value={filtros.calibre || ''}
              onChange={(e) => actualizarFiltro('calibre', e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">Todos</option>
              {calibres.map(cal => (
                <option key={cal} value={cal}>{cal}</option>
              ))}
            </select>
          </div>

          {/* Cliente */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Cliente
            </label>
            <select
              value={filtros.cliente || ''}
              onChange={(e) => actualizarFiltro('cliente', e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">Todos</option>
              {clientes.map(cli => (
                <option key={cli} value={cli}>{cli}</option>
              ))}
            </select>
          </div>

          {/* Fecha desde */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Desde
            </label>
            <input
              type="date"
              value={filtros.fechaDesde || ''}
              onChange={(e) => actualizarFiltro('fechaDesde', e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Fecha hasta */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Hasta
            </label>
            <input
              type="date"
              value={filtros.fechaHasta || ''}
              onChange={(e) => actualizarFiltro('fechaHasta', e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Botón aplicar */}
          <div className="md:col-span-2 lg:col-span-3 flex justify-end space-x-2">
            <button
              onClick={aplicarFiltros}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Aplicar Filtros
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
