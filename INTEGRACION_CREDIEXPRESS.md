# 🔗 Integración CrediExpress → CRM Originarsa

## 📋 Resumen
Esta integración permite que cuando un cliente complete el formulario de **CrediExpress**, automáticamente se cree un lead en el **CRM** y se guarde en **Firebase**.

---

## 🎯 Flujo de Datos

```
Usuario completa CrediExpress
           ↓
   Botón "Calificar para crédito"
           ↓
   Envía datos al CRM vía API
           ↓
   CRM crea lead en Firebase
           ↓
   Lead visible en el dashboard
```

---

## 🔧 Parte 1: Configurar el CRM (YA HECHO ✅)

### Archivos creados:
- ✅ `api/crediexpress-webhook.ts` - Endpoint que recibe datos
- ✅ `vercel.json` - Configuración para deployment

### Endpoint disponible:
```
POST https://tu-crm.vercel.app/api/crediexpress-webhook
```

---

## 🔧 Parte 2: Integrar en CrediExpress

### **Paso 1: Agregar función de envío al CRM**

En tu proyecto de **CrediExpress**, agrega esta función (en el archivo donde manejas el submit del formulario):

```typescript
// Función para enviar lead al CRM
async function enviarLeadAlCRM(datosCliente: any, datosCotizacion: any) {
  const CRM_WEBHOOK_URL = 'https://tu-crm-originarsa.vercel.app/api/crediexpress-webhook';
  
  const payload = {
    // Datos del cliente
    cedula: datosCliente.cedula,
    nombres: datosCliente.nombre, // Nombre completo
    telefono: datosCliente.telefono,
    email: datosCliente.correo || datosCliente.email,
    estadoCivil: datosCliente.estadoCivil,
    
    // Datos de la cotización
    montoVehiculo: datosCotizacion.montoVehiculo,
    entrada: datosCotizacion.entrada,
    montoFinanciar: datosCotizacion.montoFinanciar,
    plazoMeses: datosCotizacion.plazoMeses,
    cuotaMensual: datosCotizacion.cuotaMensual,
    
    // Vehículo de interés (si lo tienes)
    vehiculoInteres: datosCotizacion.vehiculo || 'No especificado',
  };

  try {
    const response = await fetch(CRM_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Lead enviado al CRM:', result.leadId);
      return { success: true, leadId: result.leadId };
    } else {
      console.error('❌ Error al enviar lead:', result.error);
      return { success: false, error: result.error };
    }
  } catch (error) {
    console.error('❌ Error de conexión con el CRM:', error);
    return { success: false, error: 'Error de conexión' };
  }
}
```

### **Paso 2: Llamar la función al confirmar datos**

Encuentra el código donde el usuario hace clic en **"Confirmo que estos datos son correctos"** y agrega:

```typescript
// En el manejador del botón de confirmación
async function handleConfirmarDatos() {
  // ... tu código actual para validar ...
  
  // NUEVO: Enviar al CRM
  const resultadoCRM = await enviarLeadAlCRM(
    {
      cedula: cedula,
      nombre: nombreCompleto,
      telefono: telefono,
      correo: correoElectronico,
      estadoCivil: estadoCivil, // "Soltero/a" o "Casado/a"
    },
    {
      montoVehiculo: montoVehiculo,
      entrada: entrada,
      montoFinanciar: montoAFinanciar,
      plazoMeses: plazo,
      cuotaMensual: cuotaMensual,
      vehiculo: vehiculoSeleccionado, // si tienes este dato
    }
  );

  if (resultadoCRM.success) {
    console.log('✅ Cliente registrado en CRM con ID:', resultadoCRM.leadId);
  }
  
  // ... continúa con tu flujo normal (mostrar cotización) ...
}
```

### **Paso 3: Ejemplo completo (React/Next.js)**

```typescript
'use client'; // Si estás en Next.js 13+ con App Router

import { useState } from 'react';

export default function CrediExpressForm() {
  const [cedula, setCedula] = useState('');
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [correo, setCorreo] = useState('');
  // ... otros estados ...

  const handleSubmit = async () => {
    // Validaciones...
    
    // Enviar al CRM
    const resultadoCRM = await fetch('https://tu-crm.vercel.app/api/crediexpress-webhook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cedula,
        nombres: nombre,
        telefono,
        email: correo,
        estadoCivil: estadoCivil,
        montoVehiculo: 12500, // del slider
        entrada: 4250,
        montoFinanciar: 8250,
        plazoMeses: 39,
        cuotaMensual: 306.66,
      }),
    });

    if (resultadoCRM.ok) {
      console.log('✅ Lead creado en CRM');
    }
    
    // Continuar con tu flujo normal
  };

  return (
    // ... tu JSX actual ...
  );
}
```

