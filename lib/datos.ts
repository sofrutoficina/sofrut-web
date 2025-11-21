/**
 * Utilidades para cargar y procesar datos
 * Lee datos desde Firebase Firestore
 */

import { ArchivoEntradas, ArchivoSalidas, RegistroEntrada, RegistroSalida } from './types';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from './firebase';

// Cargar datos de entradas desde Firestore
export async function cargarEntradas(): Promise<ArchivoEntradas> {
  try {
    const q = query(collection(db, 'entradas'), orderBy('Fecha', 'desc'));
    const snapshot = await getDocs(q);

    const datos: RegistroEntrada[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      // Eliminar campos internos de Firebase (que empiezan con _)
      const { _fecha_carga, _archivo_origen, ...registro } = data;
      datos.push(registro as RegistroEntrada);
    });

    // Retornar en el formato esperado (compatible con código existente)
    return {
      tipo: 'entradas',
      archivo_original: 'firestore',
      fecha_procesamiento: new Date().toISOString(),
      filas_totales: datos.length,
      columnas: datos.length > 0 ? Object.keys(datos[0]) : [],
      inconsistencias_detectadas: 0,
      datos
    };
  } catch (error) {
    console.error('Error cargando entradas desde Firestore:', error);
    throw error;
  }
}

// Cargar datos de salidas desde Firestore
export async function cargarSalidas(): Promise<ArchivoSalidas> {
  try {
    const q = query(collection(db, 'salidas'), orderBy('Fecha', 'desc'));
    const snapshot = await getDocs(q);

    const datos: RegistroSalida[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      // Eliminar campos internos de Firebase (que empiezan con _)
      const { _fecha_carga, _archivo_origen, ...registro } = data;
      datos.push(registro as RegistroSalida);
    });

    // Retornar en el formato esperado (compatible con código existente)
    return {
      tipo: 'salidas',
      archivo_original: 'firestore',
      fecha_procesamiento: new Date().toISOString(),
      filas_totales: datos.length,
      columnas: datos.length > 0 ? Object.keys(datos[0]) : [],
      inconsistencias_detectadas: 0,
      datos
    };
  } catch (error) {
    console.error('Error cargando salidas desde Firestore:', error);
    throw error;
  }
}

// Parsear fecha en formato dd/mm/yyyy
export function parsearFecha(fechaStr: string): Date {
  if (!fechaStr) return new Date();
  const partes = fechaStr.split('/');
  if (partes.length === 3) {
    const [dia, mes, año] = partes;
    return new Date(parseInt(año), parseInt(mes) - 1, parseInt(dia));
  }
  return new Date(fechaStr);
}

// Formatear fecha a string legible
export function formatearFecha(fecha: Date): string {
  return fecha.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

// Obtener mes y año de una fecha
export function obtenerMesAño(fechaStr: string): string {
  const fecha = parsearFecha(fechaStr);
  return fecha.toLocaleDateString('es-ES', {
    month: 'short',
    year: 'numeric'
  });
}

// Formatear número a moneda
export function formatearMoneda(valor: number): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(valor);
}

// Formatear número con separadores de miles
export function formatearNumero(valor: number, decimales: number = 0): string {
  return new Intl.NumberFormat('es-ES', {
    minimumFractionDigits: decimales,
    maximumFractionDigits: decimales
  }).format(valor);
}

// Formatear kg para gráficos (sin decimales, con separador de miles)
export function formatearKgGrafico(valor: number): string {
  return new Intl.NumberFormat('es-ES', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(valor) + ' kg';
}

// Formatear euros para gráficos (2 decimales, con separador de miles)
export function formatearEurosGrafico(valor: number): string {
  return new Intl.NumberFormat('es-ES', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(valor) + ' €';
}

// Obtener lista única de valores de un campo
export function obtenerValoresUnicos<T extends RegistroEntrada | RegistroSalida>(
  datos: T[],
  campo: keyof T
): string[] {
  const valores = datos
    .map(d => d[campo])
    .filter((v) => typeof v === 'string' && v.trim() !== '') as string[];

  return Array.from(new Set(valores)).sort();
}

// Filtrar registros por múltiples criterios
export function filtrarRegistros<T extends RegistroEntrada | RegistroSalida>(
  datos: T[],
  filtros: {
    especie?: string;
    variedad?: string;
    calibre?: string;
    cliente?: string;
    fechaDesde?: string;
    fechaHasta?: string;
    temporada?: number;
  }
): T[] {
  return datos.filter(registro => {
    // Filtrar por especie
    if (filtros.especie && registro.Especie !== filtros.especie) {
      return false;
    }

    // Filtrar por variedad
    if (filtros.variedad && registro.Variedad !== filtros.variedad) {
      return false;
    }

    // Filtrar por calibre
    if (filtros.calibre && registro.Calibre !== filtros.calibre) {
      return false;
    }

    // Filtrar por cliente (solo para salidas)
    if (filtros.cliente && 'Cliente' in registro) {
      if ((registro as any).Cliente !== filtros.cliente) {
        return false;
      }
    }

    // Filtrar por temporada
    if (filtros.temporada && registro.Temporada !== filtros.temporada) {
      return false;
    }

    // Filtrar por rango de fechas
    if (filtros.fechaDesde || filtros.fechaHasta) {
      const fecha = parsearFecha(registro.Fecha);

      if (filtros.fechaDesde) {
        const desde = parsearFecha(filtros.fechaDesde);
        if (fecha < desde) return false;
      }

      if (filtros.fechaHasta) {
        const hasta = parsearFecha(filtros.fechaHasta);
        if (fecha > hasta) return false;
      }
    }

    return true;
  });
}

// Agrupar datos por un campo
export function agruparPor<T extends RegistroEntrada | RegistroSalida>(
  datos: T[],
  campo: keyof T
): { [key: string]: T[] } {
  return datos.reduce((acc, registro) => {
    const valor = String(registro[campo] || 'Sin especificar');
    if (!acc[valor]) {
      acc[valor] = [];
    }
    acc[valor].push(registro);
    return acc;
  }, {} as { [key: string]: T[] });
}

// Calcular total de un campo numérico
export function sumarCampo<T extends RegistroEntrada | RegistroSalida>(
  datos: T[],
  campo: keyof T
): number {
  return datos.reduce((sum, registro) => {
    const valor = registro[campo];
    if (typeof valor === 'number') {
      return sum + valor;
    }
    return sum;
  }, 0);
}

// Calcular promedio de un campo numérico
export function promedioCampo<T extends RegistroEntrada | RegistroSalida>(
  datos: T[],
  campo: keyof T
): number {
  const total = sumarCampo(datos, campo);
  const count = datos.filter(d => typeof d[campo] === 'number').length;
  return count > 0 ? total / count : 0;
}
