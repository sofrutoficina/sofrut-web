'use client';

import { useState, useRef } from 'react';
import { subirArchivo, obtenerArchivos } from '@/lib/api/procesador';
import type { ArchivoExcel } from '@/lib/api/procesador';

interface FileUploadProps {
  onArchivoSeleccionado: (archivo: string) => void;
}

export default function FileUpload({ onArchivoSeleccionado }: FileUploadProps) {
  const [archivos, setArchivos] = useState<ArchivoExcel[]>([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [subiendo, setSubiendo] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Cargar archivos existentes
  const cargarArchivos = async () => {
    setCargando(true);
    setError(null);

    try {
      const archivosObtenidos = await obtenerArchivos();
      setArchivos(archivosObtenidos);
    } catch (err) {
      setError('Error cargando archivos');
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  // Subir nuevo archivo
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Verificar extensión
    if (!file.name.endsWith('.xls') && !file.name.endsWith('.xlsx')) {
      setError('Solo se permiten archivos .xls o .xlsx');
      return;
    }

    setSubiendo(true);
    setError(null);

    try {
      const resultado = await subirArchivo(file);

      // Recargar lista de archivos
      await cargarArchivos();

      // Seleccionar automáticamente el archivo subido
      onArchivoSeleccionado(resultado.archivo);
    } catch (err: any) {
      setError(err.message || 'Error subiendo archivo');
      console.error(err);
    } finally {
      setSubiendo(false);
      // Reset input
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload nuevo archivo */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
        <input
          ref={inputRef}
          type="file"
          accept=".xls,.xlsx"
          onChange={handleFileUpload}
          disabled={subiendo}
          className="hidden"
          id="file-upload"
        />

        <label
          htmlFor="file-upload"
          className={`cursor-pointer ${subiendo ? 'opacity-50' : ''}`}
        >
          <div className="space-y-2">
            <div className="text-4xl">📄</div>
            <div className="text-lg font-semibold text-gray-700">
              {subiendo ? 'Subiendo...' : 'Subir archivo Excel'}
            </div>
            <div className="text-sm text-gray-500">
              Arrastra o haz clic para seleccionar (.xls, .xlsx)
            </div>
          </div>
        </label>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Lista de archivos existentes */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold text-gray-900">
            Archivos disponibles
          </h3>
          <button
            onClick={cargarArchivos}
            disabled={cargando}
            className="text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50"
          >
            {cargando ? 'Cargando...' : '🔄 Recargar'}
          </button>
        </div>

        <div className="space-y-2">
          {archivos.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No hay archivos disponibles. Sube uno arriba.
            </div>
          ) : (
            archivos.map((archivo, index) => (
              <button
                key={index}
                onClick={() => onArchivoSeleccionado(archivo.nombre)}
                className="w-full text-left p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">
                      {archivo.nombre}
                    </div>
                    <div className="text-sm text-gray-500">
                      {archivo.tipo === 'entradas' && '📥 Entradas'}
                      {archivo.tipo === 'salidas' && '📤 Salidas'}
                      {archivo.tipo === 'desconocido' && '❓ Tipo desconocido'}
                      {' • '}
                      {(archivo.tamano / 1024).toFixed(1)} KB
                      {' • '}
                      {new Date(archivo.fecha_modificacion).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-blue-600">→</div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
