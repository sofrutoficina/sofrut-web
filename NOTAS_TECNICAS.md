# Notas Técnicas - Sofrut Web

## 📌 Estado Actual del Proyecto

**Última sesión**: 19 de Noviembre de 2025
**Estado**: ✅ Funcionando correctamente en desarrollo

## 🎯 Características Implementadas en Esta Sesión

### 1. Gráfico de Clientes en Dashboard
- **Archivo**: `components/GraficoBarras.tsx`
- **Cambios**:
  - Añadido prop `zoom` para activar funcionalidad de zoom
  - Implementado Brush component de Recharts para zoom interactivo
  - Botones de control: Acercar, Alejar, Restablecer
  - Muestra inicialmente 10 elementos, zoom mínimo 5 elementos

### 2. Tabla con Agrupación
- **Archivo**: `components/TablaDatos.tsx`
- **Cambios**:
  - Dropdown para agrupar por cualquier columna
  - Expand/collapse de grupos con iconos chevron
  - Sumatorios automáticos en filas azules
  - Selector de registros por página (10, 20, 50, 100, 200)
  - Botones "Expandir todos" / "Contraer todos"
  - Paginación desactivada cuando hay agrupación

## ⚠️ Puntos Críticos a Tener en Cuenta

### 1. Archivos de Datos
**IMPORTANTE**: Los archivos JSON NO deben contener valores `NaN`

**Ubicación**: `/home/sofrutoficina/sofrut-web/data/`
- `salidas.json` (ventas)
- `entradas.json` (compras)

**Problema común**: Si el procesador Python genera NaN, la aplicación fallará.
**Solución**: El procesador debe convertir NaN a `null` antes de guardar JSON.

### 2. Rutas del Procesador Python

**Ubicación actual**: `/mnt/c/Users/usuari/Desktop/RESUM APP/2N PAS/`

**Archivos importantes**:
- `procesador_excel.py` - Script principal
- `requirements.txt` - Dependencias Python
- Excel de origen (Salidas y Entradas)

**Ruta de destino**: Los JSON generados deben ir a `/home/sofrutoficina/sofrut-web/data/`

### 3. Modo Oscuro - Solución SSR

**Problema**: El ThemeContext causaba errores de SSR ("useTheme must be used within a ThemeProvider")

**Solución implementada**:
1. `components/ClientLayout.tsx` - Wrapper cliente con ThemeProvider
2. En `components/Navigation.tsx` - ThemeToggle importado con dynamic import:
   ```typescript
   const ThemeToggle = dynamic(() => import('./ThemeToggle'), {
     ssr: false,
     loading: () => <div className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 w-9 h-9" />
   });
   ```
3. `app/layout.tsx` - Usa ClientLayout para envolver todo

**NO modificar** esta estructura o volverán los errores de SSR.

## 🗂️ Estructura de Tipos

### Tipos Principales (`lib/types.ts`)

```typescript
// Registro de salida (venta)
export interface RegistroSalida {
  Fecha: string;
  Número: string;
  Cliente: string;
  Especie: string;
  Variedad: string;
  Calibre: string;
  'Peso Neto': number;
  Precio: number;
  Importe: number;
  Temporada: number;
}

// Registro de entrada (compra)
export interface RegistroEntrada {
  Fecha: string;
  Número: string;
  Proveedor: string;  // ← Diferencia clave
  Especie: string;
  Variedad: string;
  Calibre: string;
  'Peso Neto': number;
  Precio: number;
  Importe: number;
  Temporada: number;
}
```

**Nota**: La única diferencia es `Cliente` vs `Proveedor`.

## 🎨 Sistema de Colores

### Colores Principales
- Verde: `#10b981` (green-600) - Color corporativo
- Azul: `#3b82f6` (blue-600) - Facturación
- Naranja: `#f59e0b` (amber-600) - Precios
- Rojo: `#ef4444` (red-600) - Alertas
- Morado: `#8b5cf6` (violet-600) - Extras

### Dark Mode
- Background: `dark:bg-gray-900`
- Cards: `dark:bg-gray-800`
- Borders: `dark:border-gray-700`
- Text: `dark:text-gray-100`

## 📊 Formato de Números

### Funciones de Formateo (`lib/datos.ts`)

