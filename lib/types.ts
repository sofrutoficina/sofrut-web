/**
 * Tipos TypeScript para el sistema Sofrut
 * Define la estructura de datos de entradas y salidas
 */

// Registro individual de entrada (compra)
export interface RegistroEntrada {
  Serie: string;
  Número: number;
  Proveedor: string;
  Documento: string;
  Fecha: string;
  Artículo: string;
  Parcela?: string;
  "Ud. Medida": string;
  Especie: string;
  Variedad: string;
  Calibre?: string;
  Calidad?: string;
  Marca?: string;
  "Lote cliente"?: string;
  Envase?: string;
  "Ud Envase"?: number;
  Palet?: string;
  "Ud Palet"?: number;
  "Tara Palet"?: number;
  "Tara Vehículo"?: number;
  Uds?: number;
  Precio?: number;
  "Precio / Kg"?: number;
  "Kg Brutos"?: number;
  Tara?: number;
  "Kg Neto": number;
  Total?: number;
  "T. Confección"?: string;
  Facturado?: boolean;
  Finca?: string;
  Temporada: number;
  Proyecto?: string;
  Almacén: string;
  "Fecha Factura"?: string;
  "Documento Factura"?: string;
}

// Registro individual de salida (venta)
export interface RegistroSalida {
  Serie: string;
  Número: number;
  "Ref. Cliente"?: string;
  Referencia?: number;
  Artículo: string;
  Variedad: string;
  Documento: string;
  Cliente: string;
  Fecha: string;
  Especie: string;
  Calibre?: string;
  Calidad?: string;
  Marca?: string;
  "Peso Bruto"?: number;
  "Nº Serie"?: string;
  Tara?: number;
  "Peso Neto": number;
  Uds?: number;
  "Ud. Medida": string;
  Precio?: number;
  Importe?: number;
  Facturado?: boolean;
  Lote?: string;
  "Lote Cliente"?: string;
  Confección?: string;
  Envase?: string;
  "Ud Envase"?: number;
  Palet?: string;
  "Ud Palet"?: number;
  "Nombre  dir. envío"?: string;
  Temporada: number;
  Almacén: string;
  "Fecha Factura"?: string;
  "Documento Factura"?: string;
}

// Archivo procesado completo
export interface ArchivoEntradas {
  tipo: "entradas";
  archivo_original: string;
  fecha_procesamiento: string;
  filas_totales: number;
  columnas: string[];
  inconsistencias_detectadas: number;
  datos: RegistroEntrada[];
}

export interface ArchivoSalidas {
  tipo: "salidas";
  archivo_original: string;
  fecha_procesamiento: string;
  filas_totales: number;
  columnas: string[];
  inconsistencias_detectadas: number;
  datos: RegistroSalida[];
}

// KPI (Indicador clave de rendimiento)
export interface KPI {
  titulo: string;
  valor: string | number;
  cambio?: number; // Cambio porcentual respecto periodo anterior
  tipo?: "positivo" | "negativo" | "neutral";
  icono?: string;
}

// Filtros aplicables
export interface Filtros {
  especies?: string[];
  variedades?: string[];
  calibres?: string[];
  clientes?: string[];
  proveedores?: string[];
  fechaDesde?: string;
  fechaHasta?: string;
  temporadas?: number[];
  tipo?: "entradas" | "salidas" | "ambos";
}

// Datos agregados por grupo
export interface DatoAgregado {
  nombre: string;
  valor: number;
  porcentaje?: number;
  color?: string;
}

// Punto en gráfico temporal
export interface PuntoTemporal {
  fecha: string;
  valor: number;
  label?: string;
}

// Estadística por variedad
export interface EstadisticaVariedad {
  variedad: string;
  especie: string;
  totalKg: number;
  totalImporte: number;
  precioPromedio: number;
  operaciones: number;
  calibres: { [calibre: string]: number };
  clientes: { [cliente: string]: number };
  evolucionPrecios: PuntoTemporal[];
  mejorMes: string;
  peorMes: string;
}