---

## 🔒 Seguridad (Recomendado)

### **Agregar API Key para mayor seguridad:**

1. En tu CRM, agrega una clave secreta al `.env`:
```bash
CREDIEXPRESS_API_KEY=tu_clave_super_secreta_12345
```

2. En CrediExpress, envía la clave en el header:
```typescript
headers: {
  'Content-Type': 'application/json',
  'X-API-Key': 'tu_clave_super_secreta_12345',
}
```

3. Valida en el webhook (modificar `api/crediexpress-webhook.ts`):
```typescript
// Al inicio del handler
const apiKey = req.headers['x-api-key'];
if (apiKey !== process.env.CREDIEXPRESS_API_KEY) {
  return res.status(401).json({ error: 'No autorizado' });
}
```

---

## 📊 Mapeo de Campos

| CrediExpress | CRM Lead | Notas |
|--------------|----------|-------|
| `cedula` | `cedula` | Identificador único |
| `nombre` completo | `nombres` + `apellidos` | Se divide automáticamente |
| `telefono` | `telefono` | - |
| `correo` | `email` | - |
| `estadoCivil` | `notas` | Se incluye en notas |
| `montoVehiculo` | `presupuesto` | - |
| Slider datos | `notas` | Entrada, plazo, cuota |

---

## 🧪 Pruebas

### **1. Probar el endpoint manualmente:**

Usa Postman o curl:

```bash
curl -X POST https://tu-crm.vercel.app/api/crediexpress-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "cedula": "0502854060",
    "nombres": "García López María Fernanda",
    "telefono": "0984462977",
    "email": "saynomore223u@gmail.com",
    "estadoCivil": "Soltero/a",
    "montoVehiculo": 12500,
    "entrada": 4250,
    "montoFinanciar": 8250,
    "plazoMeses": 39,
    "cuotaMensual": 306.66
  }'
```

**Respuesta esperada:**
```json
{
  "success": true,
  "leadId": "abc123xyz",
  "message": "Lead creado exitosamente"
}
```

### **2. Verificar en el CRM:**
1. Ve a tu CRM → Sección "Leads"
2. Deberías ver el nuevo lead con:
   - Nombre: García López (nombres) | María Fernanda (apellidos)
   - Cédula: 0502854060
   - Presupuesto: $12,500
   - Notas: Detalles de cotización

---

## 🚀 Deployment

### **Para el CRM:**
```bash
# En la carpeta del CRM
vercel deploy --prod
```

### **Para CrediExpress:**
```bash
# En la carpeta de CrediExpress
vercel deploy --prod
```

---

## 📋 Checklist de Implementación

- [ ] Deployar CRM a Vercel
- [ ] Copiar URL del CRM desplegado
- [ ] Agregar función `enviarLeadAlCRM` en CrediExpress
- [ ] Reemplazar `https://tu-crm.vercel.app` con la URL real
- [ ] Llamar la función al confirmar datos
- [ ] Probar con datos reales
- [ ] Verificar que aparezca en Firebase
- [ ] (Opcional) Agregar API Key para seguridad

---

## ⚠️ Solución de Problemas

### **El lead no aparece en el CRM:**
1. Abre la consola del navegador (F12) en CrediExpress
2. Busca errores en rojo
3. Verifica que la URL del webhook sea correcta
4. Confirma que Firebase esté habilitado

### **Error 405 Method Not Allowed:**
- Verifica que estés usando POST, no GET

### **Error 400 Bad Request:**
- Revisa que estés enviando `cedula`, `nombres` y `telefono`

### **Error 500 Internal Server Error:**
- Revisa los logs en Vercel del CRM
- Verifica que Firebase esté configurado correctamente

---

## 📞 Próximos Pasos

Después de implementar esto, podrías:
1. **Notificaciones por email** cuando llega un lead nuevo
2. **WhatsApp automático** al cliente
3. **Dashboard en tiempo real** para ver leads entrantes
4. **Asignación automática** a vendedores

---

**¿Necesitas ayuda para implementar esto en CrediExpress?** Dame acceso al código o dime qué framework estás usando (React, Next.js, Vue, etc.) y te ayudo a integrarlo. 🚀
