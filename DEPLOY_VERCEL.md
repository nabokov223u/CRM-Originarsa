# 🚀 Deploy del CRM a Vercel - GUÍA COMPLETA

## ✅ Estado: LISTO PARA DEPLOY

El proyecto está compilando correctamente sin errores.

---

## 📋 OPCIÓN 1: Deploy desde GitHub (Recomendado)

### Paso 1: Subir cambios a GitHub

```bash
# En la carpeta del CRM
cd "C:\Users\paulestia\OneDrive - Originarsa\Documentos\CRM Originarsa"

# Agregar archivos
git add .

# Commit
git commit -m "feat: Integración con Firebase + configuración Vercel"

# Push
git push origin main
```

### Paso 2: Conectar GitHub con Vercel

1. Ve a https://vercel.com/
2. Clic en **"Add New Project"**
3. Clic en **"Import Git Repository"**
4. Selecciona tu repositorio: **"CRM-Originarsa"**
5. Clic en **"Import"**

### Paso 3: Configurar el proyecto

Vercel detectará automáticamente que es un proyecto Vite.

**Framework Preset:** Vite
**Build Command:** `npm run build`
**Output Directory:** `dist`
**Install Command:** `npm install`

### Paso 4: Agregar Variables de Entorno

En la sección **"Environment Variables"**, agrega:

```
VITE_FIREBASE_API_KEY=AIzaSyAG3UNT7TX5fpZfeabTJA4LH_mUl8gQEHs
VITE_FIREBASE_AUTH_DOMAIN=originarsa-crm.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=originarsa-crm
VITE_FIREBASE_STORAGE_BUCKET=originarsa-crm.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=1052053389441
VITE_FIREBASE_APP_ID=1:1052053389441:web:520e5ff388e3ea82d3cd80
```

### Paso 5: Deploy

Clic en **"Deploy"**

⏳ Espera 1-2 minutos...

✅ ¡Listo! Tu CRM estará en: `https://crm-originarsa.vercel.app`

---

## 📋 OPCIÓN 2: Deploy desde CLI

```bash
# Instalar Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel

# Configuración:
# ? Set up and deploy? → Y
# ? Which scope? → Tu cuenta
# ? Link to existing project? → N
# ? What's your project's name? → crm-originarsa
# ? In which directory is your code located? → ./
# ? Want to override the settings? → N

# Deploy a producción
vercel --prod
```

---

## 🔧 Configuración Automática (Archivo vercel.json)

Ya está configurado en el proyecto:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite"
}
```

---

## 🧪 Verificar Deploy

1. Abre la URL de Vercel en tu navegador
2. Deberías ver el CRM funcionando
3. Ve a la sección **"Leads"**
4. Intenta crear un lead
5. Verifica en Firebase que se guardó

---

## 🔥 Configurar Firebase (SI AÚN NO LO HICISTE)

### 1. Habilitar Firestore

1. Ve a: https://console.firebase.google.com/project/originarsa-crm
2. Menú → **"Compilación"** → **"Firestore Database"**
3. **"Crear base de datos"**
4. **"Iniciar en modo de prueba"**
5. Ubicación: **"us-central"**
6. **"Habilitar"**

### 2. Configurar Reglas

En la pestaña **"Reglas"**:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir escritura desde CrediExpress (sin auth)
    match /leads/{leadId} {
      allow create: if true;
      allow read, update, delete: if request.auth != null;
    }
    
    // Resto de colecciones requiere auth
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

---

## 🌐 Dominios Personalizados (Opcional)

### Agregar dominio propio:

1. En Vercel → Proyecto → **Settings** → **Domains**
2. Agregar dominio: `crm.originarsa.com`
3. Configurar DNS según instrucciones de Vercel

---

## 📊 Monitoreo y Analytics

Vercel provee automáticamente:
- ✅ Analytics de tráfico
- ✅ Speed Insights
- ✅ Error tracking
- ✅ Logs en tiempo real

Accede desde el dashboard de Vercel.

---

## 🔄 Re-deploys Automáticos

Cada vez que hagas `git push` a GitHub, Vercel:
1. Detecta el cambio
2. Compila automáticamente
3. Despliega la nueva versión
4. Te notifica por email

---

## ⚡ Problemas Comunes

### Error: Build Failed
```bash
# Verifica localmente:
npm run build

# Si funciona local pero no en Vercel:
# - Revisa las variables de entorno
# - Verifica que package.json tenga todas las dependencias
```

### Error: Firebase not initialized
```bash
# Verifica que agregaste TODAS las variables de entorno en Vercel
# Settings → Environment Variables
```

### Error: Page not loading
```bash
# Verifica que el Output Directory sea "dist" (no "build")
```

---

## 📱 URLs del Proyecto

Después del deploy tendrás:

- **Producción:** `https://crm-originarsa.vercel.app`
- **Preview (branches):** `https://crm-originarsa-[branch].vercel.app`
- **Firebase Console:** https://console.firebase.google.com/project/originarsa-crm

---

## 🎯 Siguientes Pasos

### 1. Integrar CrediExpress

Sigue las instrucciones en: **`INTEGRACION_FIREBASE_DIRECTA.md`**

En resumen:
1. Instalar Firebase en CrediExpress
2. Copiar configuración de Firebase
3. Crear función para guardar leads
4. Llamarla al confirmar datos

### 2. Configurar Autenticación (Opcional)

Para proteger el CRM:
1. Firebase → Authentication → Email/Password
2. Crear usuarios
3. Implementar login en el CRM

### 3. Mejorar Seguridad

Actualizar reglas de Firebase:
```javascript
// Solo permitir lectura/escritura autenticada
allow read, write: if request.auth != null;
```

---

## 📞 Soporte

Si tienes problemas con el deploy:

1. **Logs de Vercel:** Dashboard → Deployment → Logs
2. **Logs de Firebase:** Firebase Console → Functions → Logs
3. **Consola del navegador:** F12 → Console

---

## ✅ Checklist de Deploy

- [ ] Código compilando sin errores (`npm run build`)
- [ ] Subido a GitHub (`git push`)
- [ ] Conectado con Vercel
- [ ] Variables de entorno configuradas
- [ ] Firestore habilitado en Firebase
- [ ] Reglas de Firebase configuradas
- [ ] Deploy exitoso
- [ ] CRM funcionando en la URL de Vercel
- [ ] Probado crear un lead
- [ ] Lead guardado en Firebase

---

**¡Listo para deployar!** 🚀

Ejecuta:
```bash
git add .
git commit -m "Ready for deploy"
git push
```

Y luego conéctalo con Vercel desde https://vercel.com/new
