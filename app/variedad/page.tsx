/**
 * Página de Análisis por Variedad
 * Permite analizar en detalle una variedad específica (ej: UFO 4)
 */

'use client';

import { useEffect, useState } from 'react';
import { Search, TrendingUp, Users, DollarSign, Package } from 'lucide-react';
import KPICard from '@/components/KPICard';
import GraficoLineas from '@/components/GraficoLineas';
import GraficoBarras from '@/components/GraficoBarras';
import TablaDatos from '@/components/TablaDatos';
import {
  cargarSalidas,
  filtrarRegistros,
  sumarCampo,
  formatearMoneda,
  formatearNumero,
  obtenerValoresUnicos,
  agruparPor,
  obtenerMesAño,
  promedioCampo
} from '@/lib/datos';
import { ArchivoSalidas, RegistroSalida } from '@/lib/types';

export default function VariedadPage() {
  const [datos, setDatos] = useState<ArchivoSalidas | null>(null);
  const [variedadSeleccionada, setVariedadSeleccionada] = useState<string>('');
  const [datosFiltrados, setDatosFiltrados] = useState<RegistroSalida[]>([]);
  const [cargando, setCargando] = useState(true);

  // Cargar datos al inicio
  useEffect(() => {
    const cargar = async () => {
      try {
        const salidas = await cargarSalidas();
        setDatos(salidas);
      } catch (error) {
        console.error('Error cargando datos:', error);
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, []);

  // Filtrar cuando cambia la variedad
  useEffect(() => {
    if (!datos || !variedadSeleccionada) {
      setDatosFiltrados([]);
      return;
    }

    const filtrados = filtrarRegistros(datos.datos, {
      variedad: variedadSeleccionada
    });
    setDatosFiltrados(filtrados);
  }, [datos, variedadSeleccionada]);

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

  const variedades = obtenerValoresUnicos(datos.datos, 'Variedad');

  // Si no hay variedad seleccionada, mostrar selector
  if (!variedadSeleccionada) {
    return (
      <main className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Análisis por Variedad</h1>

          <div className="bg-white rounded-lg shadow p-8">
            <div className="flex items-center space-x-4 mb-6">
              <Search className="w-6 h-6 text-gray-400" />
              <h2 className="text-xl font-semibold text-gray-900">Selecciona una variedad para analizar</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {variedades.map(variedad => (
                <button
                  key={variedad}
                  onClick={() => setVariedadSeleccionada(variedad)}
                  className="p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors text-left"
                >
                  <p className="font-semibold text-gray-900">{variedad}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {datos.datos.filter(d => d.Variedad === variedad).length} registros
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Calcular KPIs de la variedad
  const totalKg = sumarCampo(datosFiltrados, 'Peso Neto');
  const totalImporte = sumarCampo(datosFiltrados, 'Importe');
  const numOperaciones = datosFiltrados.length;
  const precioPromedio = totalImporte / totalKg;

  // Datos por calibre
  const porCalibre = agruparPor(datosFiltrados, 'Calibre');
  const datosCalibre = Object.entries(porCalibre)
    .map(([calibre, registros]) => ({
      nombre: calibre || 'Sin calibre',
      kg: sumarCampo(registros, 'Peso Neto'),
      importe: sumarCampo(registros, 'Importe')
    }))
    .sort((a, b) => b.kg - a.kg);

  // Datos por cliente
  const porCliente = agruparPor(datosFiltrados, 'Cliente');
  const datosCliente = Object.entries(porCliente)
    .map(([cliente, registros]) => ({
      nombre: cliente,
      kg: sumarCampo(registros, 'Peso Neto'),
      importe: sumarCampo(registros, 'Importe'),
      operaciones: registros.length
    }))
    .sort((a, b) => b.importe - a.importe)
    .slice(0, 10);

  // Evolución de precios
  const porMes = agruparPor(datosFiltrados, 'Fecha');
  const evolucionPrecios = Object.entries(porMes)
    .map(([fecha, registros]) => ({
      mes: obtenerMesAño(fecha),
      precio: promedioCampo(registros, 'Precio'),
      kg: sumarCampo(registros, 'Peso Neto')
    }))
    .sort((a, b) => a.mes.localeCompare(b.mes));

  // Datos para tabla
  const columnasTabla = [
    { clave: 'Fecha', titulo: 'Fecha' },
    { clave: 'Cliente', titulo: 'Cliente' },
    { clave: 'Calibre', titulo: 'Calibre' },
    { clave: 'Peso Neto', titulo: 'Kg', formato: (v: number) => formatearNumero(v, 1) },
    { clave: 'Precio', titulo: 'Precio', formato: (v: number) => formatearMoneda(v) },
    { clave: 'Importe', titulo: 'Importe', formato: (v: number) => formatearMoneda(v) }
  ];

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <button
              onClick={() => setVariedadSeleccionada('')}
              className="text-sm text-green-600 hover:text-green-700 mb-2"
            >
              ← Volver a selección
            </button>
            <h1 className="text-4xl font-bold text-gray-900">{variedadSeleccionada}</h1>
            <p className="text-gray-600 mt-2">Análisis detallado de variedad</p>
          </div>
          <div className="text-right text-sm text-gray-600">
            <p>{numOperaciones} operaciones</p>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KPICard
            titulo="Total Vendido"
            valor={formatearNumero(totalKg, 0)}
            unidad="kg"
            icono={<Package className="w-8 h-8" />}
            tipo="positivo"
          />
          <KPICard
            titulo="Facturación"
            valor={formatearMoneda(totalImporte)}
            icono={<DollarSign className="w-8 h-8" />}
            tipo="positivo"
          />
          <KPICard
            titulo="Operaciones"
            valor={numOperaciones}
            icono={<TrendingUp className="w-8 h-8" />}
          />
          <KPICard
            titulo="Precio Promedio"
            valor={formatearMoneda(precioPromedio)}
            unidad="/kg"
            icono={<Users className="w-8 h-8" />}
          />
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Ventas por calibre */}
          <GraficoBarras
            datos={datosCalibre}
            claveX="nombre"
            clavesY={[
              { clave: 'kg', nombre: 'Kg Vendidos', color: '#10b981' }
            ]}
            titulo="Ventas por Calibre"
            altura={300}
          />

          {/* Evolución de precios */}
          <GraficoLineas
            datos={evolucionPrecios}
            claveX="mes"
            clavesY={[
              { clave: 'precio', nombre: 'Precio Promedio (€/kg)', color: '#3b82f6' }
            ]}
            titulo="Evolución de Precios"
            altura={300}
          />
        </div>

        {/* Top clientes */}
        <GraficoBarras
          datos={datosCliente}
          claveX="nombre"
          clavesY={[
            { clave: 'importe', nombre: 'Facturación (€)', color: '#10b981' }
          ]}
          titulo="Top 10 Clientes"
          altura={300}
        />

        {/* Tabla de detalle */}
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Detalle de Operaciones</h3>
          <TablaDatos
            columnas={columnasTabla}
            datos={datosFiltrados}
            porPagina={15}
          />
        </div>
      </div>
    </main>
  );
}
