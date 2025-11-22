'use client';

import { useState } from 'react';
import FileUpload from '@/components/procesador/FileUpload';
import IncongruenciaCard from '@/components/procesador/IncongruenciaCard';
import RevisionFinal from '@/components/procesador/RevisionFinal';
import {
  analizarIncongruencias,
  aplicarDecisiones,
  exportarJSON
} from '@/lib/api/procesador';
import type { Incongruencia, DecisionCompleta, Decision } from '@/lib/api/procesador';

type Fase = 'seleccion' | 'analisis' | 'decisiones' | 'revision' | 'completado';

export default function ProcesadorPage() {
  const [fase, setFase] = useState<Fase>('seleccion');
  const [archivoSeleccionado, setArchivoSeleccionado] = useState<string | null>(null);
  const [incongruencias, setIncongruencias] = useState<Incongruencia[]>([]);
  const [indiceActual, setIndiceActual] = useState(0);
  const [decisiones, setDecisiones] = useState<DecisionCompleta[]>([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultado, setResultado] = useState<any>(null);

  // Paso 1: Seleccionar archivo y analizar
  const handleArchivoSeleccionado = async (archivo: string) => {
    setArchivoSeleccionado(archivo);
    setFase('analisis');
    setCargando(true);
    setError(null);

    try {
      const data = await analizarIncongruencias(archivo);
      setIncongruencias(data.incongruencias);

      if (data.incongruencias.length > 0) {
        setFase('decisiones');
        setIndiceActual(0);
      } else {
        setError('No se encontraron incongruencias. El archivo está perfecto!');
        setFase('seleccion');
      }
    } catch (err: any) {
      setError(err.message || 'Error analizando archivo');
      setFase('seleccion');
    } finally {
      setCargando(false);
    }
  };

  // Paso 2: Tomar decisión individual
  const handleDecision = (decision: Decision) => {
    const incongruenciaActual = incongruencias[indiceActual];

    const decisionCompleta: DecisionCompleta = {
      numero: decisiones.length + 1,
      incongruencia: incongruenciaActual,
      decision
    };

    const nuevasDecisiones = [...decisiones, decisionCompleta];
    setDecisiones(nuevasDecisiones);

    // Si hay más incongruencias, avanzar
    if (indiceActual < incongruencias.length - 1) {
      setIndiceActual(indiceActual + 1);
    } else {
      // Terminado, ir a revisión final
      setFase('revision');
    }
  };

  // Saltar incongruencia
  const handleSaltar = () => {
    if (indiceActual < incongruencias.length - 1) {
      setIndiceActual(indiceActual + 1);
    } else {
      // Terminado, ir a revisión final
      setFase('revision');
    }
  };

  // Modificar decisión desde revisión
  const handleModificar = (numero: number) => {
    // Volver a la incongruencia específica
    const indice = numero - 1;
    setIndiceActual(indice);

    // Remover la decisión
    setDecisiones(decisiones.filter(d => d.numero !== numero));

    setFase('decisiones');
  };

  // Aplicar todas las decisiones
  const handleAplicar = async () => {
    if (!archivoSeleccionado) return;

    setCargando(true);
    setError(null);

    try {
      const res = await aplicarDecisiones(archivoSeleccionado, decisiones);
      setResultado(res);
      setFase('completado');
    } catch (err: any) {
      setError(err.message || 'Error aplicando decisiones');
    } finally {
      setCargando(false);
    }
  };

  // Cancelar todo
  const handleCancelar = () => {
    if (confirm('¿Seguro que quieres cancelar? Se perderán todas las decisiones.')) {
      resetear();
    }
  };

  // Exportar decisiones
  const handleExportar = async () => {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const nombre = `decisiones_${timestamp}.json`;

      await exportarJSON({ decisiones }, nombre);
      alert('Decisiones exportadas correctamente!');
    } catch (err: any) {
      setError(err.message || 'Error exportando decisiones');
    }
  };

  // Resetear todo
  const resetear = () => {
    setFase('seleccion');
    setArchivoSeleccionado(null);
    setIncongruencias([]);
    setIndiceActual(0);
    setDecisiones([]);
    setError(null);
    setResultado(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🍎 Procesador de Datos de Fruta v1.6
          </h1>
          <p className="text-gray-600">
            UX Mejorada + Sistema de Gestión + Análisis 100% Exhaustivo
          </p>
        </div>

        {/* Error global */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Indicador de progreso */}
        {fase !== 'seleccion' && archivoSeleccionado && (
          <div className="mb-6 bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-600">
                Archivo: <strong>{archivoSeleccionado}</strong>
              </div>
              <button
                onClick={resetear}
                className="text-sm text-gray-600 hover:text-gray-800"
              >
                🔄 Reiniciar
              </button>
            </div>

            {/* Barra de progreso */}
            <div className="flex items-center gap-2">
              <div className={`flex-1 h-2 rounded ${
                fase === 'analisis' ? 'bg-blue-200' : 'bg-blue-500'
              }`} />
              <div className={`flex-1 h-2 rounded ${
                fase === 'decisiones' || fase === 'revision' || fase === 'completado'
                  ? 'bg-blue-500'
                  : 'bg-gray-200'
              }`} />
              <div className={`flex-1 h-2 rounded ${
                fase === 'revision' || fase === 'completado' ? 'bg-blue-500' : 'bg-gray-200'
              }`} />
              <div className={`flex-1 h-2 rounded ${
                fase === 'completado' ? 'bg-green-500' : 'bg-gray-200'
              }`} />
            </div>

            <div className="flex justify-between mt-2 text-xs text-gray-600">
              <span>Análisis</span>
              <span>Decisiones</span>
              <span>Revisión</span>
              <span>Completado</span>
            </div>
          </div>
        )}

        {/* Contenido según fase */}
        {fase === 'seleccion' && (
          <FileUpload onArchivoSeleccionado={handleArchivoSeleccionado} />
        )}

        {fase === 'analisis' && cargando && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4 animate-pulse">🔍</div>
            <div className="text-xl font-semibold text-gray-900">
              Analizando archivo...
            </div>
            <div className="text-gray-600">
              Detectando variaciones y valores problemáticos
            </div>
          </div>
        )}

        {fase === 'decisiones' && incongruencias.length > 0 && (
          <IncongruenciaCard
            incongruencia={incongruencias[indiceActual]}
            numero={indiceActual + 1}
            total={incongruencias.length}
            onDecision={handleDecision}
            onSaltar={handleSaltar}
          />
        )}

        {fase === 'revision' && (
          <RevisionFinal
            decisiones={decisiones}
            onAplicar={handleAplicar}
            onModificar={handleModificar}
            onCancelar={handleCancelar}
            onExportar={handleExportar}
          />
        )}

        {fase === 'completado' && resultado && (
          <div className="bg-white border-2 border-green-500 rounded-xl p-8 text-center">
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              ¡Procesamiento Completado!
            </h2>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-3xl font-bold text-blue-600">
                  {resultado.cambios_aplicados}
                </div>
                <div className="text-sm text-gray-600">Cambios aplicados</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-3xl font-bold text-purple-600">
                  {resultado.reglas_creadas}
                </div>
                <div className="text-sm text-gray-600">Reglas creadas</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-3xl font-bold text-green-600">
                  {resultado.registros_modificados}
                </div>
                <div className="text-sm text-gray-600">Registros procesados</div>
              </div>
            </div>

            <button
              onClick={resetear}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Procesar otro archivo
            </button>
          </div>
        )}

        {/* Loading overlay */}
        {cargando && fase !== 'analisis' && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 text-center">
              <div className="text-4xl mb-4 animate-spin">⚙️</div>
              <div className="text-xl font-semibold text-gray-900">
                Procesando...
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
