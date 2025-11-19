/**
 * Página de Entradas
 * Lista completa de todas las compras/entradas
 */

'use client';

import { useEffect, useState } from 'react';
import TablaDatos from '@/components/TablaDatos';
import Filtros, { FiltrosAplicados } from '@/components/Filtros';
import {
  cargarEntradas,
  formatearMoneda,
  formatearNumero,
  filtrarRegistros,
  obtenerValoresUnicos
} from '@/lib/datos';
import { ArchivoEntradas, RegistroEntrada } from '@/lib/types';

export default function EntradasPage() {
  const [datos, setDatos] = useState<ArchivoEntradas | null>(null);
  const [datosFiltrados, setDatosFiltrados] = useState<RegistroEntrada[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargar = async () => {
      try {
        const entradas = await cargarEntradas();
        setDatos(entradas);
        setDatosFiltrados(entradas.datos);
      } catch (error) {
        console.error('Error cargando datos:', error);
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, []);

  // Aplicar filtros (adaptado para usar Proveedor en lugar de Cliente)
  const handleFiltrar = (filtros: FiltrosAplicados) => {
    if (!datos) return;
    // Mapear cliente a proveedor para reutilizar la función de filtrado
    const filtrosAdaptados = {
      ...filtros,
      cliente: filtros.cliente // El filtro usa 'cliente' pero lo aplicamos al campo 'Proveedor'
    };
    const filtrados = datos.datos.filter(registro => {
      // Filtrar por especie
      if (filtrosAdaptados.especie && registro.Especie !== filtrosAdaptados.especie) {
        return false;
      }
      // Filtrar por variedad
      if (filtrosAdaptados.variedad && registro.Variedad !== filtrosAdaptados.variedad) {
        return false;
      }
      // Filtrar por calibre
      if (filtrosAdaptados.calibre && registro.Calibre !== filtrosAdaptados.calibre) {
        return false;
      }
      // Filtrar por proveedor (usando el campo cliente del filtro)
      if (filtrosAdaptados.cliente && registro.Proveedor !== filtrosAdaptados.cliente) {
        return false;
      }
      // Filtrar por temporada
      if (filtrosAdaptados.temporada && registro.Temporada !== filtrosAdaptados.temporada) {
        return false;
      }
      return true;
    });
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

  // Obtener valores únicos para filtros (usando Proveedor como Cliente)
  const especies = obtenerValoresUnicos(datos.datos, 'Especie');
  const variedades = obtenerValoresUnicos(datos.datos, 'Variedad');
  const calibres = obtenerValoresUnicos(datos.datos, 'Calibre');
  const proveedores = obtenerValoresUnicos(datos.datos, 'Proveedor');
  const temporadas = Array.from(new Set(datos.datos.map(d => d.Temporada))).sort();

  const columnas = [
    { clave: 'Fecha', titulo: 'Fecha' },
    { clave: 'Número', titulo: 'Nº Doc.' },
    { clave: 'Proveedor', titulo: 'Proveedor' },
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
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">Entradas (Compras)</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {datos.filas_totales} operaciones totales | {datosFiltrados.length} registros filtrados
          </p>
        </div>

        {/* Filtros - usando proveedores como clientes */}
        <Filtros
          especies={especies}
          variedades={variedades}
          calibres={calibres}
          clientes={proveedores}
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
