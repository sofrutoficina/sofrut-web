/**
 * Página Principal - Dashboard
 * Muestra KPIs, gráficos y resumen de datos
 */

'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, ShoppingCart, Users, DollarSign } from 'lucide-react';
import KPICard from '@/components/KPICard';
import GraficoLineas from '@/components/GraficoLineas';
import GraficoBarras from '@/components/GraficoBarras';
import GraficoDona from '@/components/GraficoDona';
import Filtros, { FiltrosAplicados } from '@/components/Filtros';
import {
  cargarSalidas,
  filtrarRegistros,
  sumarCampo,
  formatearMoneda,
  formatearNumero,
  obtenerValoresUnicos,
  agruparPor,
  obtenerMesAño
} from '@/lib/datos';
import { ArchivoSalidas, RegistroSalida } from '@/lib/types';

export default function Home() {
  const [datos, setDatos] = useState<ArchivoSalidas | null>(null);
  const [datosFiltrados, setDatosFiltrados] = useState<RegistroSalida[]>([]);
  const [cargando, setCargando] = useState(true);

  // Cargar datos al inicio
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

  // Calcular KPIs
  const totalKg = sumarCampo(datosFiltrados, 'Peso Neto');
  const totalImporte = sumarCampo(datosFiltrados, 'Importe');
  const numOperaciones = datosFiltrados.length;
  const precioPromedio = totalImporte / totalKg;

  // Obtener valores únicos para filtros
  const especies = obtenerValoresUnicos(datos.datos, 'Especie');
  const variedades = obtenerValoresUnicos(datos.datos, 'Variedad');
  const calibres = obtenerValoresUnicos(datos.datos, 'Calibre');
  const clientes = obtenerValoresUnicos(datos.datos, 'Cliente');
  const temporadas = Array.from(new Set(datos.datos.map(d => d.Temporada))).sort();

  // Datos para gráfico de evolución mensual
  const porMes = agruparPor(datosFiltrados, 'Fecha');
  const evolucionMensual = Object.entries(porMes)
    .map(([fecha, registros]) => ({
      mes: obtenerMesAño(fecha),
      kg: sumarCampo(registros, 'Peso Neto'),
      importe: sumarCampo(registros, 'Importe')
    }))
    .sort((a, b) => a.mes.localeCompare(b.mes))
    .slice(-6); // Últimos 6 meses

  // Datos por cliente (todos)
  const porCliente = agruparPor(datosFiltrados, 'Cliente');
  const datosClientes = Object.entries(porCliente)
    .map(([cliente, registros]) => ({
      nombre: cliente,
      kg: sumarCampo(registros, 'Peso Neto'),
      importe: sumarCampo(registros, 'Importe')
    }))
    .sort((a, b) => b.kg - a.kg); // Ordenar por kg

  // Distribución por especie
  const porEspecie = agruparPor(datosFiltrados, 'Especie');
  const distribucionEspecie = Object.entries(porEspecie)
    .map(([especie, registros]) => ({
      nombre: especie,
      valor: sumarCampo(registros, 'Peso Neto')
    }))
    .sort((a, b) => b.valor - a.valor);

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Dashboard Sofrut</h1>
            <p className="text-gray-600 mt-2">
              Análisis de ventas y operaciones
            </p>
          </div>
          <div className="text-right text-sm text-gray-600">
            <p>{datos.filas_totales} registros totales</p>
            <p>{datosFiltrados.length} registros filtrados</p>
          </div>
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

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KPICard
            titulo="Total Vendido"
            valor={formatearNumero(totalKg, 0)}
            unidad="kg"
            icono={<TrendingUp className="w-8 h-8" />}
            tipo="positivo"
          />
          <KPICard
            titulo="Facturación Total"
            valor={formatearMoneda(totalImporte)}
            icono={<DollarSign className="w-8 h-8" />}
            tipo="positivo"
          />
          <KPICard
            titulo="Operaciones"
            valor={numOperaciones}
            icono={<ShoppingCart className="w-8 h-8" />}
          />
          <KPICard
            titulo="Precio Promedio"
            valor={formatearMoneda(precioPromedio)}
            unidad="/kg"
            icono={<Users className="w-8 h-8" />}
          />
        </div>

        {/* Evolución mensual */}
        <GraficoLineas
          datos={evolucionMensual}
          claveX="mes"
          clavesY={[
            { clave: 'kg', nombre: 'Kg Vendidos', color: '#10b981', tipo: 'kg' },
            { clave: 'importe', nombre: 'Importe', color: '#3b82f6', tipo: 'euros' }
          ]}
          titulo="Evolución Mensual (Últimos 6 meses)"
          altura={300}
        />

        {/* Análisis por cliente (Kg + Facturación) - Ancho completo con zoom */}
        <GraficoBarras
          datos={datosClientes}
          claveX="nombre"
          clavesY={[
            { clave: 'kg', nombre: 'Kg Vendidos', color: '#10b981', tipo: 'kg' },
            { clave: 'importe', nombre: 'Facturación', color: '#3b82f6', tipo: 'euros' }
          ]}
          titulo="Análisis por Cliente (Kg y Facturación)"
          altura={400}
          zoom={true}
        />

        {/* Distribución por especie */}
        <GraficoDona
          datos={distribucionEspecie}
          titulo="Distribución por Especie (kg)"
          altura={350}
        />
      </div>
    </main>
  );
}
