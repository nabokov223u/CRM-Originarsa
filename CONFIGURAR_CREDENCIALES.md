# Configurar credenciales en Firebase Functions

Para configurar las credenciales de forma segura en Firebase Functions, ejecuta estos comandos:

## 1. Configurar Twilio
```bash
firebase functions:config:set twilio.account_sid="TU_ACCOUNT_SID" twilio.auth_token="TU_AUTH_TOKEN"
```

## 2. Configurar SendGrid  
```bash
firebase functions:config:set sendgrid.api_key="TU_SENDGRID_API_KEY" sendgrid.from_email="paulestia@originarsa.com"
```

## 3. Desplegar las funciones
```bash
firebase deploy --only functions
```

## Alternativa: Usar archivo .env local para testing

1. Crea el archivo `functions/.env` (no se subirá a Git):
```
TWILIO_ACCOUNT_SID=ACdae96b0d1f7bf95b79e0bac15f21ce45
TWILIO_AUTH_TOKEN=16021a395b34324c9b37c7f738194e6e
TWILIO_WHATSAPP_FROM=+14155238886
SENDGRID_API_KEY=tu_api_key
SENDGRID_FROM_EMAIL=paulestia@originarsa.com
```

2. Las funciones leerán automáticamente estas variables en desarrollo local
