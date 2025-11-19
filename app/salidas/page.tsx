/**
 * Página de Salidas
 * Lista completa de todas las ventas con filtros y búsqueda
 */

'use client';

import { useEffect, useState } from 'react';
import TablaDatos from '@/components/TablaDatos';
import Filtros, { FiltrosAplicados } from '@/components/Filtros';
import {
  cargarSalidas,
  formatearMoneda,
  formatearNumero,
  filtrarRegistros,
  obtenerValoresUnicos
} from '@/lib/datos';
import { ArchivoSalidas, RegistroSalida } from '@/lib/types';

export default function SalidasPage() {
  const [datos, setDatos] = useState<ArchivoSalidas | null>(null);
  const [datosFiltrados, setDatosFiltrados] = useState<RegistroSalida[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargar = async () => {
      try {
        const salidas = await cargarSalidas();
        setDatos(salidas);
        setDatosFiltrados(salidas.datos);
      } catch (error) {
        console.error('Error cargando datos:', error);
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, []);

  // Aplicar filtros
  const handleFiltrar = (filtros: FiltrosAplicados) => {
    if (!datos) return;
    const filtrados = filtrarRegistros(datos.datos, filtros);
    setDatosFiltrados(filtrados);
  };

  if (cargando) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando datos...</p>
        </div>
      </div>
    );
  }

  if (!datos) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600">Error cargando datos</p>
        </div>
      </div>
    );
  }

  // Obtener valores únicos para filtros
  const especies = obtenerValoresUnicos(datos.datos, 'Especie');
  const variedades = obtenerValoresUnicos(datos.datos, 'Variedad');
  const calibres = obtenerValoresUnicos(datos.datos, 'Calibre');
  const clientes = obtenerValoresUnicos(datos.datos, 'Cliente');
  const temporadas = Array.from(new Set(datos.datos.map(d => d.Temporada))).sort();

  const columnas = [
    { clave: 'Fecha', titulo: 'Fecha' },
    { clave: 'Cliente', titulo: 'Cliente' },
    { clave: 'Especie', titulo: 'Especie' },
    { clave: 'Variedad', titulo: 'Variedad' },
    { clave: 'Calibre', titulo: 'Calibre' },
    { clave: 'Peso Neto', titulo: 'Kg', formato: (v: number) => formatearNumero(v, 1) },
    { clave: 'Precio', titulo: 'Precio €/kg', formato: (v: number) => formatearMoneda(v) },
    { clave: 'Importe', titulo: 'Total €', formato: (v: number) => formatearMoneda(v) },
    { clave: 'Temporada', titulo: 'Temp.' }
  ];

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">Salidas (Ventas)</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {datos.filas_totales} operaciones totales | {datosFiltrados.length} registros filtrados
          </p>
        </div>

        {/* Filtros */}
        <Filtros
          especies={especies}
          variedades={variedades}
          calibres={calibres}
          clientes={clientes}
          temporadas={temporadas}
          onFiltrar={handleFiltrar}
        />

        {/* Tabla */}
        <TablaDatos
          columnas={columnas}
          datos={datosFiltrados}
          porPagina={20}
        />
      </div>
    </main>
  );
}
