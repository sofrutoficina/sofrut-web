# Sofrut Web - Dashboard de Análisis de Ventas

Aplicación web para análisis y visualización de datos de ventas y compras de productos frutícolas.

## 📋 Descripción

Sistema completo de análisis de datos comerciales que incluye:
- Dashboard principal con KPIs y gráficos
- Análisis por variedad de productos
- Análisis por cliente
- Comparación entre temporadas
- Gestión de salidas (ventas) y entradas (compras)
- Modo oscuro/claro
- Filtros avanzados
- Agrupación de datos con sumatorios
- Gráficos interactivos con zoom

## 🚀 Características Principales

### Dashboard
- KPIs principales: Total vendido, Facturación, Operaciones, Precio promedio
- Evolución mensual (últimos 6 meses)
- Análisis por cliente con gráfico de ancho completo y zoom interactivo
- Distribución por especie

### Análisis Detallados
- **Por Variedad**: Evolución de precios, distribución de ventas, Top variedades
- **Por Cliente**: Análisis completo por cliente con filtros, calibres, precios
- **Comparar**: Comparación entre temporadas con filtros

### Tablas de Datos
- **Salidas**: Lista completa de ventas con filtros y agrupación
- **Entradas**: Lista completa de compras con filtros y agrupación
- Funcionalidades:
  - Búsqueda en tiempo real
  - Ordenación por columnas
  - Agrupación por cualquier columna
  - Sumatorios automáticos en grupos
  - Selector de registros por página (10, 20, 50, 100, 200)
  - Expand/collapse de grupos

### Gráficos
- Formateo correcto: kg sin decimales, € con 2 decimales
- Separadores de miles (formato español)
- Zoom interactivo en gráficos de barras
- Tooltips informativos
- Responsive

## 🛠️ Tecnologías

- **Next.js 16** - Framework React con App Router
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Estilos con dark mode
- **Recharts** - Librería de gráficos
- **Lucide React** - Iconos
- **React Context API** - Gestión de estado (tema)

## 📦 Instalación

### Prerrequisitos
- Node.js 18+
- npm o yarn

### Pasos

1. **Clonar el repositorio**
```bash
git clone https://github.com/TU_USUARIO/sofrut-web.git
cd sofrut-web
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Preparar datos**

Asegúrate de tener los archivos de datos en la carpeta `/data`:
- `salidas.json` - Datos de ventas
- `entradas.json` - Datos de compras

Estos archivos se generan con el procesador Python (ver sección Procesador de Datos).

4. **Ejecutar en desarrollo**
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

5. **Compilar para producción**
```bash
npm run build
npm start
```

## 📊 Procesador de Datos

El proyecto incluye un procesador Python para convertir archivos Excel a JSON.

### Ubicación del procesador
```
/mnt/c/Users/usuari/Desktop/RESUM APP/2N PAS/
```

### Archivos del procesador
- `procesador_excel.py` - Script principal
- `requirements.txt` - Dependencias Python

### Uso del procesador

1. **Instalar dependencias Python**
```bash
cd "/mnt/c/Users/usuari/Desktop/RESUM APP/2N PAS"
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

2. **Ejecutar procesador**
```bash
python3 procesador_excel.py
```

Este script:
- Lee archivos Excel de salidas y entradas
- Procesa y limpia los datos
- Genera archivos JSON válidos
- Los guarda en `/home/sofrutoficina/sofrut-web/data/`

**IMPORTANTE**: El procesador debe generar JSON sin valores `NaN`. Si hay NaN en los JSON, la aplicación no funcionará correctamente.

## 📁 Estructura del Proyecto

```
sofrut-web/
├── app/                      # Páginas Next.js (App Router)
│   ├── page.tsx             # Dashboard principal
│   ├── variedad/            # Análisis por variedad
│   ├── cliente/             # Análisis por cliente
│   ├── comparar/            # Comparar temporadas
│   ├── salidas/             # Lista de salidas
│   ├── entradas/            # Lista de entradas
│   ├── layout.tsx           # Layout raíz
│   └── api/                 # API routes
│       └── datos/           # Endpoints de datos
├── components/              # Componentes React
│   ├── Navigation.tsx       # Menú lateral
│   ├── KPICard.tsx         # Tarjetas de KPI
│   ├── GraficoLineas.tsx   # Gráfico de líneas
│   ├── GraficoBarras.tsx   # Gráfico de barras (con zoom)
│   ├── GraficoDona.tsx     # Gráfico de dona
│   ├── TablaDatos.tsx      # Tabla con agrupación
│   ├── Filtros.tsx         # Panel de filtros
│   ├── ThemeToggle.tsx     # Botón tema
│   └── ClientLayout.tsx    # Wrapper cliente
├── contexts/                # Contextos React
│   └── ThemeContext.tsx    # Context de tema
├── lib/                     # Utilidades
│   ├── datos.ts            # Funciones de datos
│   └── types.ts            # Tipos TypeScript
├── data/                    # Datos JSON
│   ├── salidas.json        # Datos de salidas
│   └── entradas.json       # Datos de entradas
├── public/                  # Archivos estáticos
└── package.json            # Dependencias
```

## 🎨 Características de UI/UX

### Modo Oscuro
- Toggle en el menú lateral
- Persistencia en localStorage
- Detección automática de preferencia del sistema
- Todos los componentes compatibles

### Responsive
- Diseño adaptable a móvil, tablet y desktop
- Grid responsive en filtros y gráficos
- Menú lateral sticky

### Accesibilidad
- Iconos con títulos descriptivos
- Contraste adecuado en ambos temas
- Estados hover y disabled bien definidos

## 🔧 Configuración

### Variables de Entorno
No requiere variables de entorno para funcionar.

### Personalización de Datos
Para modificar las rutas de los archivos de datos, edita:
- `app/api/datos/salidas/route.ts`
- `app/api/datos/entradas/route.ts`

## 🐛 Solución de Problemas

### Error: "NaN is not valid JSON"
**Causa**: Los archivos JSON contienen valores NaN
**Solución**: Volver a ejecutar el procesador Python asegurándote de que convierte NaN a null

### Error: "useTheme must be used within a ThemeProvider"
**Causa**: Problema de SSR con el ThemeContext
**Solución**: Ya está resuelto con el ClientLayout y dynamic import de ThemeToggle

### Gráficos no se muestran
**Causa**: Datos no cargados o formato incorrecto
**Solución**: Verificar que los JSON están en `/data` y tienen el formato correcto

## 📝 Próximas Mejoras

- [ ] Exportar datos a Excel/PDF
- [ ] Filtros por rango de fechas más avanzados
- [ ] Gráficos adicionales (heat maps, scatter plots)
- [ ] Predicciones y tendencias
- [ ] Multi-usuario con autenticación
- [ ] API REST completa
- [ ] Tests unitarios y e2e
- [ ] Optimización de rendimiento para grandes volúmenes

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es privado y propiedad de Sofrut.

## 📞 Contacto

Para dudas o soporte, contacta con el equipo de desarrollo.

---

**Última actualización**: Noviembre 2025
**Versión**: 1.0.0
