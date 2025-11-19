/**
 * Página Por Cliente
 * Análisis detallado por cliente con KPIs y gráficos
 */

'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, DollarSign, ShoppingCart, Package } from 'lucide-react';
import KPICard from '@/components/KPICard';
import GraficoLineas from '@/components/GraficoLineas';
import GraficoBarras from '@/components/GraficoBarras';
import GraficoDona from '@/components/GraficoDona';
import Filtros, { FiltrosAplicados } from '@/components/Filtros';
import {
  cargarSalidas,
  formatearMoneda,
  formatearNumero,
  obtenerValoresUnicos,
  agruparPor,
  sumarCampo,
  obtenerMesAño,
  filtrarRegistros,
  promedioCampo
} from '@/lib/datos';
import { ArchivoSalidas, RegistroSalida } from '@/lib/types';

export default function ClientePage() {
  const [datos, setDatos] = useState<ArchivoSalidas | null>(null);
  const [datosFiltrados, setDatosFiltrados] = useState<RegistroSalida[]>([]);
  const [cargando, setCargando] = useState(true);
  const [clienteSeleccionado, setClienteSeleccionado] = useState<string>('');

  useEffect(() => {
    const cargar = async () => {
      try {
        const salidas = await cargarSalidas();
        setDatos(salidas);
        setDatosFiltrados(salidas.datos);
        // Seleccionar primer cliente por defecto
        const clientes = obtenerValoresUnicos(salidas.datos, 'Cliente');
        if (clientes.length > 0) {
          setClienteSeleccionado(clientes[0]);
        }
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
          <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando datos...</p>
        </div>
      </div>
    );
  }

  if (!datos || !clienteSeleccionado) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600">Error cargando datos</p>
        </div>
      </div>
    );
  }

  const clientes = obtenerValoresUnicos(datos.datos, 'Cliente');
  const especies = obtenerValoresUnicos(datos.datos, 'Especie');
  const variedades = obtenerValoresUnicos(datos.datos, 'Variedad');
  const calibres = obtenerValoresUnicos(datos.datos, 'Calibre');
  const temporadas = Array.from(new Set(datos.datos.map(d => d.Temporada))).sort();

  // Filtrar por cliente seleccionado y filtros aplicados
  const datosCliente = datosFiltrados.filter(d => d.Cliente === clienteSeleccionado);

  // KPIs del cliente
  const totalKg = sumarCampo(datosCliente, 'Peso Neto');
  const totalImporte = sumarCampo(datosCliente, 'Importe');
  const numOperaciones = datosCliente.length;
  const precioPromedio = totalImporte / totalKg;

  // Evolución mensual del cliente
  const porMes = agruparPor(datosCliente, 'Fecha');
  const evolucionMensual = Object.entries(porMes)
    .map(([fecha, registros]) => ({
      mes: obtenerMesAño(fecha),
      kg: sumarCampo(registros, 'Peso Neto'),
      importe: sumarCampo(registros, 'Importe')
    }))
    .sort((a, b) => a.mes.localeCompare(b.mes));

  // Distribución por especie
  const porEspecie = agruparPor(datosCliente, 'Especie');
  const distribucionEspecie = Object.entries(porEspecie)
    .map(([especie, registros]) => ({
      nombre: especie,
      valor: sumarCampo(registros, 'Peso Neto')
    }))
    .sort((a, b) => b.valor - a.valor);

  // Distribución por variedad
  const porVariedad = agruparPor(datosCliente, 'Variedad');
  const distribucionVariedad = Object.entries(porVariedad)
    .map(([variedad, registros]) => ({
      nombre: variedad,
      kg: sumarCampo(registros, 'Peso Neto'),
      importe: sumarCampo(registros, 'Importe')
    }))
    .sort((a, b) => b.kg - a.kg)
    .slice(0, 10);

  // Distribución por calibre
  const porCalibre = agruparPor(datosCliente, 'Calibre');
  const distribucionCalibre = Object.entries(porCalibre)
    .map(([calibre, registros]) => ({
      nombre: calibre || 'Sin especificar',
      kg: sumarCampo(registros, 'Peso Neto'),
      importe: sumarCampo(registros, 'Importe'),
      precio: sumarCampo(registros, 'Importe') / sumarCampo(registros, 'Peso Neto')
    }))
    .sort((a, b) => b.kg - a.kg);

  // Evolución de precios por variedad (top 5)
  const variedadesTop5 = distribucionVariedad.slice(0, 5);
  const evolucionPrecios = evolucionMensual.map(mes => {
    const datosMes = datosCliente.filter(d => obtenerMesAño(d.Fecha) === mes.mes);
    const resultado: any = { mes: mes.mes };

    variedadesTop5.forEach(v => {
      const datoVariedad = datosMes.filter(d => d.Variedad === v.nombre);
      if (datoVariedad.length > 0) {
        const precio = sumarCampo(datoVariedad, 'Importe') / sumarCampo(datoVariedad, 'Peso Neto');
        resultado[v.nombre] = precio;
      }
    });

    return resultado;
  });

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">Análisis por Cliente</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Selecciona un cliente para ver análisis detallado
            </p>
          </div>
        </div>

        {/* Selector de cliente */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Cliente
          </label>
          <select
            value={clienteSeleccionado}
            onChange={(e) => setClienteSeleccionado(e.target.value)}
            className="w-full max-w-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            {clientes.map(cliente => (
              <option key={cliente} value={cliente}>{cliente}</option>
            ))}
          </select>
        </div>

        {/* Filtros adicionales */}
        <Filtros
          especies={especies}
          variedades={variedades}
          calibres={calibres}
          clientes={[]}
          temporadas={temporadas}
          onFiltrar={handleFiltrar}
        />

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
            icono={<TrendingUp className="w-8 h-8" />}
          />
        </div>

        {/* Evolución mensual */}
        <GraficoLineas
          datos={evolucionMensual}
          claveX="mes"
          clavesY={[
            { clave: 'kg', nombre: 'Kg Vendidos', color: '#10b981', tipo: 'kg' },
            { clave: 'importe', nombre: 'Facturación', color: '#3b82f6', tipo: 'euros' }
          ]}
          titulo={`Evolución Mensual - ${clienteSeleccionado}`}
          altura={300}
        />

        {/* Gráficos de distribución */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Por especie */}
          <GraficoDona
            datos={distribucionEspecie}
            titulo="Distribución por Especie (kg)"
            altura={350}
            tipo="kg"
          />

          {/* Por calibre */}
          <GraficoBarras
            datos={distribucionCalibre}
            claveX="nombre"
            clavesY={[
              { clave: 'kg', nombre: 'Kg', color: '#10b981', tipo: 'kg' },
              { clave: 'importe', nombre: 'Facturación', color: '#3b82f6', tipo: 'euros' }
            ]}
            titulo="Análisis por Calibre (Kg y Facturación)"
            altura={350}
          />
        </div>

        {/* Análisis de precios por calibre */}
        <GraficoBarras
          datos={distribucionCalibre}
          claveX="nombre"
          clavesY={[
            { clave: 'precio', nombre: 'Precio Medio €/kg', color: '#f59e0b', tipo: 'euros' }
          ]}
          titulo="Precio Medio por Calibre"
          altura={300}
        />

        {/* Evolución de precios por variedad */}
        {variedadesTop5.length > 0 && (
          <GraficoLineas
            datos={evolucionPrecios}
            claveX="mes"
            clavesY={variedadesTop5.map((v, idx) => ({
              clave: v.nombre,
              nombre: v.nombre,
              color: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'][idx],
              tipo: 'euros' as const
            }))}
            titulo="Evolución de Precios por Variedad (Top 5)"
            altura={300}
          />
        )}

        {/* Top variedades */}
        <GraficoBarras
          datos={distribucionVariedad}
          claveX="nombre"
          clavesY={[
            { clave: 'kg', nombre: 'Kg', color: '#10b981', tipo: 'kg' }
          ]}
          titulo="Top 10 Variedades"
          altura={350}
        />
      </div>
    </main>
  );
}
