# Guía de Deployment - Sofrut Web

## ⚠️ IMPORTANTE: Limitaciones de Firebase Hosting

Esta aplicación usa:
- **Middleware** (middleware.ts) para protección de rutas y auth
- **API Routes** (/api/auth, /api/admin) para lógica del servidor
- **Cookies httpOnly** para autenticación segura

**Firebase Hosting** solo sirve archivos estáticos HTML/CSS/JS. **NO soporta**:
- ❌ Middleware de Next.js
- ❌ API Routes
- ❌ Server-side Rendering (SSR)
- ❌ Server Actions

---

## 📌 Opciones de Deployment

### ✅ OPCIÓN A: Vercel (Recomendado - Gratis)

**Ventajas:**
- ✅ Soporte completo para Next.js (middleware, API routes, SSR)
- ✅ Gratis para proyectos personales
- ✅ Deploy automático desde GitHub
- ✅ SSL gratis y CDN global
- ✅ Sin configuración adicional

**Pasos:**
1. Ir a [vercel.com](https://vercel.com)
2. Conectar cuenta de GitHub
3. Importar repositorio `sofrut-web`
4. Deploy automático (2 minutos)
5. Tu app estará en: `https://sofrut-web.vercel.app`

**Costo:** $0/mes

---

### OPCIÓN B: Firebase Hosting + Cloud Functions (Con Costo)

**Ventajas:**
- ✅ Todo en el ecosistema Firebase
- ✅ Integración directa con Firestore

**Desventajas:**
- ❌ Requiere plan Blaze (pago por uso)
- ❌ Configuración más compleja
- ❌ Costo estimado: $25-50/mes

**Requiere:**
- Upgrade a plan Blaze
- Configurar Next.js con Firebase Functions
- Modificar package.json y firebase.json
- Deploy tanto Hosting como Functions

**Costo:** ~$25-50/mes (uso moderado)

---

### OPCIÓN C: Remover Middleware (NO RECOMENDADO)

**Esto permitiría usar Firebase Hosting gratis, pero:**
- ❌ Cualquiera podría acceder sin login
- ❌ No habría protección de rutas
- ❌ Muy inseguro para producción

**NO usar esta opción.**

---

## 🚀 Deployment Recomendado: VERCEL

### PASO 1: Preparar el Proyecto

Ya está listo ✅ No requiere cambios.

### PASO 2: Crear Cuenta en Vercel

1. Ir a https://vercel.com/signup
2. Conectar con tu cuenta de GitHub (sofrutoficina)

### PASO 3: Importar Proyecto

1. Click en "Add New Project"
2. Seleccionar repositorio: `sofrutoficina/sofrut-web`
3. Autorizar acceso si es necesario

### PASO 4: Configurar Variables de Entorno

En la configuración del proyecto en Vercel, agregar:

```
NEXT_PUBLIC_FIREBASE_API_KEY=tu_valor
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu_valor
NEXT_PUBLIC_FIREBASE_PROJECT_ID=sofrut-app
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu_valor
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=tu_valor
NEXT_PUBLIC_FIREBASE_APP_ID=tu_valor
```

Copiar desde tu archivo `.env.local`

### PASO 5: Deploy

1. Click "Deploy"
2. Vercel automáticamente:
   - Detecta Next.js
   - Instala dependencias
   - Construye el proyecto
   - Despliega en CDN global

Tiempo estimado: **2-3 minutos**

### PASO 6: Verificar

Tu app estará disponible en:
```
https://sofrut-web.vercel.app
```

O puedes configurar un dominio personalizado gratis.

### PASO 7: Post-Deployment

#### 7.1 Crear Usuario Admin (desde tu PC local)

```bash
cd C:\Users\usuari\Desktop\CLAUDE\sofrut-web
node scripts/crear-usuario-admin.js
```

#### 7.2 Probar Login

1. Ve a https://sofrut-web.vercel.app/login
2. Login con sofrutoficina@gmail.com / sofrut2025
3. Cambiar contraseña en el panel

#### 7.3 Actualizar Reglas de Firestore

Ir a Firebase Console → Firestore → Rules y usar las reglas en `firestore.rules`

---

## 🔄 Actualizaciones Futuras

Vercel hace deploy automático cada vez que haces push a GitHub:

```bash
git add .
git commit -m "Update feature X"
git push
```

**Vercel automáticamente:**
1. Detecta el push
2. Construye la nueva versión
3. Despliega en producción
4. URL: https://sofrut-web.vercel.app

---

## 🌐 Dominio Personalizado (Opcional)

En Vercel Dashboard:
1. Settings → Domains
2. Add Domain
3. Configurar DNS según instrucciones

SSL gratis incluido.

---

## 📊 Monitoreo

### Vercel Dashboard
- Deployment logs
- Analytics
- Performance metrics

### Firebase Console
- Firestore usage
- Access logs en colección `logs_acceso`

---

## 🐛 Troubleshooting

### Problema: Error en build de Vercel

Ver logs en Vercel Dashboard → Deployments → Build Logs

### Problema: Variables de entorno no funcionan

1. Verificar en Vercel Dashboard → Settings → Environment Variables
2. Redeploy del proyecto

### Problema: Cookies no funcionan

Verificar que:
- Domain está en HTTPS (automático en Vercel)
- Cookies tienen `secure: true` (ya configurado)

---

## 💰 Costos

### Vercel - Plan Hobby (Gratis)
- ✅ Proyectos ilimitados
- ✅ 100 GB ancho de banda/mes
- ✅ SSL gratis
- ✅ CDN global
- ✅ Deploy automático

### Firestore - Plan Spark (Gratis)
- ✅ 1 GB almacenamiento
- ✅ 50,000 lecturas/día
- ✅ 20,000 escrituras/día

**Total: $0/mes** ✅

---

## 📞 Soporte

Si necesitas Firebase Hosting + Functions en lugar de Vercel, contacta al equipo de desarrollo para configuración completa.

---

**Última actualización:** Noviembre 2025
**Versión:** 2.0 (Actualizado para Vercel)
