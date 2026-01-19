# Integración WhatsApp Business API - Plan y Costos

## Resumen de Funcionamiento

El sistema conectará el CRM Originarsa directamente con la API de WhatsApp Cloud (Meta) para permitir:

1.  **Sincronización de Plantillas**: Las plantillas creadas en el Administrador de WhatsApp se verán reflejadas en el CRM.
2.  **Asignación de Estrategias**: Al crear una estrategia de tipo "Automática" o "Manual" en el módulo de Marketing, podrás seleccionar una plantilla aprobada.
3.  **Envío Masivo/Trigger**: Cuando un cliente entre en una fase (ej. "Mora Temprana"), el sistema disparará la plantilla correspondiente automáticamente.
4.  **Webhooks**: Recibiremos confirmación de entrega y lectura en tiempo real.

## Arquitectura Técnica

1.  **Cloud Functions (Backend)**:
    *   `getTemplates`: Consulta a Meta para listar plantillas aprobadas.
    *   `sendTemplateMessage`: Envía el mensaje real.
    *   `webhookWhatsApp`: Endpoint para recibir respuestas y estados de los mensajes.
2.  **Firestore (Base de Datos)**:
    *   Colección `whatsapp_logs`: Historial de cada mensaje enviado.

## Costos Estimados (Meta WhatsApp API)

WhatsApp cobra por **Conversaciones de 24 horas**, no por mensaje individual.

*   **Conversaciones de Marketing** (Promociones, ofertas, "Hola recupera tu cupo"):
    *   Aprox. **$0.07 - $0.10 USD** por conversación iniciada.
*   **Conversaciones de Utilidad** (Confirmaciones de pago, alertas de cuenta):
    *   Aprox. **$0.04 - $0.06 USD**.
*   **Conversaciones de Servicio** (El usuario escribe primero y nosotros respondemos):
    *   Aprox. **$0.03 - $0.05 USD** (Las primeras 1,000 de servicio al mes son gratis).

*Nota: Los precios varían según el país del destinatario (Ecuador, Latam, etc.).*

---

## LO QUE NECESITO DE TI

Para activar esto, necesito que consigas los siguientes datos desde [developers.facebook.com](https://developers.facebook.com/):

1.  **Phone Number ID** (Identificador del número de teléfono).
2.  **WhatsApp Business Account ID** (Identificador de la cuenta comercial).
3.  **Access Token Permanente** (Token de usuario del sistema, no el temporal de 24h).
4.  **Verify Token**: Una palabra clave inventada por nosotros para verificar el Webhook (ej: `originarsa_secure_2025`).
