"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.whatsappWebhook = exports.sendWhatsAppTemplate = exports.getWhatsAppTemplates = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const axios_1 = __importDefault(require("axios"));
// Inicializar si no está inicializado en index.ts
if (admin.apps.length === 0) {
    admin.initializeApp();
}
const db = admin.firestore();
// CONFIGURACIÓN (Llenar con variables de entorno o config de Firebase)
// firebase functions:config:set whatsapp.token="EL_TOKEN" whatsapp.phone_id="EL_PHONE_ID"
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN || ((_a = functions.config().whatsapp) === null || _a === void 0 ? void 0 : _a.token);
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_ID || ((_b = functions.config().whatsapp) === null || _b === void 0 ? void 0 : _b.phone_id);
const VERSION = "v18.0";
/**
 * Obtiene las plantillas aprobadas desde Meta
 */
exports.getWhatsAppTemplates = functions.https.onCall(async (data, context) => {
    var _a, _b;
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "Usuario no autenticado");
    }
    if (!WHATSAPP_TOKEN || !PHONE_NUMBER_ID) {
        throw new functions.https.HttpsError("failed-precondition", "Credenciales de WhatsApp no configuradas");
    }
    // Necesitamos el WABA ID (WhatsApp Business Account ID) para listar templates
    // A veces se puede inferir o pasar como config. Asumiremos que tenemos el WABA ID o usaremos el endpoint del teléfono si es posible (meta estructura: WABA -> Templates)
    const WABA_ID = process.env.WHATSAPP_ACCOUNT_ID || ((_a = functions.config().whatsapp) === null || _a === void 0 ? void 0 : _a.account_id);
    if (!WABA_ID) {
        throw new functions.https.HttpsError("failed-precondition", "Falta Account ID");
    }
    try {
        const response = await axios_1.default.get(`https://graph.facebook.com/${VERSION}/${WABA_ID}/message_templates`, {
            params: {
                status: "APPROVED",
                limit: 100
            },
            headers: { Authorization: `Bearer ${WHATSAPP_TOKEN}` },
        });
        return { success: true, data: response.data.data };
    }
    catch (error) {
        console.error("Error fetching templates:", ((_b = error.response) === null || _b === void 0 ? void 0 : _b.data) || error.message);
        throw new functions.https.HttpsError("internal", "Error al conectar con Meta API");
    }
});
/**
 * Envía un mensaje de plantilla
 * Data esperada: { phone: "593999999", templateName: "hello_world", language: "es", components: [...] }
 */
exports.sendWhatsAppTemplate = functions.https.onCall(async (data, context) => {
    var _a, _b, _c, _d;
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
        const response = await axios_1.default.post(`https://graph.facebook.com/${VERSION}/${PHONE_NUMBER_ID}/messages`, payload, {
            headers: {
                "Authorization": `Bearer ${WHATSAPP_TOKEN}`,
                "Content-Type": "application/json"
            },
        });
        // Log en Firestore
        await db.collection("whatsapp_logs").add({
            to: phone,
            template: templateName,
            status: "sent",
            messageId: response.data.messages[0].id,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            triggeredBy: context.auth.uid
        });
        return { success: true, messageId: response.data.messages[0].id };
    }
    catch (error) {
        console.error("Error sending message:", ((_a = error.response) === null || _a === void 0 ? void 0 : _a.data) || error.message);
        throw new functions.https.HttpsError("internal", "Error enviando mensaje WhatsApp: " + (((_d = (_c = (_b = error.response) === null || _b === void 0 ? void 0 : _b.data) === null || _c === void 0 ? void 0 : _c.error) === null || _d === void 0 ? void 0 : _d.message) || error.message));
    }
});
/**
 * Webhook para recibir estados (Sent, Delivered, Read)
 * Configurar en Meta dashboard con verify_token
 */
exports.whatsappWebhook = functions.https.onRequest(async (req, res) => {
    const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || "originarsa_secure_2025";
    // Verificación del Webhook (GET)
    if (req.method === "GET") {
        const mode = req.query["hub.mode"];
        const token = req.query["hub.verify_token"];
        const challenge = req.query["hub.challenge"];
        if (mode === "subscribe" && token === VERIFY_TOKEN) {
            res.status(200).send(challenge);
        }
        else {
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
//# sourceMappingURL=whatsapp.js.map