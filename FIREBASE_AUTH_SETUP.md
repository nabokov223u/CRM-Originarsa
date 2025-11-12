# 🔐 Configuración de Firebase Authentication

## Paso 1: Habilitar Authentication en Firebase Console

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto **CRM Originarsa**
3. En el menú lateral, haz clic en **Authentication**
4. Haz clic en **Get Started** (si no lo has hecho)
5. Ve a la pestaña **Sign-in method**
6. Habilita **Email/Password**:
   - Clic en "Email/Password"
   - Toggle ON en "Enable"
   - Guardar

## Paso 2: Crear el Primer Usuario Administrador

### Opción A: Desde Firebase Console (Manual)

1. En **Authentication** → **Users**
2. Clic en **Add user**
3. Ingresa:
   - Email: `admin@originarsa.com` (o el que prefieras)
   - Password: (tu contraseña segura)
4. Clic en **Add user**

### Opción B: Desde tu código (Recomendado)

Ejecuta este código una sola vez en tu navegador (Consola de DevTools):

```javascript
// En la consola del navegador cuando estés en tu app
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';

const auth = getAuth();
createUserWithEmailAndPassword(auth, 'admin@originarsa.com', 'TuPassword123!')
  .then((userCredential) => {
    console.log('✅ Usuario creado:', userCredential.user.uid);
    console.log('Ahora ejecuta el Paso 3 con este UID');
  })
  .catch((error) => console.error('❌ Error:', error));
```

## Paso 3: Asignar Rol de Admin al Usuario

### Desde Firebase Functions (Terminal)

Una vez creado el usuario, asígnale el rol de admin:

```bash
# En la carpeta raíz del proyecto
firebase functions:shell
```

Luego ejecuta:

```javascript
setAdminRole({email: 'admin@originarsa.com'})
```

### Alternativa: Usando Firebase CLI directamente

```bash
firebase functions:call setAdminRole --data '{"email":"admin@originarsa.com"}'
```

## Paso 4: Verificar que Todo Funciona

1. Abre tu app en `http://localhost:5173`
2. Deberías ver la pantalla de login
3. Ingresa las credenciales del admin
4. Si todo está bien, verás el CRM completo
5. En el sidebar deberías ver la opción **"Usuarios"** (solo visible para admins)

## Paso 5: Crear Usuarios desde la Interfaz

Ahora que tienes acceso como admin:

1. Ve a **Usuarios** en el sidebar
2. Llena el formulario:
   - **Nombre Completo**: Juan Pérez
   - **Email**: juan@originarsa.com
   - **Contraseña**: Password123!
   - **Rol**: Vendedor o Admin
3. Clic en **Crear Usuario**

El usuario podrá iniciar sesión inmediatamente.

---

## 🔑 Roles y Permisos

### **Administrador**
- ✅ Acceso a Dashboard
- ✅ Acceso a Leads (ver y editar)
- ✅ Acceso a Clientes
- ✅ Acceso a Gestión de Usuarios
- ✅ Puede crear nuevos usuarios
- ✅ Puede asignar roles

### **Vendedor**
- ✅ Acceso a Dashboard
- ✅ Acceso a Leads (ver y editar)
- ❌ NO puede ver Gestión de Usuarios
- ❌ NO puede crear usuarios

---

## 🛠️ Troubleshooting

### "Error: auth/invalid-credential"
- Verifica que el email y password sean correctos
- El password debe tener al menos 6 caracteres

### "No puedo ver la opción Usuarios"
- Verifica que ejecutaste el Paso 3 correctamente
- Cierra sesión y vuelve a iniciar
- Revisa la consola del navegador (F12) para errores

### "Cloud Function createUser no existe"
- Asegúrate de haber desplegado las funciones:
  ```bash
  cd functions
  npm run build
  firebase deploy --only functions
  ```

### "No me redirige al login"
- Verifica que `App.tsx` esté usando `BrowserRouter` y `AuthProvider`
- Revisa la consola del navegador para errores

---

## 📧 Credenciales de Ejemplo (Solo para Testing)

**Admin:**
```
Email: admin@originarsa.com
Password: [La que configuraste]
```

**Vendedor:**
```
Email: vendedor@originarsa.com
Password: [Créalo desde la interfaz]
```

---

## 🚀 Próximos Pasos

Después de configurar autenticación:

1. ✅ **Testear en localhost** - Asegúrate de que todo funciona
2. ✅ **Crear usuarios de prueba** - Vendedores y admins
3. ✅ **Deployar a Vercel** - Seguir `DEPLOY_VERCEL.md`
4. 🔄 **Configurar dominio personalizado** (opcional)
5. 🔄 **Habilitar recuperación de contraseña** (futuro)

---

**¿Listo para deployar?** → Ve a `DEPLOY_VERCEL.md`
