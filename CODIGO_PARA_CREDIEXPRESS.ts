/**
 * 📋 CÓDIGO PARA COPIAR Y PEGAR EN CREDIEXPRESS
 * 
 * Este archivo contiene el código que necesitas agregar a tu proyecto
 * de CrediExpress para enviar automáticamente los leads al CRM.
 */

// ============================================
// 1️⃣ CONFIGURACIÓN (Agregar al inicio del archivo)
// ============================================

const CRM_CONFIG = {
  // 🔗 Reemplaza con la URL de tu CRM desplegado en Vercel
  WEBHOOK_URL: 'https://tu-crm-originarsa.vercel.app/api/crediexpress-webhook',
  
  // 🔒 (Opcional) API Key para seguridad
  API_KEY: 'tu_clave_secreta_opcional',
};

// ============================================
// 2️⃣ FUNCIÓN PRINCIPAL (Agregar a tu código)
// ============================================

/**
 * Envía los datos del cliente y cotización al CRM
 * @param datosCliente - Información personal del cliente
 * @param datosCotizacion - Información de la cotización del vehículo
 * @returns Promise con el resultado del envío
 */
async function enviarLeadAlCRM(
  datosCliente: {
    cedula: string;
    nombre: string;
    telefono: string;
    email: string;
    estadoCivil: string;
  },
  datosCotizacion: {
    montoVehiculo: number;
    entrada: number;
    montoFinanciar: number;
    plazoMeses: number;
    cuotaMensual: number;
    vehiculo?: string;
  }
) {
  const payload = {
    // Datos del cliente
    cedula: datosCliente.cedula,
    nombres: datosCliente.nombre,
    telefono: datosCliente.telefono,
    email: datosCliente.email,
    estadoCivil: datosCliente.estadoCivil,
    
    // Datos de la cotización
    montoVehiculo: datosCotizacion.montoVehiculo,
    entrada: datosCotizacion.entrada,
    montoFinanciar: datosCotizacion.montoFinanciar,
    plazoMeses: datosCotizacion.plazoMeses,
    cuotaMensual: datosCotizacion.cuotaMensual,
    vehiculoInteres: datosCotizacion.vehiculo || 'No especificado',
  };

  try {
    const response = await fetch(CRM_CONFIG.WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Descomentar si usas API Key:
        // 'X-API-Key': CRM_CONFIG.API_KEY,
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Lead enviado al CRM exitosamente:', result.leadId);
      return { 
        success: true, 
        leadId: result.leadId,
        message: result.message 
      };
    } else {
      console.error('❌ Error al enviar lead al CRM:', result.error);
      return { 
        success: false, 
        error: result.error 
      };
    }
  } catch (error) {
    console.error('❌ Error de conexión con el CRM:', error);
    return { 
      success: false, 
      error: 'Error de conexión con el servidor' 
    };
  }
}

// ============================================
// 3️⃣ EJEMPLO DE USO EN TU COMPONENTE
// ============================================

// Opción A: React/Next.js con hooks
function CrediExpressComponent() {
  const [cedula, setCedula] = useState('');
  const [nombreCompleto, setNombreCompleto] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  const [estadoCivil, setEstadoCivil] = useState('Soltero/a');
  
  // Datos del slider
  const [montoVehiculo, setMontoVehiculo] = useState(12500);
  const [entradaPorcentaje, setEntradaPorcentaje] = useState(34);
  const [plazoMeses, setPlazoMeses] = useState(39);

  // Función que se ejecuta al confirmar datos
  const handleConfirmarDatos = async () => {
    // Calcular valores
    const entrada = (montoVehiculo * entradaPorcentaje) / 100;
    const montoFinanciar = montoVehiculo - entrada;
    const cuotaMensual = 306.66; // Tu cálculo actual

    // 🚀 ENVIAR AL CRM
    const resultadoCRM = await enviarLeadAlCRM(
      {
        cedula: cedula,
        nombre: nombreCompleto,
        telefono: telefono,
        email: email,
        estadoCivil: estadoCivil,
      },
      {
        montoVehiculo: montoVehiculo,
        entrada: entrada,
        montoFinanciar: montoFinanciar,
        plazoMeses: plazoMeses,
        cuotaMensual: cuotaMensual,
      }
    );

    if (resultadoCRM.success) {
      // ✅ Lead registrado exitosamente
      console.log('Cliente registrado en CRM con ID:', resultadoCRM.leadId);
      
      // Opcional: Mostrar mensaje al usuario
      // toast.success('¡Solicitud enviada exitosamente!');
    } else {
      // ❌ Hubo un error
      console.warn('No se pudo registrar en el CRM:', resultadoCRM.error);
      
      // Nota: Continúa con el flujo normal aunque falle el CRM
      // para no interrumpir la experiencia del usuario
    }

    // Continuar con tu flujo normal (mostrar cotización, etc.)
    mostrarPantallaCotizacion();
  };

  return (
    <div>
      {/* Tu formulario actual */}
      <button onClick={handleConfirmarDatos}>
        Confirmo que estos datos son correctos
      </button>
    </div>
  );
}

