/**
 * Componente GraficoDona
 * Gráfico de dona para distribución porcentual
 */

'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { formatearKgGrafico, formatearEurosGrafico } from '@/lib/datos';

interface GraficoDonaProps {
  datos: { nombre: string; valor: number }[];
  titulo?: string;
  altura?: number;
  colores?: string[];
  tipo?: 'kg' | 'euros';
}

const COLORES_DEFAULT = [
  '#10b981', // verde
  '#3b82f6', // azul
  '#f59e0b', // naranja
  '#ef4444', // rojo
  '#8b5cf6', // morado
  '#06b6d4', // cyan
  '#ec4899', // rosa
  '#84cc16', // lima
];

export default function GraficoDona({
  datos,
  titulo,
  altura = 300,
  colores = COLORES_DEFAULT,
  tipo = 'kg'
}: GraficoDonaProps) {
  const formatearTooltip = (value: number) => {
    if (tipo === 'kg') {
      return formatearKgGrafico(value);
    } else if (tipo === 'euros') {
      return formatearEurosGrafico(value);
    }
    return value;
  };

  const renderLabel = (entry: any) => {
    const total = datos.reduce((sum, d) => sum + d.valor, 0);
    const porcentaje = ((entry.valor / total) * 100).toFixed(1);
    return `${entry.nombre}: ${porcentaje}%`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      {titulo && (
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">{titulo}</h3>
      )}
      <ResponsiveContainer width="100%" height={altura}>
        <PieChart>
          <Pie
            data={datos}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            fill="#8884d8"
            dataKey="valor"
            label={renderLabel}
            labelLine={false}
          >
            {datos.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colores[index % colores.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={formatearTooltip}
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '0.5rem'
            }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
