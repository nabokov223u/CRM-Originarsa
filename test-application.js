// Test script para probar WhatsApp + Email automático
const admin = require('firebase-admin');

// Inicializar Firebase Admin
const serviceAccount = require('./originarsa-crm-firebase-adminsdk-42gke-3de4e0dd89.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function createTestApplication() {
  try {
    console.log('🧪 Creando aplicación de prueba...');
    
    const testApplication = {
      applicant: {
        fullName: "María García Pérez",
        email: "paulestia@originarsa.com", // Tu email verificado
        phone: "0984462977",
        idNumber: "1234567890",
        maritalStatus: "single"
      },
      vehicleAmount: 25000,
      status: "pending",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      testNote: "Aplicación creada para probar WhatsApp + Email automático"
    };
    
    const docRef = await db.collection('applications').add(testApplication);
    console.log('✅ Aplicación de prueba creada con ID:', docRef.id);
    console.log('📧📱 Deberías recibir WhatsApp y Email automáticamente');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createTestApplication();