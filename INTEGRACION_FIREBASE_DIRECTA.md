# 🔥 Integración Directa CrediExpress → Firebase

## ✅ SOLUCIÓN SIMPLIFICADA (Sin API intermediaria)

En lugar de usar un endpoint API, CrediExpress escribirá **directamente a Firebase**. Esto es más simple, rápido y no requiere backend.

---

## 📋 PASO 1: Configurar Firebase en CrediExpress

### 1.1 Instalar Firebase en CrediExpress

```bash
# En tu proyecto de CrediExpress
npm install firebase
```

### 1.2 Crear archivo de configuración

Crea `src/lib/firebase.ts` en CrediExpress con esta configuración:

```typescript
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// MISMA configuración que en el CRM
const firebaseConfig = {
  apiKey: "AIzaSyAG3UNT7TX5fpZfeabTJA4LH_mUl8gQEHs",
  authDomain: "originarsa-crm.firebaseapp.com",
  projectId: "originarsa-crm",
  storageBucket: "originarsa-crm.firebasestorage.app",
  messagingSenderId: "1052053389441",
  appId: "1:1052053389441:web:520e5ff388e3ea82d3cd80"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
```

---

## 📋 PASO 2: Crear función para guardar leads

Crea `src/services/crm.ts` en CrediExpress:

```typescript
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { db } from "../lib/firebase";

interface DatosCrediExpress {
  cedula: string;
  nombres: string;
  telefono: string;
  email: string;
  estadoCivil: string;
  montoVehiculo: number;
  entrada: number;
  montoFinanciar: number;
  plazoMeses: number;
  cuotaMensual: number;
}

export async function enviarLeadAlCRM(datos: DatosCrediExpress) {
  try {
    // Dividir nombre completo
    const parts = datos.nombres.trim().split(' ');
    const nombres = parts.slice(0, 2).join(' ');
    const apellidos = parts.slice(2).join(' ') || parts[0];

    // Crear notas con info de cotización
    const notas = `
💰 Monto del vehículo: $${datos.montoVehiculo.toLocaleString()}
📥 Entrada (${Math.round((datos.entrada / datos.montoVehiculo) * 100)}%): $${datos.entrada.toLocaleString()}
🏦 A financiar: $${datos.montoFinanciar.toLocaleString()}
📅 Plazo: ${datos.plazoMeses} meses
💳 Cuota mensual estimada: $${datos.cuotaMensual.toFixed(2)}
👤 Estado civil: ${datos.estadoCivil}
🌐 Origen: CrediExpress Web
🕒 Fecha: ${new Date().toLocaleString('es-EC')}
    `.trim();

    // Guardar en Firebase (colección "leads")
    const docRef = await addDoc(collection(db, "leads"), {
      // Datos personales
      nombres,
      apellidos,
      cedula: datos.cedula,
      telefono: datos.telefono,
      email: datos.email,
      
      // Datos del vehículo
      modelo: 'No especificado',
      presupuesto: datos.montoVehiculo,
      
      // Notas con cotización
      notas,
      
      // Metadata
      status: 'Nuevo',
      fuente: 'Web',
      fechaCreacion: new Date().toISOString().split('T')[0],
      asignadoA: 'Sin asignar',
      
      // Timestamps de Firebase
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    console.log('✅ Lead guardado en CRM con ID:', docRef.id);
    
    return {
      success: true,
      leadId: docRef.id,
      message: 'Lead creado exitosamente en el CRM'
    };

  } catch (error) {
    console.error('❌ Error guardando lead en CRM:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    };
  }
}
```

---

## 📋 PASO 3: Usar en el formulario de CrediExpress

En el componente donde manejas el botón "Confirmar datos":

```typescript
import { enviarLeadAlCRM } from './services/crm';

// En tu función handleConfirmar o similar:
async function handleConfirmarDatos() {
  // ... validaciones ...

  // 🚀 Enviar al CRM
  const resultado = await enviarLeadAlCRM({
    cedula: cedula,
    nombres: nombreCompleto,
    telefono: telefono,
    email: email,
    estadoCivil: estadoCivil,
    montoVehiculo: montoVehiculo,
    entrada: entrada,
    montoFinanciar: montoFinanciar,
    plazoMeses: plazoMeses,
    cuotaMensual: cuotaMensual,
  });

  if (resultado.success) {
    console.log('✅ Cliente registrado en CRM:', resultado.leadId);
    // Opcional: Mostrar mensaje de éxito
  }

  // Continuar con tu flujo normal (mostrar cotización)
}
```

---

## 📋 PASO 4: Actualizar reglas de Firebase

En Firebase Console → Firestore → Reglas, asegúrate de tener:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /leads/{leadId} {
      // Permitir escritura desde CrediExpress
      allow create: if true;
      
      // Solo lectura/actualización desde CRM autenticado
      allow read, update, delete: if request.auth != null;
    }
    
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

---

## ✅ VENTAJAS de esta solución:

1. ✅ **Sin backend necesario** - Firebase maneja todo
2. ✅ **Más rápido** - Escritura directa, sin intermediarios
3. ✅ **Más simple** - Menos código que mantener
4. ✅ **Más seguro** - Reglas de Firebase controlan acceso
5. ✅ **Sin costos** - Todo en el plan gratuito
6. ✅ **Deploy fácil** - Solo frontend en Vercel

---

## 🧪 PRUEBA

```typescript
// En la consola del navegador de CrediExpress:
import { enviarLeadAlCRM } from './services/crm';

await enviarLeadAlCRM({
  cedula: '0502854060',
  nombres: 'García López María Fernanda',
  telefono: '0984462977',
  email: 'test@originarsa.com',
  estadoCivil: 'Soltero/a',
  montoVehiculo: 12500,
  entrada: 4250,
  montoFinanciar: 8250,
  plazoMeses: 39,
  cuotaMensual: 306.66,
});
```

Luego verifica:
1. Firebase Console → Firestore → Colección "leads"
2. CRM → Sección Leads

---

## 📦 Resumen de archivos en CrediExpress:

```
crediexpress/
├── src/
│   ├── lib/
│   │   └── firebase.ts          # ← CREAR
│   └── services/
│       └── crm.ts                # ← CREAR
└── tu-componente-formulario.tsx  # ← MODIFICAR
```

---

## 🚀 Deploy

### CRM (este proyecto):
```bash
vercel --prod
```

### CrediExpress:
```bash
# Agregar archivos
git add .
git commit -m "Integración con CRM via Firebase"
git push

# Si usas Vercel:
vercel --prod
```

---

## ⚡ Esta es la mejor solución porque:

- ❌ **NO necesitas** endpoint API
- ❌ **NO necesitas** servidor backend
- ❌ **NO necesitas** configurar CORS
- ✅ **SÍ funciona** desde el navegador
- ✅ **SÍ es seguro** con reglas de Firebase
- ✅ **SÍ es gratis** en el plan Spark

---

**¿Listo para implementar?** Dime si necesitas ayuda con algún paso específico. 🚀