```typescript
// Para mostrar en interfaz
formatearMoneda(valor: number) → "1.234,56 €"
formatearNumero(valor: number, decimales: number) → "1.234,5"

// Para tooltips de gráficos
formatearKgGrafico(valor: number) → "1.234 kg" (sin decimales)
formatearEurosGrafico(valor: number) → "1.234,56 €" (2 decimales)
```

**Importante**: Formato español con punto como separador de miles y coma para decimales.

## 🔄 Flujo de Datos

1. **Origen**: Excel → Procesador Python
2. **Procesamiento**: Python limpia y transforma datos
3. **Almacenamiento**: JSON en `/data`
4. **API**: Next.js API routes sirven los JSON
5. **Cliente**: React carga datos vía fetch
6. **Visualización**: Componentes procesan y muestran datos

### API Routes

```
GET /api/datos/salidas → salidas.json
GET /api/datos/entradas → entradas.json
```

**Archivos**:
- `app/api/datos/salidas/route.ts`
- `app/api/datos/entradas/route.ts`

## 🚨 Errores Comunes y Soluciones

### 1. "NaN is not valid JSON"
**Causa**: JSON con valores NaN
**Solución**: Reejecutar procesador Python

### 2. Gráficos no se muestran
**Causa**: Datos mal formateados o vacíos
**Solución**:
- Verificar que JSON existe en `/data`
- Verificar estructura del JSON
- Abrir DevTools Console para ver errores

### 3. Modo oscuro no funciona
**Causa**: LocalStorage bloqueado o error en ThemeContext
**Solución**:
- Verificar que ClientLayout está en layout.tsx
- Verificar dynamic import de ThemeToggle

### 4. Tabla agrupada sin datos
**Causa**: Columna de agrupación vacía o nula
**Solución**: El código maneja esto con "Sin especificar"

## 🔧 Configuración Recomendada

### Para Desarrollo
```bash
npm run dev
# Puerto: 3000
# Hot reload: Activado
```

### Para Producción
```bash
npm run build
npm start
# Puerto: 3000 (configurable con PORT env var)
```

### Variables de Entorno Opcionales
```env
# No son necesarias actualmente, pero podrían añadirse:
# PORT=3000
# NODE_ENV=production
```

## 📱 Responsive Breakpoints

```css
sm: 640px   /* Mobile */
md: 768px   /* Tablet */
lg: 1024px  /* Desktop */
xl: 1280px  /* Desktop grande */
```

**Grid en filtros**:
- Mobile: 1 columna
- Tablet: 2 columnas
- Desktop: 3 columnas

## 🎯 Próximos Pasos Recomendados

1. **Optimizar procesador Python** para evitar NaN
2. **Añadir tests** (Jest + React Testing Library)
3. **Mejorar performance** para datasets grandes (virtualización)
4. **Exportar a Excel** desde las tablas
5. **Añadir más gráficos** (heatmaps, scatter)
6. **Autenticación** si se va a usar multi-usuario
7. **Deploy** a Vercel o similar

## 🐛 Debug Tips

### Ver estado de datos
```javascript
// En DevTools Console
console.log('Datos cargados:', datos);
console.log('Datos filtrados:', datosFiltrados);
```

### Ver errores de API
```javascript
// En Network tab de DevTools
// Filtrar por: /api/datos/
```

### Ver estado de tema
```javascript
// En Console
localStorage.getItem('theme')
```

## 📚 Recursos Útiles

- [Next.js Docs](https://nextjs.org/docs)
- [Recharts Docs](https://recharts.org/)
- [Tailwind Docs](https://tailwindcss.com/docs)
- [Lucide Icons](https://lucide.dev/)

## 👨‍💻 Comandos Útiles

```bash
# Desarrollo
npm run dev

# Build producción
npm run build

# Iniciar producción
npm start

# Linter
npm run lint

# Instalar dependencia
npm install <paquete>

# Ver estructura
tree -L 2 -I 'node_modules|.next'

# Ver git status
git status

# Commit
git add .
git commit -m "mensaje"

# Push
git push origin main
```

---

**Mantenido por**: Equipo de Desarrollo Sofrut
**Última actualización**: 19 de Noviembre de 2025
