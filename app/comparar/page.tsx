/**
 * Página de Comparación de Temporadas
 * Compara datos entre diferentes temporadas (2024 vs 2025)
 */

'use client';

import { useEffect, useState } from 'react';
import { ArrowUpDown } from 'lucide-react';
import KPICard from '@/components/KPICard';
import GraficoBarras from '@/components/GraficoBarras';
import Filtros, { FiltrosAplicados } from '@/components/Filtros';
import {
  cargarSalidas,
  sumarCampo,
  formatearMoneda,
  formatearNumero,
  agruparPor,
  filtrarRegistros,
  obtenerValoresUnicos
} from '@/lib/datos';
import { ArchivoSalidas, RegistroSalida } from '@/lib/types';

export default function CompararPage() {
  const [datos, setDatos] = useState<ArchivoSalidas | null>(null);
  const [datosFiltrados, setDatosFiltrados] = useState<RegistroSalida[]>([]);
  const [temp1, setTemp1] = useState<number>(2024);
  const [temp2, setTemp2] = useState<number>(2025);
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

  // Filtrar datos por temporada (aplicando los filtros generales)
  const datosTemp1 = datosFiltrados.filter(d => d.Temporada === temp1);
  const datosTemp2 = datosFiltrados.filter(d => d.Temporada === temp2);

  // KPIs Temporada 1
  const kgTemp1 = sumarCampo(datosTemp1, 'Peso Neto');
  const importeTemp1 = sumarCampo(datosTemp1, 'Importe');
  const opsTemp1 = datosTemp1.length;
  const precioTemp1 = importeTemp1 / kgTemp1;

  // KPIs Temporada 2
  const kgTemp2 = sumarCampo(datosTemp2, 'Peso Neto');
  const importeTemp2 = sumarCampo(datosTemp2, 'Importe');
  const opsTemp2 = datosTemp2.length;
  const precioTemp2 = importeTemp2 / kgTemp2;

  // Calcular cambios porcentuales
  const cambioKg = ((kgTemp2 - kgTemp1) / kgTemp1) * 100;
  const cambioImporte = ((importeTemp2 - importeTemp1) / importeTemp1) * 100;
  const cambioOps = ((opsTemp2 - opsTemp1) / opsTemp1) * 100;
  const cambioPrecio = ((precioTemp2 - precioTemp1) / precioTemp1) * 100;

  // Comparación por especie
  const especiesTemp1 = agruparPor(datosTemp1, 'Especie');
  const especiesTemp2 = agruparPor(datosTemp2, 'Especie');

  const todasEspecies = Array.from(
    new Set([...Object.keys(especiesTemp1), ...Object.keys(especiesTemp2)])
  );

  const comparacionEspecies = todasEspecies.map(especie => ({
    nombre: especie,
    temp1: sumarCampo(especiesTemp1[especie] || [], 'Peso Neto'),
    temp2: sumarCampo(especiesTemp2[especie] || [], 'Peso Neto')
  }));

  // Comparación por variedad (top 10)
  const variedadesTemp1 = agruparPor(datosTemp1, 'Variedad');
  const variedadesTemp2 = agruparPor(datosTemp2, 'Variedad');

  const todasVariedades = Array.from(
    new Set([...Object.keys(variedadesTemp1), ...Object.keys(variedadesTemp2)])
  );

  const comparacionVariedades = todasVariedades
    .map(variedad => ({
      nombre: variedad,
      temp1: sumarCampo(variedadesTemp1[variedad] || [], 'Peso Neto'),
      temp2: sumarCampo(variedadesTemp2[variedad] || [], 'Peso Neto')
    }))
    .sort((a, b) => (b.temp1 + b.temp2) - (a.temp1 + a.temp2))
    .slice(0, 10);

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">Comparar Temporadas</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Análisis comparativo entre temporadas</p>
        </div>

        {/* Filtros generales */}
        <Filtros
          especies={especies}
          variedades={variedades}
          calibres={calibres}
          clientes={clientes}
          temporadas={[]}
          onFiltrar={handleFiltrar}
        />

        {/* Selectores de temporada */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-center space-x-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Temporada 1
              </label>
              <select
                value={temp1}
                onChange={(e) => setTemp1(parseInt(e.target.value))}
                className="border rounded-lg px-4 py-2 text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {temporadas.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <ArrowUpDown className="w-8 h-8 text-gray-400 mt-6" />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Temporada 2
              </label>
              <select
                value={temp2}
                onChange={(e) => setTemp2(parseInt(e.target.value))}
                className="border rounded-lg px-4 py-2 text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {temporadas.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Comparación de KPIs */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Métricas Principales</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <KPICard
              titulo={`Kg Vendidos (${temp1} vs ${temp2})`}
              valor={`${formatearNumero(kgTemp1, 0)} → ${formatearNumero(kgTemp2, 0)}`}
              cambio={isFinite(cambioKg) ? Math.round(cambioKg) : 0}
              tipo={cambioKg > 0 ? 'positivo' : cambioKg < 0 ? 'negativo' : 'neutral'}
            />
            <KPICard
              titulo={`Facturación (${temp1} vs ${temp2})`}
              valor={`${formatearMoneda(importeTemp1)} → ${formatearMoneda(importeTemp2)}`}
              cambio={isFinite(cambioImporte) ? Math.round(cambioImporte) : 0}
              tipo={cambioImporte > 0 ? 'positivo' : cambioImporte < 0 ? 'negativo' : 'neutral'}
            />
            <KPICard
              titulo={`Operaciones (${temp1} vs ${temp2})`}
              valor={`${opsTemp1} → ${opsTemp2}`}
              cambio={isFinite(cambioOps) ? Math.round(cambioOps) : 0}
              tipo={cambioOps > 0 ? 'positivo' : cambioOps < 0 ? 'negativo' : 'neutral'}
            />
            <KPICard
              titulo={`Precio Promedio (${temp1} vs ${temp2})`}
              valor={`${formatearMoneda(precioTemp1)} → ${formatearMoneda(precioTemp2)}`}
              cambio={isFinite(cambioPrecio) ? Math.round(cambioPrecio) : 0}
              tipo={cambioPrecio > 0 ? 'positivo' : cambioPrecio < 0 ? 'negativo' : 'neutral'}
            />
          </div>
        </div>

        {/* Gráficos comparativos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GraficoBarras
            datos={comparacionEspecies}
            claveX="nombre"
            clavesY={[
              { clave: 'temp1', nombre: `Temporada ${temp1}`, color: '#3b82f6', tipo: 'kg' },
              { clave: 'temp2', nombre: `Temporada ${temp2}`, color: '#10b981', tipo: 'kg' }
            ]}
            titulo="Comparación por Especie"
            altura={350}
          />

          <GraficoBarras
            datos={comparacionVariedades}
            claveX="nombre"
            clavesY={[
              { clave: 'temp1', nombre: `Temporada ${temp1}`, color: '#3b82f6', tipo: 'kg' },
              { clave: 'temp2', nombre: `Temporada ${temp2}`, color: '#10b981', tipo: 'kg' }
            ]}
            titulo="Top 10 Variedades Comparadas"
            altura={350}
          />
        </div>
      </div>
    </main>
  );
}
