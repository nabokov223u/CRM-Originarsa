# 🚀 GUÍA RÁPIDA: Conectar CrediExpress con CRM

## ✅ Lo que YA está listo en el CRM:

1. ✅ Endpoint API creado: `/api/crediexpress-webhook`
2. ✅ Transformación automática de datos
3. ✅ Guardado en Firebase
4. ✅ Configuración de Vercel

---

## 📋 PASOS PARA TI (En CrediExpress):

### **Paso 1: Deployar el CRM a Vercel** (5 minutos)

```bash
# En la carpeta de tu CRM
cd "C:\Users\paulestia\OneDrive - Originarsa\Documentos\CRM Originarsa"

# Instalar Vercel CLI si no lo tienes
npm install -g vercel

# Deploy
vercel

# Seguir las instrucciones:
# - Set up and deploy? Y
# - Which scope? Tu cuenta
# - Link to existing project? N
# - Project name? crm-originarsa
# - In which directory? ./ (dejar vacío)
# - Override settings? N
```

**Resultado:** Te dará una URL como `https://crm-originarsa.vercel.app`

---

### **Paso 2: Copiar el código a CrediExpress** (10 minutos)

Abre el archivo donde manejas el formulario de CrediExpress y agrega:

```typescript
// 1️⃣ AL INICIO DEL ARCHIVO (después de los imports)
const CRM_WEBHOOK_URL = 'https://crm-originarsa.vercel.app/api/crediexpress-webhook';

// 2️⃣ FUNCIÓN PARA ENVIAR AL CRM
async function enviarAlCRM(datos: any) {
  try {
    const response = await fetch(CRM_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos),
    });
    return await response.json();
  } catch (error) {
    console.error('Error enviando a CRM:', error);
    return { success: false };
  }
}

// 3️⃣ EN EL BOTÓN "Confirmar datos" (BUSCA ESTA LÍNEA EN TU CÓDIGO)
// Encuentra algo como: onClick={handleConfirmar} o similar
// Y AGREGA ESTO DENTRO:

async function handleConfirmar() {
  // ... tu código actual ...
  
  // 🚀 NUEVO: Enviar al CRM
  await enviarAlCRM({
    cedula: cedula,                    // Del primer formulario
    nombres: nombreCompleto,            // Del primer formulario
    telefono: telefono,                 // Del primer formulario
    email: email,                       // Del primer formulario
    estadoCivil: estadoCivil,          // "Soltero/a" o "Casado/a"
    montoVehiculo: montoVehiculo,      // Del slider
    entrada: entrada,                   // Calculado
    montoFinanciar: montoFinanciar,    // Calculado
    plazoMeses: plazoMeses,            // Del slider
    cuotaMensual: cuotaMensual,        // Calculado
  });
  
  // ... continúa con tu código normal ...
}
```

---

### **Paso 3: Reemplazar la URL del webhook**

En el código que acabas de copiar, encuentra:

```typescript
const CRM_WEBHOOK_URL = 'https://crm-originarsa.vercel.app/api/crediexpress-webhook';
```

Y reemplaza con la URL real que obtuviste en el Paso 1.

---

### **Paso 4: Probar**

1. Ve a tu CrediExpress: `https://tu-crediexpress.vercel.app`
2. Completa el formulario con estos datos de prueba:
   - Cédula: `0502854060`
   - Nombre: `García López María Fernanda`
   - Teléfono: `0984462977`
   - Email: `test@originarsa.com`
   - Estado civil: `Soltero/a`
3. Ajusta los sliders
4. Haz clic en **"Confirmo que estos datos son correctos"**
5. Abre la consola del navegador (F12) y busca: `✅ Lead enviado al CRM`

---

### **Paso 5: Verificar en el CRM**

1. Ve a tu CRM: `https://crm-originarsa.vercel.app`
2. Sección **"Leads"**
3. Deberías ver el nuevo lead con todos los datos

---

## 🔥 Ejemplo Completo Basado en tus Pantallas

```typescript
// Basado en la imagen 1 (Validación de identidad)
const datosFormulario1 = {
  cedula: '0502854060',
  nombreCompleto: 'García López María Fernanda',
  estadoCivil: 'Soltero/a',
  telefono: '0984462977',
  email: 'saynomore223u@gmail.com',
};

// Basado en la imagen 2 (Cotización)
const datosCotizacion = {
  montoVehiculo: 12500,
  entrada: 4250,        // 34% de 12500
  montoFinanciar: 8250,
  plazoMeses: 39,
  cuotaMensual: 306.66,
};

// Enviar al CRM cuando confirma
await enviarAlCRM({
  ...datosFormulario1,
  ...datosCotizacion,
});
```

---

## 📂 ¿Dónde está cada cosa?

### En el CRM (este proyecto):
- ✅ `api/crediexpress-webhook.ts` → Recibe los datos
- ✅ `src/services/firestore/leads.ts` → Guarda en Firebase
- ✅ `INTEGRACION_CREDIEXPRESS.md` → Documentación completa
- ✅ `CODIGO_PARA_CREDIEXPRESS.ts` → Ejemplos de código

### En CrediExpress (tu otro proyecto):
- ❓ Archivo del formulario → Agregar función `enviarAlCRM`
- ❓ Botón "Confirmar datos" → Llamar `enviarAlCRM`

---

## ❓ ¿No sabes dónde agregar el código en CrediExpress?

**Dime:**
1. ¿Qué framework usas? (Next.js, React, Vue, etc.)
2. ¿Cómo se llama el archivo principal del formulario?
3. ¿Puedes compartir el código del botón "Confirmar"?

Y te ayudo a integrarlo exactamente donde va. 🚀

---

## 🧪 Test Rápido (Sin modificar CrediExpress)

Prueba el webhook manualmente con curl:

```bash
curl -X POST https://crm-originarsa.vercel.app/api/crediexpress-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "cedula": "0502854060",
    "nombres": "García López María Fernanda",
    "telefono": "0984462977",
    "email": "test@originarsa.com",
    "estadoCivil": "Soltero/a",
    "montoVehiculo": 12500,
    "entrada": 4250,
    "montoFinanciar": 8250,
    "plazoMeses": 39,
    "cuotaMensual": 306.66
  }'
```

**Deberías ver:**
```json
{
  "success": true,
  "leadId": "abc123...",
  "message": "Lead creado exitosamente"
}
```

Luego verifica en:
- CRM → Sección Leads → Verás el nuevo lead
- Firebase Console → Firestore → Colección "leads"

---

## 🎯 Resultado Final

Cuando un cliente complete CrediExpress:

1. ✅ Se crea automáticamente en el CRM
2. ✅ Se guarda en Firebase (persiste para siempre)
3. ✅ Aparece en la sección "Leads"
4. ✅ Incluye toda la info de la cotización en las notas
5. ✅ Los vendedores pueden hacerle seguimiento

---

## 🆘 Ayuda

Si tienes problemas:
- 📧 Error 404: Verifica la URL del webhook
- 📧 Error 400: Faltan datos requeridos (cedula, nombres, telefono)
- 📧 Error 500: Revisa los logs en Vercel del CRM
- 📧 No aparece en CRM: Verifica que Firebase esté habilitado

**¿Necesitas ayuda específica con CrediExpress?** Comparte el código y te ayudo a integrarlo. 🚀
