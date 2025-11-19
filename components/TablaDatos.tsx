/**
 * Componente TablaDatos
 * Tabla interactiva con ordenación, búsqueda, agrupación y paginación
 */

'use client';

import React, { useState, useMemo } from 'react';
import { ArrowUpDown, Search, ChevronRight, ChevronDown, Layers } from 'lucide-react';

interface Columna {
  clave: string;
  titulo: string;
  formato?: (valor: any) => string;
}

interface TablaDatosProps {
  columnas: Columna[];
  datos: any[];
  porPagina?: number;
}

export default function TablaDatos({
  columnas,
  datos,
  porPagina = 10
}: TablaDatosProps) {
  const [ordenPor, setOrdenPor] = useState<string | null>(null);
  const [ordenDesc, setOrdenDesc] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [paginaActual, setPaginaActual] = useState(1);
  const [registrosPorPagina, setRegistrosPorPagina] = useState(porPagina);
  const [agruparPor, setAgruparPor] = useState<string>('');
  const [gruposExpandidos, setGruposExpandidos] = useState<Set<string>>(new Set());

  // Filtrar datos por búsqueda
  const datosFiltrados = datos.filter(fila => {
    if (!busqueda) return true;
    return Object.values(fila).some(valor =>
      String(valor).toLowerCase().includes(busqueda.toLowerCase())
    );
  });

  // Ordenar datos
  const datosOrdenados = useMemo(() => {
    return [...datosFiltrados].sort((a, b) => {
      if (!ordenPor) return 0;

      const valorA = a[ordenPor];
      const valorB = b[ordenPor];

      if (valorA === valorB) return 0;

      let comparacion = 0;
      if (typeof valorA === 'number' && typeof valorB === 'number') {
        comparacion = valorA - valorB;
      } else {
        comparacion = String(valorA).localeCompare(String(valorB));
      }

      return ordenDesc ? -comparacion : comparacion;
    });
  }, [datosFiltrados, ordenPor, ordenDesc]);

  // Agrupar datos
  const datosAgrupados = useMemo(() => {
    if (!agruparPor) return null;

    const grupos: { [key: string]: any[] } = {};
    datosOrdenados.forEach(fila => {
      const clave = String(fila[agruparPor] || 'Sin especificar');
      if (!grupos[clave]) {
        grupos[clave] = [];
      }
      grupos[clave].push(fila);
    });

    return grupos;
  }, [datosOrdenados, agruparPor]);

  // Calcular sumatorios por grupo
  const calcularSumatorios = (grupo: any[]) => {
    const sumatorios: { [key: string]: number | string } = {};
    columnas.forEach(col => {
      const primerValor = grupo[0]?.[col.clave];
      if (typeof primerValor === 'number') {
        sumatorios[col.clave] = grupo.reduce((sum, fila) => sum + (fila[col.clave] || 0), 0);
      } else {
        sumatorios[col.clave] = '';
      }
    });
    return sumatorios;
  };

  // Toggle grupo expandido
  const toggleGrupo = (nombreGrupo: string) => {
    const nuevosExpandidos = new Set(gruposExpandidos);
    if (nuevosExpandidos.has(nombreGrupo)) {
      nuevosExpandidos.delete(nombreGrupo);
    } else {
      nuevosExpandidos.add(nombreGrupo);
    }
    setGruposExpandidos(nuevosExpandidos);
  };

  // Expandir/contraer todos
  const expandirTodos = () => {
    if (datosAgrupados) {
      setGruposExpandidos(new Set(Object.keys(datosAgrupados)));
    }
  };

  const contraerTodos = () => {
    setGruposExpandidos(new Set());
  };

  // Paginar datos
  const totalPaginas = Math.ceil(datosOrdenados.length / registrosPorPagina);
  const inicio = (paginaActual - 1) * registrosPorPagina;
  const fin = inicio + registrosPorPagina;
  const datosPaginados = datosOrdenados.slice(inicio, fin);

  const handleOrdenar = (clave: string) => {
    if (ordenPor === clave) {
      setOrdenDesc(!ordenDesc);
    } else {
      setOrdenPor(clave);
      setOrdenDesc(false);
    }
  };

  const handleCambiarRegistrosPorPagina = (cantidad: number) => {
    setRegistrosPorPagina(cantidad);
    setPaginaActual(1);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      {/* Barra de búsqueda y controles */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
          {/* Búsqueda */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar..."
              value={busqueda}
              onChange={(e) => {
                setBusqueda(e.target.value);
                setPaginaActual(1);
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Agrupar por */}
          <div className="flex items-center space-x-2">
            <Layers className="text-gray-400 dark:text-gray-500 w-5 h-5 flex-shrink-0" />
            <select
              value={agruparPor}
              onChange={(e) => {
                setAgruparPor(e.target.value);
                setPaginaActual(1);
                if (e.target.value) {
                  setGruposExpandidos(new Set());
                }
              }}
              className="flex-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">Sin agrupar</option>
              {columnas.map(col => (
                <option key={col.clave} value={col.clave}>Agrupar por {col.titulo}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between flex-wrap gap-2">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {datosFiltrados.length} resultados
            {busqueda && ` (filtrados de ${datos.length} totales)`}
          </p>

          <div className="flex items-center space-x-4">
            {/* Selector de registros por página (solo si no hay agrupación) */}
            {!agruparPor && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Por página:</span>
                <select
                  value={registrosPorPagina}
                  onChange={(e) => handleCambiarRegistrosPorPagina(Number(e.target.value))}
                  className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                  <option value={200}>200</option>
                </select>
              </div>
            )}

            {/* Controles de expansión cuando hay agrupación */}
            {agruparPor && datosAgrupados && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={expandirTodos}
                  className="text-sm text-green-600 dark:text-green-400 hover:underline"
                >
                  Expandir todos
                </button>
                <span className="text-gray-400">|</span>
                <button
                  onClick={contraerTodos}
                  className="text-sm text-green-600 dark:text-green-400 hover:underline"
                >
                  Contraer todos
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
            <tr>
              {agruparPor && <th className="px-6 py-3 w-12"></th>}
              {columnas.map((columna) => (
                <th
                  key={columna.clave}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                  onClick={() => handleOrdenar(columna.clave)}
                >
                  <div className="flex items-center space-x-1">
                    <span>{columna.titulo}</span>
                    <ArrowUpDown className="w-4 h-4" />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {/* Modo agrupado */}
            {agruparPor && datosAgrupados && Object.entries(datosAgrupados).map(([nombreGrupo, filasGrupo]) => {
              const expandido = gruposExpandidos.has(nombreGrupo);
              const sumatorios = calcularSumatorios(filasGrupo);

              return (
                <React.Fragment key={nombreGrupo}>
                  {/* Fila de grupo */}
                  <tr
                    className="bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 cursor-pointer font-semibold"
                    onClick={() => toggleGrupo(nombreGrupo)}
                  >
                    <td className="px-6 py-3">
                      {expandido ? (
                        <ChevronDown className="w-5 h-5 text-green-600 dark:text-green-400" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-green-600 dark:text-green-400" />
                      )}
                    </td>
                    <td colSpan={columnas.length} className="px-6 py-3 text-sm text-gray-900 dark:text-gray-100">
                      {nombreGrupo} <span className="text-gray-500 dark:text-gray-400">({filasGrupo.length} registros)</span>
                    </td>
                  </tr>

                  {/* Filas del grupo (si está expandido) */}
                  {expandido && filasGrupo.map((fila, idx) => (
                    <tr key={`${nombreGrupo}-${idx}`} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4"></td>
                      {columnas.map((columna) => (
                        <td key={columna.clave} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                          {columna.formato
                            ? columna.formato(fila[columna.clave])
                            : fila[columna.clave] || '-'}
                        </td>
                      ))}
                    </tr>
                  ))}

                  {/* Fila de sumatorios (si está expandido) */}
                  {expandido && (
                    <tr className="bg-blue-50 dark:bg-blue-900/20 font-semibold">
                      <td className="px-6 py-3"></td>
                      {columnas.map((columna, colIdx) => (
                        <td key={columna.clave} className="px-6 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                          {colIdx === 0 ? 'Total:' : (
                            typeof sumatorios[columna.clave] === 'number' && sumatorios[columna.clave] !== 0
                              ? columna.formato
                                ? columna.formato(sumatorios[columna.clave])
                                : sumatorios[columna.clave]
                              : ''
                          )}
                        </td>
                      ))}
                    </tr>
                  )}
                </React.Fragment>
              );
            })}

            {/* Modo normal (sin agrupar) */}
            {!agruparPor && datosPaginados.map((fila, idx) => (
              <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                {columnas.map((columna) => (
                  <td key={columna.clave} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {columna.formato
                      ? columna.formato(fila[columna.clave])
                      : fila[columna.clave] || '-'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginación (solo si no hay agrupación) */}
      {!agruparPor && totalPaginas > 1 && (
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <button
            onClick={() => setPaginaActual(Math.max(1, paginaActual - 1))}
            disabled={paginaActual === 1}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-600"
          >
            Anterior
          </button>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Página {paginaActual} de {totalPaginas}
          </span>
          <button
            onClick={() => setPaginaActual(Math.min(totalPaginas, paginaActual + 1))}
            disabled={paginaActual === totalPaginas}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-600"
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
}