// ============================================
// 4️⃣ EJEMPLO SIMPLIFICADO (Un solo paso)
// ============================================

// Si quieres una función más simple:
async function enviarLeadSimple(formData: any) {
  try {
    const response = await fetch('https://tu-crm.vercel.app/api/crediexpress-webhook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cedula: formData.cedula,
        nombres: formData.nombreCompleto,
        telefono: formData.telefono,
        email: formData.email,
        estadoCivil: formData.estadoCivil,
        montoVehiculo: formData.montoVehiculo,
        entrada: formData.entrada,
        montoFinanciar: formData.montoFinanciar,
        plazoMeses: formData.plazoMeses,
        cuotaMensual: formData.cuotaMensual,
      }),
    });

    return await response.json();
  } catch (error) {
    console.error('Error:', error);
    return { success: false };
  }
}

// Uso:
// const resultado = await enviarLeadSimple(miFormulario);

// ============================================
// 5️⃣ EJEMPLO CON DATOS DE LA IMAGEN
// ============================================

// Basado en los datos de tu captura de pantalla:
const ejemploDatosCrediExpress = {
  // Pantalla 1: Validación de identidad
  cedula: '0502854060',
  nombreCompleto: 'García López María Fernanda',
  estadoCivil: 'Soltero/a',
  telefono: '0984462977',
  email: 'saynomore223u@gmail.com',
  
  // Pantalla 2: Cotización
  montoVehiculo: 12500,
  entradaPorcentaje: 34,
  entrada: 4250,
  montoFinanciar: 8250,
  plazoMeses: 39,
  cuotaMensual: 306.66,
};

// Enviar:
// await enviarLeadAlCRM(
//   {
//     cedula: ejemploDatosCrediExpress.cedula,
//     nombre: ejemploDatosCrediExpress.nombreCompleto,
//     telefono: ejemploDatosCrediExpress.telefono,
//     email: ejemploDatosCrediExpress.email,
//     estadoCivil: ejemploDatosCrediExpress.estadoCivil,
//   },
//   {
//     montoVehiculo: ejemploDatosCrediExpress.montoVehiculo,
//     entrada: ejemploDatosCrediExpress.entrada,
//     montoFinanciar: ejemploDatosCrediExpress.montoFinanciar,
//     plazoMeses: ejemploDatosCrediExpress.plazoMeses,
//     cuotaMensual: ejemploDatosCrediExpress.cuotaMensual,
//   }
// );

// ============================================
// 📋 CHECKLIST DE IMPLEMENTACIÓN
// ============================================

/*
  [ ] 1. Copiar la función enviarLeadAlCRM a tu proyecto
  [ ] 2. Reemplazar la URL del webhook con la de tu CRM
  [ ] 3. Encontrar el botón "Confirmar datos" en tu código
  [ ] 4. Agregar la llamada a enviarLeadAlCRM antes de continuar
  [ ] 5. Probar con datos reales
  [ ] 6. Verificar que el lead aparezca en el CRM
  [ ] 7. Verificar que el lead se guarde en Firebase
  [ ] 8. (Opcional) Agregar manejo de errores con toast/alert
*/

// ============================================
// 🧪 TESTING
// ============================================

// Función para probar el webhook manualmente:
async function testearWebhook() {
  const datosTest = {
    cedula: '0502854060',
    nombres: 'García López María Fernanda',
    telefono: '0984462977',
    email: 'saynomore223u@gmail.com',
    estadoCivil: 'Soltero/a',
    montoVehiculo: 12500,
    entrada: 4250,
    montoFinanciar: 8250,
    plazoMeses: 39,
    cuotaMensual: 306.66,
  };

  console.log('🧪 Probando webhook con datos de ejemplo...');
  
  const resultado = await fetch('https://tu-crm.vercel.app/api/crediexpress-webhook', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datosTest),
  });

  const respuesta = await resultado.json();
  console.log('📥 Respuesta del CRM:', respuesta);
}

// Ejecutar en la consola del navegador:
// testearWebhook();
