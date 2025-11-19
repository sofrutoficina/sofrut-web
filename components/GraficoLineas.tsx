/**
 * Componente GraficoLineas
 * Gráfico de líneas para evolución temporal
 */

'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatearKgGrafico, formatearEurosGrafico } from '@/lib/datos';

interface GraficoLineasProps {
  datos: any[];
  claveX: string;
  clavesY: { clave: string; nombre: string; color: string; tipo?: 'kg' | 'euros' }[];
  titulo?: string;
  altura?: number;
}

export default function GraficoLineas({
  datos,
  claveX,
  clavesY,
  titulo,
  altura = 300
}: GraficoLineasProps) {
  const formatearTooltip = (value: any, name: string) => {
    const lineConfig = clavesY.find(y => y.nombre === name);
    if (!lineConfig) return value;

    if (lineConfig.tipo === 'kg') {
      return formatearKgGrafico(value);
    } else if (lineConfig.tipo === 'euros') {
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

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      {titulo && (
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">{titulo}</h3>
      )}
      <ResponsiveContainer width="100%" height={altura}>
        <LineChart data={datos}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey={claveX}
            tick={{ fill: '#6b7280' }}
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
            <Line
              key={item.clave}
              type="monotone"
              dataKey={item.clave}
              stroke={item.color}
              name={item.nombre}
              strokeWidth={2}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
