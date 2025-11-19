/**
 * Componente GraficoBarras
 * Gráfico de barras para comparativas
 */

'use client';

import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Brush } from 'recharts';
import { formatearKgGrafico, formatearEurosGrafico } from '@/lib/datos';
import { ZoomIn, ZoomOut } from 'lucide-react';

interface GraficoBarrasProps {
  datos: any[];
  claveX: string;
  clavesY: { clave: string; nombre: string; color: string; tipo?: 'kg' | 'euros' }[];
  titulo?: string;
  altura?: number;
  zoom?: boolean;
}

export default function GraficoBarras({
  datos,
  claveX,
  clavesY,
  titulo,
  altura = 300,
  zoom = false
}: GraficoBarrasProps) {
  const [startIndex, setStartIndex] = useState(0);
  const [endIndex, setEndIndex] = useState(Math.min(datos.length - 1, 9)); // Mostrar 10 elementos inicialmente

  const formatearTooltip = (value: any, name: string) => {
    const barConfig = clavesY.find(y => y.nombre === name);
    if (!barConfig) return value;

    if (barConfig.tipo === 'kg') {
      return formatearKgGrafico(value);
    } else if (barConfig.tipo === 'euros') {
      return formatearEurosGrafico(value);
    }
    return value;
  };

  const formatearYAxis = (value: number) => {
    // Formato abreviado para el eje Y
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}k`;
    }
    return value.toFixed(0);
  };

  const handleZoomIn = () => {
    const range = endIndex - startIndex;
    const newRange = Math.max(Math.floor(range / 2), 4); // Mínimo 5 elementos
    const center = Math.floor((startIndex + endIndex) / 2);
    setStartIndex(Math.max(0, center - Math.floor(newRange / 2)));
    setEndIndex(Math.min(datos.length - 1, center + Math.floor(newRange / 2)));
  };

  const handleZoomOut = () => {
    const range = endIndex - startIndex;
    const newRange = Math.min(range * 2, datos.length - 1);
    const center = Math.floor((startIndex + endIndex) / 2);
    setStartIndex(Math.max(0, center - Math.floor(newRange / 2)));
    setEndIndex(Math.min(datos.length - 1, center + Math.floor(newRange / 2)));
  };

  const handleReset = () => {
    setStartIndex(0);
    setEndIndex(datos.length - 1);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        {titulo && (
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{titulo}</h3>
        )}
        {zoom && datos.length > 10 && (
          <div className="flex items-center space-x-2">
            <button
              onClick={handleZoomIn}
              disabled={endIndex - startIndex <= 4}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Acercar zoom"
            >
              <ZoomIn className="w-5 h-5" />
            </button>
            <button
              onClick={handleZoomOut}
              disabled={startIndex === 0 && endIndex === datos.length - 1}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Alejar zoom"
            >
              <ZoomOut className="w-5 h-5" />
            </button>
            <button
              onClick={handleReset}
              disabled={startIndex === 0 && endIndex === datos.length - 1}
              className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Restablecer zoom"
            >
              Restablecer
            </button>
          </div>
        )}
      </div>
      <ResponsiveContainer width="100%" height={altura}>
        <BarChart data={datos}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey={claveX}
            tick={{ fill: '#6b7280' }}
            angle={-45}
            textAnchor="end"
            height={100}
          />
          <YAxis
            tickFormatter={formatearYAxis}
            tick={{ fill: '#6b7280' }}
          />
          <Tooltip
            formatter={formatearTooltip}
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '0.5rem'
            }}
          />
          <Legend />
          {clavesY.map((item) => (
            <Bar
              key={item.clave}
              dataKey={item.clave}
              fill={item.color}
              name={item.nombre}
            />
          ))}
          {zoom && datos.length > 10 && (
            <Brush
              dataKey={claveX}
              height={30}
              stroke="#10b981"
              fill="rgba(16, 185, 129, 0.1)"
              startIndex={startIndex}
              endIndex={endIndex}
              onChange={(e) => {
                if (e.startIndex !== undefined) setStartIndex(e.startIndex);
                if (e.endIndex !== undefined) setEndIndex(e.endIndex);
              }}
            />
          )}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
