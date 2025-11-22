'use client';

import { useState, useEffect } from 'react';
import type { Incongruencia, Decision } from '@/lib/api/procesador';

interface Opcion {
  valor: string;
  frecuencia?: number;
  porcentaje?: number;
  descripcion?: string;
}

interface IncongruenciaCardProps {
  incongruencia: Incongruencia;
  numero: number;
  total: number;
  onDecision: (decision: Decision) => void;
  onSaltar: () => void;
}

export default function IncongruenciaCardV2({
  incongruencia,
  numero,
  total,
  onDecision,
  onSaltar
}: IncongruenciaCardProps) {
  const [opciones, setOpciones] = useState<Opcion[]>([]);
  const [favoritoIndex, setFavoritoIndex] = useState(0);
  const [opcionSeleccionada, setOpcionSeleccionada] = useState<string | null>(null);
  const [valorPersonalizado, setValorPersonalizado] = useState('');
  const [rangoMin, setRangoMin] = useState('');
  const [rangoMax, setRangoMax] = useState('');
  const [crearRegla, setCrearRegla] = useState(false);
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);

  // Determinar si este tipo permite modificar rangos
  const tieneRango = ['outliers_estadisticos', 'rangos_illogicos', 'patron_cliente_anomalo'].includes(incongruencia.tipo);

  // Usar opciones del backend o generar si no vienen
  useEffect(() => {
    // Primero intentar usar opciones del backend
    if (incongruencia.opciones && incongruencia.opciones.length > 0) {
      const opcionesDelBackend = incongruencia.opciones.map(op => ({
        valor: op.valor,
        frecuencia: op.frecuencia,
        porcentaje: op.porcentaje,
        descripcion: op.descripcion
      }));
      setOpciones(opcionesDelBackend);

      // Encontrar el índice del favorito
      const favIndex = incongruencia.opciones.findIndex(op => op.es_favorito);
      setFavoritoIndex(favIndex >= 0 ? favIndex : 0);
    } else {
      // Fallback: generar opciones localmente si el backend no las envió
      const opcionesGeneradas = generarOpciones(incongruencia);
      setOpciones(opcionesGeneradas);

      if (opcionesGeneradas.length > 0) {
        setFavoritoIndex(0);
      }
    }
  }, [incongruencia]);

  const generarOpciones = (inc: Incongruencia): Opcion[] => {
    const tipo = inc.tipo;
    const impacto = inc.impacto;

    // Para variaciones de nombre
    if (tipo === 'variaciones_nombre' && inc.variaciones) {
      return inc.variaciones.map((v, i) => {
        const frecuencia = Math.floor(Math.random() * 20) + 1; // TODO: Obtener del backend
        const porcentaje = impacto ? (frecuencia / impacto.registros_afectados * 100) : 0;
        return {
          valor: v,
          frecuencia,
          porcentaje: Number(porcentaje.toFixed(1))
        };
      }).sort((a, b) => (b.frecuencia || 0) - (a.frecuencia || 0));
    }

    // Para valores cero/negativos
    if (tipo === 'valores_cero' || tipo === 'valores_negativos') {
      return [
        { valor: 'eliminar', descripcion: 'Eliminar registros' },
        { valor: 'mantener', descripcion: 'Mantener (puede ser válido)' },
        { valor: 'marcar_revision', descripcion: "Marcar como 'REVISAR'" }
      ];
    }

    // Para valores vacíos
    if (tipo === 'valores_vacios') {
      return [
        { valor: 'mantener', descripcion: 'Mantener vacíos' },
        { valor: 'rellenar', descripcion: 'Rellenar con valor' },
        { valor: 'marcar_revision', descripcion: "Marcar como 'REVISAR'" }
      ];
    }

    // Para fechas futuras/antiguas
    if (tipo === 'fechas_futuras' || tipo === 'fechas_antiguas') {
      return [
        { valor: 'corregir', descripcion: 'Corregir fecha manualmente' },
        { valor: 'eliminar', descripcion: 'Eliminar registro' },
        { valor: 'marcar_revision', descripcion: "Marcar como 'REVISAR'" }
      ];
    }

    // Para espacios múltiples
    if (tipo === 'espacios_multiples') {
      return [
        { valor: 'limpiar', descripcion: 'Limpiar automáticamente' },
        { valor: 'revisar', descripcion: 'Revisar manualmente' }
      ];
    }

    // Para duplicados exactos
    if (tipo === 'duplicados_exactos') {
      return [
        { valor: 'eliminar_duplicados', descripcion: 'Eliminar duplicados (mantener 1)' },
        { valor: 'mantener_todos', descripcion: 'Mantener todos' },
        { valor: 'revisar', descripcion: 'Revisar uno por uno' }
      ];
    }

    // Para rangos ilógicos
    if (tipo === 'rangos_illogicos') {
      return [
        { valor: 'eliminar', descripcion: 'Eliminar registro' },
        { valor: 'corregir', descripcion: 'Corregir manualmente' },
        { valor: 'marcar_revision', descripcion: "Marcar como 'REVISAR'" }
      ];
    }

    // Para incoherencia cliente
    if (tipo === 'incoherencia_cliente' && inc.variaciones) {
      return inc.variaciones.map(v => ({
        valor: v,
        descripcion: `Normalizar a "${v}"`
      }));
    }

    // Para outliers estadísticos
    if (tipo === 'outliers_estadisticos') {
      return [
        { valor: 'mantener', descripcion: 'Mantener valor (puede ser válido)' },
        { valor: 'eliminar', descripcion: 'Eliminar registro' },
        { valor: 'corregir', descripcion: 'Corregir valor manualmente' }
      ];
    }

    // Para patrón cliente anómalo
    if (tipo === 'patron_cliente_anomalo') {
      return [
        { valor: 'mantener', descripcion: 'Mantener (puede ser válido)' },
        { valor: 'revisar', descripcion: 'Revisar manualmente' },
        { valor: 'corregir', descripcion: 'Corregir precio' }
      ];
    }

    // Default: opciones genéricas
    return [
      { valor: 'mantener', descripcion: 'Mantener como está' },
      { valor: 'revisar', descripcion: 'Revisar manualmente' }
    ];
  };

  const handleConfirmar = () => {
    const valorFinal = opcionSeleccionada === 'personalizado'
      ? valorPersonalizado
      : opcionSeleccionada;

    if (!valorFinal) return;

    const decision: Decision = {
      accion: mapearAccion(valorFinal, incongruencia.tipo),
      valor: valorFinal,
      crear_regla: crearRegla,
      campo: incongruencia.campo,
      tipo: incongruencia.tipo
    };

    // Agregar rango si aplica
    if (tieneRango && (rangoMin || rangoMax)) {
      (decision as any).rango = {
        min: rangoMin ? parseFloat(rangoMin) : undefined,
        max: rangoMax ? parseFloat(rangoMax) : undefined
      };
    }

    setMostrarConfirmacion(true);
    setTimeout(() => {
      onDecision(decision);
      setMostrarConfirmacion(false);
    }, 500);
  };

  const mapearAccion = (valor: string, tipo: string): Decision['accion'] => {
    if (valor.includes('eliminar')) return 'eliminar';
    if (valor.includes('mantener')) return 'mantener';
    if (valor.includes('marcar') || valor.includes('revisar')) return 'marcar_revision';
    if (valor.includes('rellenar') || valor.includes('corregir')) return 'rellenar';
    if (tipo === 'variaciones_nombre' || tipo === 'incoherencia_cliente') return 'normalizar';
    return 'mantener';
  };

  return (
    <div className="bg-white border-2 border-gray-200 rounded-xl p-6 shadow-sm">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-bold text-gray-900">
            Incongruencia {numero}/{total}
          </h3>
          <span className="px-3 py-1 bg-orange-100 text-orange-800 text-sm font-medium rounded-full">
            {incongruencia.tipo.replace(/_/g, ' ').toUpperCase()}
          </span>
        </div>
        {incongruencia.campo && (
          <div className="text-sm text-gray-600">
            Campo: <strong>{incongruencia.campo}</strong>
          </div>
        )}
      </div>

      {/* Impacto */}
      {incongruencia.impacto && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <div className="text-sm font-medium text-blue-900">
            📊 IMPACTO: {incongruencia.impacto.registros_afectados}/{incongruencia.impacto.total_registros} registros ({incongruencia.impacto.porcentaje}%)
          </div>
          {incongruencia.ejemplos && incongruencia.ejemplos.length > 0 && (
            <div className="text-sm text-blue-700 mt-1">
              📋 Ejemplos: {incongruencia.ejemplos.slice(0, 3).join(', ')}
            </div>
          )}
        </div>
      )}

      {/* Opciones */}
      <div className="space-y-4 mb-4">
        <h4 className="text-sm font-semibold text-gray-700">
          Opciones disponibles:
        </h4>

        <div className="space-y-2">
          {opciones.map((opcion, index) => (
            <button
              key={index}
              onClick={() => setOpcionSeleccionada(opcion.valor)}
              className={`w-full text-left p-3 border-2 rounded-lg transition-all ${
                opcionSeleccionada === opcion.valor
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">
                      {opcion.descripcion || opcion.valor}
                    </span>
                    {index === favoritoIndex && (
                      <span className="text-yellow-500 text-xl">⭐</span>
                    )}
                  </div>
                  {opcion.frecuencia && (
                    <div className="text-sm text-gray-600 mt-1">
                      {opcion.frecuencia} veces ({opcion.porcentaje}%)
                    </div>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Cambiar favorito */}
        {opciones.length > 1 && (
          <div className="border-t pt-3">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ⭐ Cambiar favorito (recomendación):
            </label>
            <select
              value={favoritoIndex}
              onChange={(e) => setFavoritoIndex(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {opciones.map((op, i) => (
                <option key={i} value={i}>
                  {i + 1}. {op.descripcion || op.valor}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Valor personalizado */}
        <div className="border-t pt-3">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ✏️ O escribir valor personalizado:
          </label>
          <input
            type="text"
            value={valorPersonalizado}
            onChange={(e) => {
              setValorPersonalizado(e.target.value);
              setOpcionSeleccionada('personalizado');
            }}
            placeholder="Escribe el valor correcto..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Modificar rango (solo para tipos numéricos) */}
        {tieneRango && (
          <div className="border-t pt-3">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              📏 Modificar rango aceptable (opcional):
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-600">Mínimo:</label>
                <input
                  type="number"
                  value={rangoMin}
                  onChange={(e) => setRangoMin(e.target.value)}
                  placeholder="Ej: 0.5"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-xs text-gray-600">Máximo:</label>
                <input
                  type="number"
                  value={rangoMax}
                  onChange={(e) => setRangoMax(e.target.value)}
                  placeholder="Ej: 100"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Crear regla automática */}
      <div className="mb-4 pt-4 border-t">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={crearRegla}
            onChange={(e) => setCrearRegla(e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">
            🤖 Crear regla automática (aplicar siempre esta decisión en el futuro)
          </span>
        </label>
      </div>

      {/* Acciones */}
      <div className="flex gap-3">
        <button
          onClick={handleConfirmar}
          disabled={!opcionSeleccionada && !valorPersonalizado}
          className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {mostrarConfirmacion ? '✓ Confirmado' : 'Confirmar decisión'}
        </button>
        <button
          onClick={onSaltar}
          className="px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:border-gray-400 hover:bg-gray-50 transition-colors"
        >
          Saltar →
        </button>
      </div>
    </div>
  );
}
