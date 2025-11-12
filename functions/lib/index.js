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
var _a, _b, _c, _d;
Object.defineProperty(exports, "__esModule", { value: true });
exports.setAdminRole = exports.createUser = exports.onNewApplication = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const twilio_1 = __importDefault(require("twilio"));
const mail_1 = __importDefault(require("@sendgrid/mail"));
// Inicializar Firebase Admin
admin.initializeApp();
// Twilio configuration - usar variables de entorno o configuración de Firebase
const accountSid = process.env.TWILIO_ACCOUNT_SID || ((_a = functions.config().twilio) === null || _a === void 0 ? void 0 : _a.account_sid);
const authToken = process.env.TWILIO_AUTH_TOKEN || ((_b = functions.config().twilio) === null || _b === void 0 ? void 0 : _b.auth_token);
const twilioPhone = process.env.TWILIO_WHATSAPP_FROM || '+14155238886';
const twilioClient = (0, twilio_1.default)(accountSid, authToken);
// SendGrid configuration
const sendGridApiKey = process.env.SENDGRID_API_KEY || ((_c = functions.config().sendgrid) === null || _c === void 0 ? void 0 : _c.api_key);
const fromEmail = process.env.SENDGRID_FROM_EMAIL || ((_d = functions.config().sendgrid) === null || _d === void 0 ? void 0 : _d.from_email) || 'notificaciones@originarsa.com';
mail_1.default.setApiKey(sendGridApiKey);
// 📱 Función para enviar WhatsApp
const sendWhatsApp = async (to, message) => {
    try {
        // Formatear número ecuatoriano: 0984462977 → +593984462977
        let phoneNumber = to.replace(/^0/, '593'); // Remover 0 inicial
        if (!phoneNumber.startsWith('593') && !phoneNumber.startsWith('+')) {
            phoneNumber = '593' + phoneNumber;
        }
        if (!phoneNumber.startsWith('+')) {
            phoneNumber = '+' + phoneNumber;
        }
        console.log(`📱 Enviando WhatsApp a: ${phoneNumber}`);
        const result = await twilioClient.messages.create({
            body: message,
            from: `whatsapp:${twilioPhone}`,
            to: `whatsapp:${phoneNumber}`
        });
        console.log(`✅ WhatsApp enviado exitosamente. SID: ${result.sid}`);
        return result;
    }
    catch (error) {
        console.error(`❌ Error enviando WhatsApp:`, error);
        throw error;
    }
};
// 📧 Función para enviar Email
const sendEmail = async (to, subject, htmlContent, textContent) => {
    try {
        console.log(`📧 Enviando email a: ${to}`);
        const msg = {
            to: to,
            from: fromEmail,
            subject: subject,
            text: textContent,
            html: htmlContent,
        };
        const result = await mail_1.default.send(msg);
        console.log(`✅ Email enviado exitosamente. Status: ${result[0].statusCode}`);
        return result;
    }
    catch (error) {
        console.error(`❌ Error enviando email:`, error);
        throw error;
    }
};
// 🎨 Template de email HTML
const getEmailHtml = (applicant, vehicleAmount, status) => {
    const nombre = applicant.fullName.split(' ')[0];
    const monto = new Intl.NumberFormat('es-EC', {
        style: 'currency',
        currency: 'USD'
    }).format(vehicleAmount);
    const logoUrl = 'https://firebasestorage.googleapis.com/v0/b/originarsa-crm.appspot.com/o/logos%2Foriginarsa-logo.png?alt=media';
    if (status === "approved") {
        return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; margin-bottom: 30px; }
    .logo { max-width: 200px; height: auto; }
    .status-approved { background-color: #d4edda; color: #155724; padding: 15px; border-radius: 8px; text-align: center; font-weight: bold; }
    .details { background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .footer { text-align: center; margin-top: 30px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="${logoUrl}" alt="Originarsa" class="logo">
      <h1>🎉 ¡Felicitaciones ${nombre}!</h1>
    </div>
    
    <div class="status-approved">
      Tu crédito vehicular ha sido APROBADO
    </div>
    
    <div class="details">
      <h3>📋 Detalles de tu crédito:</h3>
      <ul>
        <li><strong>Monto aprobado:</strong> ${monto}</li>
        <li><strong>Estado:</strong> Aprobado ✅</li>
      </ul>
    </div>
    
    <p>🚗 Nuestro equipo te contactará pronto para coordinar la entrega de tu vehículo.</p>
    
    <p>¡Gracias por confiar en Originarsa!</p>
    
    <div class="footer">
      <p><strong>Equipo Originarsa</strong> 🚗</p>
      <p>📞 0984462977</p>
    </div>
  </div>
</body>
</html>`;
    }
    else if (status === "rejected") {
        return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; margin-bottom: 30px; }
    .logo { max-width: 200px; height: auto; }
    .status-rejected { background-color: #f8d7da; color: #721c24; padding: 15px; border-radius: 8px; text-align: center; }
    .footer { text-align: center; margin-top: 30px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="${logoUrl}" alt="Originarsa" class="logo">
      <h1>Hola ${nombre} 👋</h1>
    </div>
    
    <div class="status-rejected">
      Lamentamos informarte que tu solicitud de crédito por ${monto} no pudo ser aprobada en esta ocasión.
    </div>
    
    <p>💡 Te invitamos a contactarnos para explorar otras opciones que se adapten mejor a tu perfil.</p>
    
    <div class="footer">
      <p><strong>Equipo Originarsa</strong> 🚗</p>
      <p>📞 0984462977</p>
    </div>
  </div>
</body>
</html>`;
    }
    else {
        return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; margin-bottom: 30px; }
    .logo { max-width: 200px; height: auto; }
    .status-pending { background-color: #fff3cd; color: #856404; padding: 15px; border-radius: 8px; text-align: center; }
    .details { background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .footer { text-align: center; margin-top: 30px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="${logoUrl}" alt="Originarsa" class="logo">
      <h1>Hola ${nombre} 👋</h1>
    </div>
    
    <p>¡Gracias por tu solicitud de crédito vehicular!</p>
    
    <div class="details">
      <h3>📋 Detalles recibidos:</h3>
      <ul>
        <li><strong>Monto solicitado:</strong> ${monto}</li>
        <li><strong>Estado:</strong> En evaluación ⏳</li>
      </ul>
    </div>
    
    <div class="status-pending">
      Estamos revisando tu información y te contactaremos pronto
    </div>
    
    <p>⏱️ <strong>Tiempo estimado de respuesta:</strong> 24-48 horas</p>
    
    <div class="footer">
      <p><strong>Equipo Originarsa</strong> 🚗</p>
      <p>📞 0984462977</p>
    </div>
  </div>
</body>
</html>`;
    }
};
// 🎨 Template texto plano del email
const getEmailText = (applicant, vehicleAmount, status) => {
    const nombre = applicant.fullName.split(' ')[0];
    const monto = new Intl.NumberFormat('es-EC', {
        style: 'currency',
        currency: 'USD'
    }).format(vehicleAmount);
    if (status === "approved") {
        return `¡Felicitaciones ${nombre}!

Tu crédito vehicular por ${monto} ha sido APROBADO.

Detalles de tu crédito:
• Monto aprobado: ${monto}
• Estado: Aprobado

Nuestro equipo te contactará pronto para coordinar la entrega de tu vehículo.

¡Gracias por confiar en Originarsa!

Equipo Originarsa
Teléfono: 0984462977`;
    }
    else if (status === "rejected") {
        return `Hola ${nombre}

Lamentamos informarte que tu solicitud de crédito por ${monto} no pudo ser aprobada en esta ocasión.

Te invitamos a contactarnos para explorar otras opciones que se adapten mejor a tu perfil.

Equipo Originarsa
Teléfono: 0984462977`;
    }
    else {
        return `Hola ${nombre}

¡Gracias por tu solicitud de crédito vehicular!

Detalles recibidos:
• Monto solicitado: ${monto}
• Estado: En evaluación

Estamos revisando tu información y te contactaremos pronto.

Tiempo estimado de respuesta: 24-48 horas

Equipo Originarsa
Teléfono: 0984462977`;
    }
};
// 🎨 Función para generar subject del email
const getEmailSubject = (status, applicant) => {
    const nombre = applicant.fullName.split(' ')[0];
    if (status === "approved") {
        return `🎉 ${nombre}, tu crédito vehicular ha sido APROBADO - Originarsa`;
    }
    else if (status === "rejected") {
        return `Actualización de tu solicitud de crédito - Originarsa`;
    }
    else {
        return `${nombre}, hemos recibido tu solicitud de crédito - Originarsa`;
    }
};
// 🎨 Template de mensaje WhatsApp
const getWhatsAppMessage = (applicant, vehicleAmount, status) => {
    const nombre = applicant.fullName.split(' ')[0]; // Solo primer nombre
    const monto = new Intl.NumberFormat('es-EC', {
        style: 'currency',
        currency: 'USD'
    }).format(vehicleAmount);
    if (status === "approved") {
        return `🎉 ¡Felicitaciones ${nombre}!

Tu crédito vehicular por ${monto} ha sido *APROBADO*.

📋 Detalles de tu crédito:
• Monto aprobado: ${monto}
• Estado: Aprobado ✅

🚗 Nuestro equipo te contactará pronto para coordinar la entrega de tu vehículo.

¡Gracias por confiar en Originarsa!

*Equipo Originarsa* 🚗
📞 0984462977`;
    }
    else if (status === "rejected") {
        return `Hola ${nombre} 👋

Lamentamos informarte que tu solicitud de crédito por ${monto} no pudo ser aprobada en esta ocasión.

💡 Te invitamos a contactarnos para explorar otras opciones que se adapten mejor a tu perfil.

*Equipo Originarsa* 🚗
📞 0984462977`;
    }
    else {
        // Estado pending o nuevo
        return `Hola ${nombre} 👋

¡Gracias por tu solicitud de crédito vehicular!

📋 Detalles recibidos:
• Monto solicitado: ${monto}
• Estado: En evaluación ⏳

Estamos revisando tu información y te contactaremos pronto.

⏱️ Tiempo estimado de respuesta: 24-48 horas

*Equipo Originarsa* 🚗
📞 0984462977`;
    }
};
// 🔥 CLOUD FUNCTION v1: Trigger cuando se crea una nueva aplicación
exports.onNewApplication = functions.firestore
    .document('applications/{applicationId}')
    .onCreate(async (snapshot, context) => {
    const applicationId = context.params.applicationId;
    const application = snapshot.data();
    console.log(`🔥 Nueva aplicación creada: ${applicationId}`);
    try {
        // Validar que tengamos los datos necesarios
        if (!application) {
            console.error("❌ No hay datos de aplicación");
            return;
        }
        const { applicant, vehicleAmount, status } = application;
        if (!applicant || !applicant.fullName || !applicant.phone) {
            console.error("❌ Datos de aplicante incompletos:", applicant);
            return;
        }
        console.log(`��📱 Preparando notificaciones para ${applicant.fullName} (${applicant.phone}, ${applicant.email})`);
        const currentStatus = status || 'pending';
        // Generar mensaje WhatsApp
        const whatsappMessage = getWhatsAppMessage(applicant, vehicleAmount, currentStatus);
        // Generar contenido del email
        const emailSubject = getEmailSubject(currentStatus, applicant);
        const emailHtml = getEmailHtml(applicant, vehicleAmount, currentStatus);
        const emailText = getEmailText(applicant, vehicleAmount, currentStatus);
        // Enviar WhatsApp y Email en paralelo
        const promises = [];
        // WhatsApp
        promises.push(sendWhatsApp(applicant.phone, whatsappMessage)
            .then(() => console.log(`✅ WhatsApp enviado a ${applicant.fullName}`))
            .catch((error) => console.error(`❌ Error WhatsApp:`, error)));
        // Email (solo si tiene email válido)
        if (applicant.email && applicant.email.includes('@')) {
            promises.push(sendEmail(applicant.email, emailSubject, emailHtml, emailText)
                .then(() => console.log(`✅ Email enviado a ${applicant.fullName}`))
                .catch((error) => console.error(`❌ Error Email:`, error)));
        }
        // Ejecutar ambas notificaciones
        await Promise.allSettled(promises);
        console.log(`🎉 Notificaciones procesadas para ${applicant.fullName}`);
    }
    catch (error) {
        console.error(`❌ Error procesando nueva aplicación:`, error);
    }
});
// 🔐 Función para crear usuarios con roles (solo admins pueden llamar)
exports.createUser = functions.https.onCall(async (data, context) => {
    var _a;
    // Verificar que el usuario esté autenticado
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Debes estar autenticado para crear usuarios');
    }
    // Verificar que el usuario que llama sea admin
    const callerUid = context.auth.uid;
    const callerUser = await admin.auth().getUser(callerUid);
    const isAdmin = ((_a = callerUser.customClaims) === null || _a === void 0 ? void 0 : _a.admin) === true;
    if (!isAdmin) {
        throw new functions.https.HttpsError('permission-denied', 'Solo los administradores pueden crear usuarios');
    }
    // Validar datos requeridos
    const { email, password, role, displayName } = data;
    if (!email || !password || !role || !displayName) {
        throw new functions.https.HttpsError('invalid-argument', 'Email, password, role y displayName son requeridos');
    }
    if (!['admin', 'vendedor'].includes(role)) {
        throw new functions.https.HttpsError('invalid-argument', 'Role debe ser "admin" o "vendedor"');
    }
    try {
        // Crear usuario en Firebase Auth
        const userRecord = await admin.auth().createUser({
            email: email,
            password: password,
            displayName: displayName,
            emailVerified: false
        });
        // Asignar custom claims según el rol
        await admin.auth().setCustomUserClaims(userRecord.uid, {
            admin: role === 'admin',
            vendedor: role === 'vendedor'
        });
        console.log(`✅ Usuario creado: ${email} (${role})`);
        return {
            success: true,
            uid: userRecord.uid,
            message: `Usuario ${email} creado exitosamente como ${role}`
        };
    }
    catch (error) {
        console.error('❌ Error creando usuario:', error);
        // Mapear errores comunes
        if (error.code === 'auth/email-already-exists') {
            throw new functions.https.HttpsError('already-exists', 'Ya existe un usuario con este email');
        }
        throw new functions.https.HttpsError('internal', error.message);
    }
});
// 🔐 Función para asignar rol de admin manualmente (ejecutar desde Firebase Console)
exports.setAdminRole = functions.https.onCall(async (data, context) => {
    const { email } = data;
    if (!email) {
        throw new functions.https.HttpsError('invalid-argument', 'Email es requerido');
    }
    try {
        const user = await admin.auth().getUserByEmail(email);
        await admin.auth().setCustomUserClaims(user.uid, { admin: true, vendedor: false });
        console.log(`✅ Rol de admin asignado a: ${email}`);
        return {
            success: true,
            message: `Rol de admin asignado a ${email}`
        };
    }
    catch (error) {
        console.error('❌ Error asignando rol:', error);
        throw new functions.https.HttpsError('internal', error.message);
    }
});
//# sourceMappingURL=index.js.map