import { leadsService } from '../services/firestore/leads';

// Datos de ejemplo para probar Firebase
const leadsDeEjemplo: any[] = [
  {
    nombres: 'Juan Carlos',
    apellidos: 'Pérez González',
    telefono: '+57 300 123 4567',
    email: 'juan.perez@email.com',
    cedula: '12345678',
    modelo: 'Toyota Corolla',
    status: 'Nuevo',
    fuente: 'Web',
    fechaCreacion: '2025-11-10',
    presupuesto: 50000000,
    notas: 'Interesado en financiamiento',
    asignadoA: 'Vendedor 1',
  },
  {
    nombres: 'María Fernanda',
    apellidos: 'Rodríguez López',
    telefono: '+57 310 987 6543',
    email: 'maria.rodriguez@email.com',
    cedula: '87654321',
    modelo: 'Nissan Sentra',
    status: 'Contactado',
    fuente: 'Referido',
    fechaCreacion: '2025-11-09',
    ultimaInteraccion: '2025-11-10',
    presupuesto: 45000000,
    notas: 'Ya se contactó, pendiente de cita',
    asignadoA: 'Vendedor 2',
  },
  {
    nombres: 'Carlos Eduardo',
    apellidos: 'Martínez Silva',
    telefono: '+57 320 456 7890',
    email: 'carlos.martinez@email.com',
    cedula: '11223344',
    modelo: 'Chevrolet Onix',
    status: 'Calificado',
    fuente: 'Redes Sociales',
    fechaCreacion: '2025-11-08',
    ultimaInteraccion: '2025-11-10',
    presupuesto: 35000000,
    notas: 'Negociando precio final y forma de pago',
    asignadoA: 'Vendedor 1',
  }
];

export const insertarDatosDeEjemplo = async () => {
  console.log('🔄 Insertando datos de ejemplo en Firebase...');
  
  try {
    for (const lead of leadsDeEjemplo) {
      const id = await leadsService.create(lead);
      console.log(`✅ Lead creado: ${lead.nombres} ${lead.apellidos} (ID: ${id})`);
    }
    console.log('🎉 Todos los leads de ejemplo han sido creados exitosamente!');
  } catch (error) {
    console.error('❌ Error insertando datos de ejemplo:', error);
  }
};

// Para usar desde la consola del navegador:
// window.insertarDatosDeEjemplo = insertarDatosDeEjemplo;
(window as any).insertarDatosDeEjemplo = insertarDatosDeEjemplo;