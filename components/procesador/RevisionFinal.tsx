'use client';

import { useState } from 'react';
import type { DecisionCompleta } from '@/lib/api/procesador';

interface RevisionFinalProps {
  decisiones: DecisionCompleta[];
  onAplicar: () => void;
  onModificar: (numero: number) => void;
  onCancelar: () => void;
  onExportar: () => void;
}

export default function RevisionFinal({
  decisiones,
  onAplicar,
  onModificar,
  onCancelar,
  onExportar
}: RevisionFinalProps) {
  const [decisionSeleccionada, setDecisionSeleccionada] = useState<number | null>(null);

  return (
    <div className="bg-white border-2 border-gray-200 rounded-xl p-6 shadow-lg">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          📋 Revisión Final de Decisiones
        </h2>
        <p className="text-gray-600">
          Revisa todas las decisiones antes de aplicarlas. Puedes modificar cualquiera.
        </p>
      </div>

      {/* Resumen de decisiones */}
      <div className="space-y-3 mb-6 max-h-96 overflow-y-auto">
        {decisiones.map((dec) => (
          <div
            key={dec.numero}
            className={`border-2 rounded-lg p-4 transition-all cursor-pointer ${
              decisionSeleccionada === dec.numero
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => setDecisionSeleccionada(dec.numero)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-bold text-gray-900">#{dec.numero}</span>
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded">
                    {dec.incongruencia.tipo.replace('_', ' ')}
                  </span>
                </div>

                {dec.incongruencia.campo && (
                  <div className="text-sm text-gray-600 mb-2">
                    Campo: <strong>{dec.incongruencia.campo}</strong>
                  </div>
                )}

                {/* Descripción de la decisión */}
                <div className="text-sm">
                  {dec.decision.accion === 'normalizar' && (
                    <div className="text-blue-700">
                      → Normalizar a: <strong>"{dec.decision.valor}"</strong>
                    </div>
                  )}
                  {dec.decision.accion === 'eliminar' && (
                    <div className="text-red-700">
                      → Eliminar {dec.incongruencia.cantidad || '?'} registros
                    </div>
                  )}
                  {dec.decision.accion === 'mantener' && (
                    <div className="text-green-700">
                      → Mantener como está
                    </div>
                  )}
                  {dec.decision.accion === 'marcar_revision' && (
                    <div className="text-orange-700">
                      → Marcar como 'REVISAR MANUALMENTE'
                    </div>
                  )}
                </div>

                {dec.decision.crear_regla && (
                  <div className="mt-2 text-sm text-purple-700">
                    🤖 Regla automática: SÍ
                  </div>
                )}
              </div>

              {decisionSeleccionada === dec.numero && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onModificar(dec.numero);
                  }}
                  className="ml-4 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Modificar
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Estadísticas */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-gray-900">
              {decisiones.length}
            </div>
            <div className="text-sm text-gray-600">Decisiones</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600">
              {decisiones.filter(d => d.decision.crear_regla).length}
            </div>
            <div className="text-sm text-gray-600">Reglas automáticas</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-600">
              {decisiones.filter(d => d.decision.accion === 'normalizar').length}
            </div>
            <div className="text-sm text-gray-600">Normalizaciones</div>
          </div>
        </div>
      </div>

      {/* Advertencia */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <span className="text-yellow-600 text-xl">⚠️</span>
          <div className="flex-1 text-sm text-yellow-800">
            <strong>Importante:</strong> Una vez aplicadas, estas decisiones modificarán los datos de forma permanente. Asegúrate de que todo es correcto.
          </div>
        </div>
      </div>

      {/* Acciones principales */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <button
          onClick={onAplicar}
          className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
        >
          ✓ Aplicar todas las decisiones
        </button>
        <button
          onClick={onCancelar}
          className="px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
        >
          ✗ Cancelar todo
        </button>
      </div>

      {/* Acción secundaria */}
      <button
        onClick={onExportar}
        className="w-full px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:border-gray-400 hover:bg-gray-50 transition-colors"
      >
        💾 Exportar decisiones a archivo
      </button>
    </div>
  );
}
