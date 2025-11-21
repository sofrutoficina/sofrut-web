# Guía de Deployment a Firebase Hosting

Esta guía te llevará paso a paso para desplegar Sofrut Web a producción con Firebase Hosting.

## 📋 Requisitos Previos

✅ **Completado:**
- [x] Firebase CLI instalado (`firebase-tools`)
- [x] Proyecto creado en Firebase Console
- [x] Credenciales de Firebase en `.env.local`

⚠️ **Pendiente antes de producción:**
- [ ] Configurar reglas de seguridad de Firestore
- [ ] Crear usuario administrador inicial
- [ ] Verificar variables de entorno

---

## 🔐 PASO 1: Configurar Reglas de Seguridad de Firestore (CRÍTICO)

**Antes de desplegar, DEBES configurar las reglas de Firestore.**

### 1.1 Ir a Firebase Console
```
https://console.firebase.google.com/
→ Selecciona tu proyecto: sofrut-app
→ Firestore Database
→ Rules (Reglas)
```

### 1.2 Reemplazar las reglas actuales

**⚠️ IMPORTANTE: Como NO usamos Firebase Authentication, usaremos reglas básicas:**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // TEMPORAL: Permitir acceso desde la IP de tu oficina
    // Reemplaza con tu IP pública
    function isFromOffice() {
      return request.auth == null; // Permitir por ahora
    }

    // Colección de usuarios
    match /usuarios/{userId} {
      allow read, write: if isFromOffice();
    }

    // Logs de acceso
    match /logs_acceso/{logId} {
      allow read, write: if isFromOffice();
    }

    // Datos de negocio
    match /salidas/{docId} {
      allow read, write: if isFromOffice();
    }

    match /entradas/{docId} {
      allow read, write: if isFromOffice();
    }

    // Por defecto: denegar todo
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

**NOTA:** Estas reglas permiten acceso sin autenticación Firebase. Para mayor seguridad, considera:
- Limitar por IP en la configuración de Firebase
- Implementar Firebase Authentication en el futuro
- Usar Cloud Functions para operaciones sensibles

### 1.3 Publicar las reglas
Click en **"Publicar"** en Firebase Console.

---

## 🚀 PASO 2: Autenticarse con Firebase

Abre una terminal y ejecuta:

```bash
firebase login
```

Esto abrirá tu navegador para autenticarte con tu cuenta de Google (sofrutoficina@gmail.com).

**Si ya estás autenticado:**
```bash
firebase login --reauth
```

**Verificar autenticación:**
```bash
firebase projects:list
```

Deberías ver `sofrut-app` en la lista.

---

## 🔧 PASO 3: Inicializar Firebase Hosting

Desde la raíz del proyecto:

```bash
cd C:\Users\usuari\Desktop\CLAUDE\sofrut-web
firebase init hosting
```

**Responde a las preguntas así:**

```
? Use an existing project
  → Selecciona: sofrut-app

? What do you want to use as your public directory?
  → out

? Configure as a single-page app (rewrite all urls to /index.html)?
  → No

? Set up automatic builds and deploys with GitHub?
  → No (por ahora, deploy manual)

? File out/404.html already exists. Overwrite?
  → No

? File out/index.html already exists. Overwrite?
  → No
```

Esto creará `firebase.json` y `.firebaserc`.

---

## 📦 PASO 4: Configurar Next.js para Static Export

### 4.1 Verificar next.config.js

El archivo `next.config.js` debe tener:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',  // Habilita static export
  images: {
    unoptimized: true  // Necesario para static export
  }
};

module.exports = nextConfig;
```

Ya está configurado ✅

### 4.2 Actualizar package.json

Agrega scripts de deployment:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "export": "next build",
    "deploy": "npm run export && firebase deploy --only hosting"
  }
}
```

---

## 🛠️ PASO 5: Build de Producción

### 5.1 Limpiar builds anteriores

```bash
rm -rf .next out
```

### 5.2 Crear build de producción

```bash
npm run build
```

Este comando:
1. Compila Next.js en modo producción
2. Optimiza el código
3. Genera archivos estáticos en `/out`

**Verificar que se creó la carpeta `/out`:**
```bash
ls out
```

Deberías ver archivos HTML, JS, CSS, etc.

---

## 🚀 PASO 6: Desplegar a Firebase

### 6.1 Preview local (opcional)

Prueba el sitio antes de desplegarlo:

```bash
firebase serve
```

