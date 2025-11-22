# Conectar sofrut-web con backend en Render

Una vez desplegado el backend en Render, configurar sofrut-web para conectarse.

---

## 📋 Requisitos previos

1. ✅ Backend desplegado en Render
2. ✅ URL del backend obtenida (ej: `https://sofrut-data-api.onrender.com`)

---

## 🔧 Configuración

### Opción A: Variables de entorno en Vercel (Producción)

1. Ir a [Vercel Dashboard](https://vercel.com/dashboard)
2. Seleccionar proyecto `sofrut-web`
3. Ir a **Settings** → **Environment Variables**
4. Añadir nueva variable:

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_API_URL` | `https://sofrut-data-api-XXXXX.onrender.com` |

5. Click **Save**
6. Ir a **Deployments**
7. Click en el último deployment → **⋯** → **Redeploy**

---

### Opción B: Archivo .env.local (Desarrollo local)

```bash
cd sofrut-web

# Crear archivo .env.local
cat > .env.local << 'EOF'
# URL del backend FastAPI en Render
NEXT_PUBLIC_API_URL=https://sofrut-data-api-XXXXX.onrender.com

# Resto de variables (copiar desde .env si existen)
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
EOF

# Reiniciar servidor de desarrollo
npm run dev
```

---

## ✅ Verificación

### 1. Verificar que la variable está cargada

En la consola del navegador:
```javascript
console.log(process.env.NEXT_PUBLIC_API_URL)
// Debe mostrar: https://sofrut-data-api-XXXXX.onrender.com
```

### 2. Probar el procesador

1. Abrir `https://sofrut-web.vercel.app/procesador`
2. Subir un archivo Excel
3. Verificar que el análisis funciona

---

## 🐛 Troubleshooting

### Problema: "Failed to fetch" o CORS error

**Solución 1:** Verificar variable de entorno en Render

En Render Dashboard → Service → Environment:
```
ALLOWED_ORIGINS=https://sofrut-web.vercel.app
```

**Solución 2:** Incluir subdominios de Vercel

```
ALLOWED_ORIGINS=https://sofrut-web.vercel.app,https://sofrut-web-*.vercel.app
```

### Problema: "Cannot read properties of undefined"

**Causa:** Variable `NEXT_PUBLIC_API_URL` no está configurada

**Solución:** Añadir variable en Vercel y redeploy

---

## 🔄 Actualización del backend

Si cambias la URL del backend:

1. Actualizar variable `NEXT_PUBLIC_API_URL` en Vercel
2. Redeploy desde Vercel Dashboard

---

## 📝 Notas

- Vercel recarga variables de entorno solo en redeploys
- Cambios en `.env.local` requieren reiniciar `npm run dev`
- El backend en Render puede tener cold start (30-60s primera request)

---

**¡Listo!** Tu frontend está conectado con el backend en la nube 🎉
