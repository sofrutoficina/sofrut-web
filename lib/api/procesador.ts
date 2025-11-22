/**
 * API Client para Sofrut Data Backend (FastAPI)
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// ==================== TIPOS ====================

export interface ArchivoExcel {
  nombre: string;
  ruta: string;
  tamano: number;
  fecha_modificacion: string;
  tipo: 'entradas' | 'salidas' | 'desconocido';
}

export interface OpcionIncongruencia {
  valor: string;
  frecuencia?: number;
  porcentaje?: number;
  descripcion?: string;
  es_favorito: boolean;
}

export interface Incongruencia {
  tipo: string;
  campo?: string;
  cantidad?: number;
  variaciones?: string[];
  ejemplos?: any[];
  impacto?: {
    registros_afectados: number;
    total_registros: number;
    porcentaje: number;
  };
  opciones?: OpcionIncongruencia[];  // Opciones con frecuencias reales del backend
  rango_actual?: {
    min: number;
    max: number;
  };
}

export interface Decision {
  accion: 'normalizar' | 'eliminar' | 'mantener' | 'marcar_revision' | 'rellenar';
  valor?: string;
  crear_regla: boolean;
  tipo?: string;
  campo?: string;
  patron?: string;
}

export interface DecisionCompleta {
  numero: number;
  incongruencia: Incongruencia;
  decision: Decision;
}

export interface ReglaNormalizacion {
  patron: string;
  valor_normalizado: string;
}

export interface ReglaAutomatica {
  tipo: string;
  campo: string;
  accion: string;
  valor?: string;
  creada?: string;
}

// ==================== PROCESAMIENTO ====================

/**
 * Obtiene la lista de archivos Excel disponibles
 */
export async function obtenerArchivos(): Promise<ArchivoExcel[]> {
  const response = await fetch(`${API_BASE_URL}/procesador/archivos`);

  if (!response.ok) {
    throw new Error('Error obteniendo archivos');
  }

  const data = await response.json();
  return data.archivos;
}

/**
 * Sube un archivo Excel
 */
export async function subirArchivo(file: File): Promise<{ exitoso: boolean; mensaje: string; archivo: string }> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/procesador/upload`, {
    method: 'POST',
    body: formData
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Error subiendo archivo');
  }

  return response.json();
}

/**
 * Procesa un archivo Excel
 */
export async function procesarArchivo(archivo: string) {
  const response = await fetch(`${API_BASE_URL}/procesador/procesar/${archivo}`, {
    method: 'POST'
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Error procesando archivo');
  }

  return response.json();
}

/**
 * Analiza incongruencias de un archivo (Niveles 1-5)
 */
export async function analizarIncongruencias(archivo: string): Promise<{
  incongruencias: Incongruencia[];
  total: number;
  niveles_aplicados: number[];
}> {
  const response = await fetch(`${API_BASE_URL}/procesador/analizar-incongruencias/${archivo}`, {
    method: 'POST'
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Error analizando incongruencias');
  }

  return response.json();
}

/**
 * Aplica las decisiones tomadas
 */
export async function aplicarDecisiones(
  archivo: string,
  decisiones: DecisionCompleta[]
): Promise<{
  exitoso: boolean;
  cambios_aplicados: number;
  reglas_creadas: number;
  registros_modificados: number;
  datos_procesados?: any;
}> {
  const response = await fetch(`${API_BASE_URL}/procesador/aplicar-decisiones/${archivo}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      decisiones,
      confirmar: true
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Error aplicando decisiones');
  }

  return response.json();
}

/**
 * Exporta datos a JSON
 */
export async function exportarJSON(
  datos: any,
  nombreArchivo: string
): Promise<{
  exitoso: boolean;
  ruta_archivo: string;
  tamano_bytes?: number;
}> {
  const response = await fetch(`${API_BASE_URL}/procesador/exportar-json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      datos,
      nombre_archivo: nombreArchivo,
      convertir_nan: true
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Error exportando JSON');
  }

  return response.json();
}

// ==================== GESTIÓN DE REGLAS ====================

/**
 * Obtiene todas las reglas
 */
export async function obtenerTodasReglas(): Promise<{
  normalizaciones: Record<string, string>;
  reglas_automaticas: ReglaAutomatica[];
  total_normalizaciones: number;
  total_reglas_automaticas: number;
}> {
  const response = await fetch(`${API_BASE_URL}/reglas/`);

  if (!response.ok) {
    throw new Error('Error obteniendo reglas');
  }

  return response.json();
}

/**
 * Crea una regla de normalización
 */
export async function crearReglaNormalizacion(patron: string, valorNormalizado: string) {
  const response = await fetch(`${API_BASE_URL}/reglas/crear`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      tipo: 'normalizacion',
      normalizacion: {
        patron,
        valor_normalizado: valorNormalizado
      }
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Error creando regla');
  }

  return response.json();
}

/**
 * Crea una regla automática
 */
export async function crearReglaAutomatica(regla: ReglaAutomatica) {
  const response = await fetch(`${API_BASE_URL}/reglas/crear`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      tipo: 'automatica',
      regla_automatica: regla
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Error creando regla automática');
  }

  return response.json();
}

/**
 * Elimina una regla de normalización
 */
export async function eliminarReglaNormalizacion(patron: string) {
  const response = await fetch(`${API_BASE_URL}/reglas/eliminar`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      tipo: 'normalizacion',
      patron
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Error eliminando regla');
  }

  return response.json();
}

/**
 * Elimina una regla automática
 */
export async function eliminarReglaAutomatica(indice: number) {
  const response = await fetch(`${API_BASE_URL}/reglas/eliminar`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      tipo: 'automatica',
      indice
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Error eliminando regla automática');
  }

  return response.json();
}

/**
 * Limpia todas las reglas (hace backup automático)
 */
export async function limpiarTodasReglas() {
  const response = await fetch(`${API_BASE_URL}/reglas/limpiar-todo`, {
    method: 'DELETE'
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Error limpiando reglas');
  }

  return response.json();
}

/**
 * Restaura reglas desde backup
 */
export async function restaurarBackup() {
  const response = await fetch(`${API_BASE_URL}/reglas/restaurar-backup`, {
    method: 'POST'
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Error restaurando backup');
  }

  return response.json();
}