Abre http://localhost:5000 en tu navegador.

### 6.2 Desplegar a producción

```bash
firebase deploy --only hosting
```

**Salida esperada:**
```
✔  Deploy complete!

Project Console: https://console.firebase.google.com/project/sofrut-app/overview
Hosting URL: https://sofrut-app.web.app
```

### 6.3 Verificar el despliegue

Abre en tu navegador:
```
https://sofrut-app.web.app
```

O:
```
https://sofrut-app.firebaseapp.com
```

---

## ✅ PASO 7: Configuración Post-Deployment

### 7.1 Crear usuario administrador

Ejecuta el script desde tu máquina local (que tiene acceso a Firestore):

```bash
cd C:\Users\usuari\Desktop\CLAUDE\sofrut-web
node scripts/crear-usuario-admin.js
```

**Credenciales creadas:**
- Email: sofrutoficina@gmail.com
- Password: sofrut2025
- Rol: admin

⚠️ **IMPORTANTE:** Cambia la contraseña después del primer login.

### 7.2 Probar el login

1. Ve a https://sofrut-app.web.app/login
2. Ingresa las credenciales
3. Deberías ver el dashboard

### 7.3 Cambiar contraseña inicial

1. Una vez dentro, ve a "Cambiar contraseña"
2. Establece una contraseña segura

---

## 🌐 PASO 8: Configurar Dominio Personalizado (Opcional)

Si quieres usar tu propio dominio:

### 8.1 En Firebase Console

```
Firebase Console → Hosting → Add custom domain
```

### 8.2 Agregar dominio

Ejemplo: `sofrut.com` o `app.sofrut.com`

Firebase te dará instrucciones para:
1. Verificar propiedad del dominio
2. Configurar DNS (registros A o CNAME)

### 8.3 SSL/TLS

Firebase provee certificados SSL gratuitos automáticamente.

---

## 🔄 Actualizaciones Futuras

Para actualizar el sitio desplegado:

```bash
# 1. Hacer cambios en el código
# 2. Build
npm run build

# 3. Deploy
firebase deploy --only hosting
```

O usar el script combinado:
```bash
npm run deploy
```

---

## 🐛 Troubleshooting

### Problema: "Build failed"

```bash
# Limpiar caché
rm -rf .next out node_modules
npm install
npm run build
```

### Problema: "Firebase deploy failed"

```bash
# Re-autenticar
firebase logout
firebase login

# Verificar proyecto
firebase use sofrut-app
```

### Problema: "Página en blanco después del deploy"

1. Verifica que `next.config.js` tenga `output: 'export'`
2. Revisa que `firebase.json` apunte a carpeta `out`
3. Revisa la consola del navegador para errores de CORS o rutas

### Problema: "Error de autenticación en la app"

1. Verifica que las cookies funcionen en HTTPS
2. Revisa las reglas de Firestore
3. Verifica que el usuario admin existe en Firestore

---

## 📊 Monitoreo

### Ver estadísticas de uso

```
Firebase Console → Hosting → Dashboard
```

Puedes ver:
- Número de visitas
- Ancho de banda usado
- Errores 404

### Ver logs de Firestore

```
Firebase Console → Firestore → Data → logs_acceso
```

---

## 🔒 Seguridad en Producción

### Checklist de seguridad:

- [ ] Reglas de Firestore configuradas (no en modo prueba)
- [ ] Usuario admin creado y contraseña cambiada
- [ ] Variables de entorno verificadas
- [ ] HTTPS habilitado (automático con Firebase)
- [ ] Cookies con secure: true funcionando
- [ ] Revisar SEGURIDAD.md para mejoras adicionales

---

## 💰 Costos

Firebase Hosting - Plan Spark (Gratis):
- ✅ 10 GB de almacenamiento
- ✅ 360 MB/día de transferencia
- ✅ SSL gratis
- ✅ CDN global

Firestore - Plan Spark (Gratis):
- ✅ 1 GB de almacenamiento
- ✅ 50,000 lecturas/día
- ✅ 20,000 escrituras/día

**Para tu aplicación:** El plan gratuito es más que suficiente.

---

## 📞 Soporte

Si tienes problemas:
1. Revisa esta guía
2. Consulta SEGURIDAD.md para temas de seguridad
3. Revisa Firebase Console para logs
4. Contacta al equipo de desarrollo

---

**Última actualización:** Noviembre 2025
**Versión:** 1.0
