# Carpeta de Datos

Esta carpeta debe contener los archivos JSON generados por el procesador Python.

## Archivos Necesarios

- `salidas.json` - Datos de ventas
- `entradas.json` - Datos de compras

## Cómo Generar los Datos

1. Ejecutar el procesador Python ubicado en:
   ```
   /mnt/c/Users/usuari/Desktop/RESUM APP/2N PAS/procesador_excel.py
   ```

2. El procesador leerá los archivos Excel y generará los JSON automáticamente en esta carpeta.

## Estructura Esperada

### salidas.json
```json
{
  "archivo": "nombre_archivo.xlsx",
  "fecha_procesamiento": "2025-11-19T10:00:00",
  "filas_totales": 1234,
  "datos": [
    {
      "Fecha": "2024-01-15",
      "Número": "V-001",
      "Cliente": "Cliente 1",
      "Especie": "Naranja",
      "Variedad": "Navel",
      "Calibre": "1",
      "Peso Neto": 1000,
      "Precio": 0.5,
      "Importe": 500,
      "Temporada": 2024
    }
  ]
}
```

### entradas.json
```json
{
  "archivo": "nombre_archivo.xlsx",
  "fecha_procesamiento": "2025-11-19T10:00:00",
  "filas_totales": 567,
  "datos": [
    {
      "Fecha": "2024-01-15",
      "Número": "E-001",
      "Proveedor": "Proveedor 1",
      "Especie": "Naranja",
      "Variedad": "Navel",
      "Calibre": "1",
      "Peso Neto": 1000,
      "Precio": 0.3,
      "Importe": 300,
      "Temporada": 2024
    }
  ]
}
```

## ⚠️ Importante

- Los archivos JSON **NO están en el repositorio** por contener datos sensibles
- Debes generarlos localmente con el procesador Python
- Asegúrate de que el procesador no genera valores `NaN` (deben ser `null`)
