'use client';

import { useState } from 'react';
import type { Incongruencia, Decision } from '@/lib/api/procesador';

interface IncongruenciaCardProps {
  incongruencia: Incongruencia;
  numero: number;
  total: number;
  onDecision: (decision: Decision) => void;
  onSaltar: () => void;
}

export default function IncongruenciaCard({
  incongruencia,
  numero,
  total,
  onDecision,
  onSaltar
}: IncongruenciaCardProps) {
  const [accionSeleccionada, setAccionSeleccionada] = useState<string | null>(null);
  const [valorPersonalizado, setValorPersonalizado] = useState('');
  const [crearRegla, setCrearRegla] = useState(false);
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);

  // Manejar decisión
  const handleConfirmar = () => {
    if (!accionSeleccionada) return;

    let decision: Decision;

    if (incongruencia.tipo === 'variaciones_nombre') {
      // Normalización
      const valor = accionSeleccionada === 'personalizado'
        ? valorPersonalizado
        : accionSeleccionada;

      decision = {
        accion: 'normalizar',
        valor,
        crear_regla: crearRegla,
        campo: incongruencia.campo,
        patron: incongruencia.variaciones?.[0].toLowerCase()
      };
    } else if (incongruencia.tipo === 'valores_cero' || incongruencia.tipo === 'valores_negativos') {
      decision = {
        accion: accionSeleccionada as any,
        crear_regla: crearRegla,
        tipo: incongruencia.tipo,
        campo: incongruencia.campo
      };
    } else {
      decision = {
        accion: accionSeleccionada as any,
        crear_regla: crearRegla,
        campo: incongruencia.campo
      };
    }

    setMostrarConfirmacion(true);
    setTimeout(() => {
      onDecision(decision);
      setMostrarConfirmacion(false);
    }, 500);
  };

  // Renderizar opciones según tipo
  const renderOpciones = () => {
    if (incongruencia.tipo === 'variaciones_nombre') {
      const variaciones = incongruencia.variaciones || [];
      const impacto = incongruencia.impacto;

      // Contar frecuencias (simulado - en real vendría del backend)
      const variacionesConFrecuencia = variaciones.map((v, i) => ({
        valor: v,
        frecuencia: Math.floor(Math.random() * 20) + 1 // Simulado
      }));

      variacionesConFrecuencia.sort((a, b) => b.frecuencia - a.frecuencia);

      return (
        <div className="space-y-4">
          {/* Impacto */}
          {impacto && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="text-sm font-medium text-blue-900">
                📊 IMPACTO: {impacto.registros_afectados}/{impacto.total_registros} registros ({impacto.porcentaje}%)
              </div>
              <div className="text-sm text-blue-700">
                📝 Campo: {incongruencia.campo}
              </div>
            </div>
          )}

          {/* Variaciones */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2">
              Variaciones detectadas:
            </h4>
            <div className="space-y-2">
              {variacionesConFrecuencia.map((v, i) => {
                const porcentaje = impacto
                  ? ((v.frecuencia / impacto.registros_afectados) * 100).toFixed(1)
                  : 0;

                return (
                  <button
                    key={i}
                    onClick={() => setAccionSeleccionada(v.valor)}
                    className={`w-full text-left p-3 border-2 rounded-lg transition-all ${
                      accionSeleccionada === v.valor
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-mono font-medium text-gray-900">
                          "{v.valor}"
                        </div>
                        <div className="text-sm text-gray-600">
                          {v.frecuencia} veces ({porcentaje}%)
                        </div>
                      </div>
                      {i === 0 && (
                        <span className="text-yellow-500 text-xl ml-2">⭐</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Preview */}
          {variacionesConFrecuencia.length > 0 && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <div className="text-sm text-gray-700">
                💡 <strong>PREVIEW:</strong> Si eliges "{variacionesConFrecuencia[0].valor}", todas las variaciones se normalizarán
              </div>
              <div className="text-sm text-gray-600 mt-1">
                Ejemplo: "{variacionesConFrecuencia[variacionesConFrecuencia.length - 1].valor}" → "{variacionesConFrecuencia[0].valor}"
              </div>
            </div>
          )}

          {/* Valor personalizado */}
          <div className="border-t pt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              O escribir valor personalizado:
            </label>
            <input
              type="text"
              value={valorPersonalizado}
              onChange={(e) => {
                setValorPersonalizado(e.target.value);
                setAccionSeleccionada('personalizado');
              }}
              placeholder="Escribe el valor correcto..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      );
    }

    if (incongruencia.tipo === 'valores_cero' || incongruencia.tipo === 'valores_negativos') {
      const impacto = incongruencia.impacto;

      return (
        <div className="space-y-4">
          {/* Impacto */}
          {impacto && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="text-sm font-medium text-blue-900">
                📊 IMPACTO: {impacto.registros_afectados}/{impacto.total_registros} registros ({impacto.porcentaje}%)
              </div>
              <div className="text-sm text-blue-700">
                📝 Campo: {incongruencia.campo}
              </div>
              {incongruencia.ejemplos && (
                <div className="text-sm text-blue-700 mt-1">
                  📋 Ejemplos: {incongruencia.ejemplos.slice(0, 3).join(', ')}
                </div>
              )}
            </div>
          )}

          {/* Opciones */}
          <div className="space-y-2">
            {[
              { value: 'eliminar', label: 'Eliminar registros', icon: '🗑️' },
              { value: 'mantener', label: 'Mantener registros (puede ser válido)', icon: '⭐' },
              { value: 'marcar_revision', label: "Marcar como 'REVISAR MANUALMENTE'", icon: '⚠️' }
            ].map((opcion) => (
              <button
                key={opcion.value}
                onClick={() => setAccionSeleccionada(opcion.value)}
                className={`w-full text-left p-3 border-2 rounded-lg transition-all ${
                  accionSeleccionada === opcion.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl">{opcion.icon}</span>
                  <span className="text-gray-900">{opcion.label}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      );
    }

    // Otros tipos de incongruencias
    return (
      <div className="text-gray-600">
        Tipo: {incongruencia.tipo}
      </div>
    );
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
            {incongruencia.tipo.replace('_', ' ').toUpperCase()}
          </span>
        </div>
        {incongruencia.campo && (
          <div className="text-sm text-gray-600">
            Campo afectado: <strong>{incongruencia.campo}</strong>
          </div>
        )}
      </div>

      {/* Opciones */}
      {renderOpciones()}

      {/* Crear regla automática */}
      <div className="mt-6 pt-4 border-t">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={crearRegla}
            onChange={(e) => setCrearRegla(e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">
            🤖 Crear regla automática (aplicar siempre esta decisión)
          </span>
        </label>
      </div>

      {/* Acciones */}
      <div className="mt-6 flex gap-3">
        <button
          onClick={handleConfirmar}
          disabled={!accionSeleccionada || (accionSeleccionada === 'personalizado' && !valorPersonalizado)}
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
