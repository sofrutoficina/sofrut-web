# 📤 Instrucciones para Subir a GitHub

## ✅ Estado Actual

El proyecto está **completamente preparado** para GitHub:
- ✅ Código completo y funcional
- ✅ README.md con documentación completa
- ✅ NOTAS_TECNICAS.md con detalles técnicos
- ✅ .gitignore configurado (excluye datos sensibles)
- ✅ Commit realizado con todos los cambios
- ✅ Estructura organizada y documentada

## 🚀 Pasos para Subir a GitHub

### 1. Crear Repositorio en GitHub

1. Ve a https://github.com
2. Click en "New repository" (botón verde)
3. Configura el repositorio:
   - **Nombre**: `sofrut-web` (o el que prefieras)
   - **Descripción**: "Dashboard de análisis de ventas y compras - Sofrut"
   - **Visibilidad**:
     - ✅ **Private** (recomendado - datos sensibles)
     - ⚠️ Public (solo si no hay datos confidenciales)
   - **NO** marcar "Initialize with README" (ya tenemos uno)
   - **NO** añadir .gitignore (ya tenemos uno)
   - **NO** añadir licencia por ahora

4. Click en "Create repository"

### 2. Conectar Repositorio Local con GitHub

Una vez creado el repositorio, GitHub te mostrará instrucciones. Usa estas:

```bash
# Añadir remote (sustituye TU_USUARIO por tu usuario de GitHub)
git remote add origin https://github.com/TU_USUARIO/sofrut-web.git

# Verificar que se añadió correctamente
git remote -v

# Subir código
git push -u origin main
```

### 3. Verificar en GitHub

1. Ve a tu repositorio en GitHub
2. Verifica que todos los archivos están ahí
3. Revisa que el README.md se muestra correctamente
4. Comprueba que los archivos JSON de `/data` NO están (solo README.md y .gitkeep)

## 🔐 Autenticación en GitHub

Si es la primera vez que subes código, necesitarás autenticarte:

### Opción A: Personal Access Token (Recomendado)

1. Ve a GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token (classic)"
3. Nombre: "sofrut-web-dev"
4. Permisos necesarios:
   - ✅ repo (todos los sub-permisos)
5. Click "Generate token"
6. **COPIA EL TOKEN** (solo se muestra una vez)
7. Cuando hagas `git push`, usa el token como contraseña

### Opción B: SSH Keys

```bash
# Generar clave SSH
ssh-keygen -t ed25519 -C "tu_email@example.com"

# Copiar clave pública
cat ~/.ssh/id_ed25519.pub

# Añadir en GitHub → Settings → SSH and GPG keys → New SSH key
```

Luego usa URL SSH en lugar de HTTPS:
```bash
git remote set-url origin git@github.com:TU_USUARIO/sofrut-web.git
```

## 📥 Clonar en Otro PC

Una vez subido a GitHub, en otro PC:

```bash
# 1. Clonar repositorio
git clone https://github.com/TU_USUARIO/sofrut-web.git
cd sofrut-web

# 2. Instalar dependencias
npm install

# 3. Generar archivos de datos
# Ejecutar el procesador Python (ver README.md sección "Procesador de Datos")
cd "/ruta/al/procesador"
source venv/bin/activate
python3 procesador_excel.py

# 4. Verificar que los JSON se crearon
ls -lh data/*.json

# 5. Ejecutar aplicación
npm run dev
```

## 📋 Checklist para Nuevo PC

- [ ] Node.js 18+ instalado
- [ ] Git instalado
- [ ] Repositorio clonado
- [ ] `npm install` ejecutado
- [ ] Python 3 instalado (para procesador)
- [ ] Dependencias Python instaladas (`pip install -r requirements.txt`)
- [ ] Procesador Python ejecutado
- [ ] Archivos JSON generados en `/data`
- [ ] Aplicación funcionando (`npm run dev`)

## ⚠️ Puntos Importantes

### Datos Sensibles
Los archivos JSON con datos **NO están en GitHub** por seguridad. Debes:
1. Copiar el procesador Python al nuevo PC
2. Copiar los archivos Excel originales
3. Ejecutar el procesador para generar los JSON
4. Los JSON se crearán automáticamente en `/data`

### Archivos Excluidos del Repositorio
Según `.gitignore`:
- `/node_modules` - Dependencias (se instalan con npm install)
- `/.next` - Build de Next.js
- `/data/*.json` - Archivos de datos
- `.env*` - Variables de entorno
- `*.tsbuildinfo` - Cache de TypeScript

### Procesador Python
El procesador NO está en este repositorio. Ubicación actual:
```
/mnt/c/Users/usuari/Desktop/RESUM APP/2N PAS/
```

Deberías crear un repositorio separado para el procesador o copiarlo manualmente.

## 🔄 Workflow Recomendado

### En el PC Principal
```bash
# Hacer cambios
git add .
git commit -m "descripción de cambios"
git push
```

### En el PC Secundario
```bash
# Obtener últimos cambios
git pull

# Si hay conflictos, resolverlos y luego:
git add .
git commit -m "merge: resolver conflictos"
git push
```

## 📝 Comandos Git Útiles

```bash
# Ver estado
git status

# Ver diferencias
git diff

# Ver historial
git log --oneline

# Ver remotes
git remote -v

# Crear rama nueva
git checkout -b feature/nueva-funcionalidad

# Cambiar de rama
git checkout main

# Ver ramas
git branch -a

# Descartar cambios locales
git restore archivo.tsx

# Actualizar desde GitHub
git pull
```

## 🆘 Solución de Problemas

### Error: "Repository not found"
- Verifica que la URL del remote es correcta
- Verifica que tienes permisos en el repositorio
- Si es privado, asegúrate de estar autenticado

### Error: "Authentication failed"
- Regenera tu Personal Access Token
- O configura SSH keys
- Verifica que el token tiene los permisos necesarios

### Error: "Conflictos al hacer pull"
```bash
# Ver qué archivos tienen conflictos
git status

# Editar archivos y resolver conflictos manualmente
# Buscar marcadores: <<<<<<< HEAD

# Después de resolver:
git add .
git commit -m "merge: resolver conflictos"
```

### Error: "Archivos .json en el commit"
Si accidentalmente commiteas los JSON:
```bash
# Quitarlos del próximo commit
git rm --cached data/salidas.json data/entradas.json

# Verificar .gitignore
cat .gitignore | grep data

# Commit
git commit -m "fix: remover archivos de datos"
```

## 📞 Soporte

Si tienes dudas:
1. Consulta README.md
2. Consulta NOTAS_TECNICAS.md
3. Busca el error en Google/Stack Overflow
4. Revisa la documentación de Git: https://git-scm.com/doc

---

**Preparado el**: 19 de Noviembre de 2025
**Última actualización**: 19 de Noviembre de 2025
