import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import axios from "axios";

// Inicializar si no está inicializado en index.ts
if (admin.apps.length === 0) {
  admin.initializeApp();
}

const db = admin.firestore();

// CONFIGURACIÓN (Llenar con variables de entorno o config de Firebase)
// firebase functions:config:set whatsapp.token="EL_TOKEN" whatsapp.phone_id="EL_PHONE_ID"
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN || functions.config().whatsapp?.token;
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_ID || functions.config().whatsapp?.phone_id;
const VERSION = "v18.0";

/**
 * Obtiene las plantillas aprobadas desde Meta
 */
export const getWhatsAppTemplates = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Usuario no autenticado");
  }

  if (!WHATSAPP_TOKEN || !PHONE_NUMBER_ID) {
    throw new functions.https.HttpsError("failed-precondition", "Credenciales de WhatsApp no configuradas");
  }

  // Necesitamos el WABA ID (WhatsApp Business Account ID) para listar templates
  // A veces se puede inferir o pasar como config. Asumiremos que tenemos el WABA ID o usaremos el endpoint del teléfono si es posible (meta estructura: WABA -> Templates)
  const WABA_ID = process.env.WHATSAPP_ACCOUNT_ID || functions.config().whatsapp?.account_id;
  
  if (!WABA_ID) {
     throw new functions.https.HttpsError("failed-precondition", "Falta Account ID");
  }

  try {
    const response = await axios.get(
      `https://graph.facebook.com/${VERSION}/${WABA_ID}/message_templates`,
      {
        params: {
            status: "APPROVED",
            limit: 100
        },
        headers: { Authorization: `Bearer ${WHATSAPP_TOKEN}` },
      }
    );

    return { success: true, data: response.data.data };
  } catch (error: any) {
    console.error("Error fetching templates:", error.response?.data || error.message);
    throw new functions.https.HttpsError("internal", "Error al conectar con Meta API");
  }
});

/**
 * Envía un mensaje de plantilla
 * Data esperada: { phone: "593999999", templateName: "hello_world", language: "es", components: [...] }
 */
export const sendWhatsAppTemplate = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Usuario no autenticado");
  }

  const { phone, templateName, language = "es", components = [] } = data;

  if (!phone || !templateName) {
    throw new functions.https.HttpsError("invalid-argument", "Faltan datos requeridos (phone, templateName)");
  }

  try {
    const payload = {
      messaging_product: "whatsapp",
      to: phone,
      type: "template",
      template: {
        name: templateName,
        language: { code: language },
        components: components // Variables {{1}}, images, etc.
      }
    };

    const response = await axios.post(
      `https://graph.facebook.com/${VERSION}/${PHONE_NUMBER_ID}/messages`,
      payload,
      {
        headers: { 
            "Authorization": `Bearer ${WHATSAPP_TOKEN}`,
            "Content-Type": "application/json"
        },
      }
    );

    // Log en Firestore
    await db.collection("whatsapp_logs").add({
        to: phone,
        template: templateName,
        status: "sent", // Inicialmente enviado a Meta
        messageId: response.data.messages[0].id,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        triggeredBy: context.auth.uid
    });

    return { success: true, messageId: response.data.messages[0].id };

  } catch (error: any) {
    console.error("Error sending message:", error.response?.data || error.message);
    throw new functions.https.HttpsError("internal", "Error enviando mensaje WhatsApp: " + (error.response?.data?.error?.message || error.message));
  }
});

/**
 * Webhook para recibir estados (Sent, Delivered, Read)
 * Configurar en Meta dashboard con verify_token
 */
export const whatsappWebhook = functions.https.onRequest(async (req, res) => {
  const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || "originarsa_secure_2025";

  // Verificación del Webhook (GET)
  if (req.method === "GET") {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
    return;
  }

  // Recepción de Eventos (POST)
  if (req.method === "POST") {
    const body = req.body;
    
    // Procesar mensajes entrantes o estados
    if (body.object) {
        // Aquí procesaríamos los cambios de estado (statuses) o mensajes (messages)
        // Ejemplo simplificado: guardar payload crudo para debug
        // await db.collection('whatsapp_raw_events').add(body);
    }

    res.sendStatus(200);
  }
});
