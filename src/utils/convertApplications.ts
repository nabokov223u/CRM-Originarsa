import type { Application } from '../services/firestore/applications';
import type { Lead } from './types';

// Función para convertir una Application de CrediExpress a Lead del CRM
export function convertApplicationToLead(application: Application): Omit<Lead, 'id'> {
  // ✅ Estructura de datos corregida - usando applicant.* y status directo

  // Determinar el status basado en el loan status
  let status: Lead['status'] = 'Nuevo';
  if (application.status === 'approved') {
    status = 'Calificado'; // Cambiado de 'Aprobado' a 'Calificado' para el nuevo flujo
  } else if (application.status === 'rejected') {
    status = 'Perdido';
  } else {
    status = 'Nuevo'; // pending o cualquier otro
  }

  // Crear fecha de creación
  let fechaCreacion = new Date().toISOString().split('T')[0];
  if (application.createdAt && application.createdAt.toDate) {
    fechaCreacion = application.createdAt.toDate().toISOString().split('T')[0];
  }

  // Construir notas con información del crédito
  const notasArray = [];
  notasArray.push(`🔥 LEAD DE CREDIEXPRESS`);
  if (application.loan.vehicleAmount) {
    notasArray.push(`💰 Monto vehículo: $${application.loan.vehicleAmount?.toLocaleString('es-CO')}`);
  }
  if (application.loan.downPaymentPct) {
    notasArray.push(`📊 Cuota inicial: ${(application.loan.downPaymentPct * 100).toFixed(1)}%`);
  }
  if (application.loan.termMonths) {
    notasArray.push(`� Plazo: ${application.loan.termMonths} meses`);
  }
  if (application.score) {
    notasArray.push(`⭐ Score: ${application.score}`);
  }
  if (application.creditLimit) {
    notasArray.push(`💳 Límite crédito: $${application.creditLimit.toLocaleString('es-CO')}`);
  }

  return {
    // Campos principales (formato CrediExpress)
    fullName: application.applicant.fullName || 'Sin nombre',
    email: application.applicant.email || 'Sin email',
    phone: application.applicant.phone || 'Sin teléfono',
    idNumber: application.applicant.idNumber || 'Sin cédula',
    maritalStatus: application.applicant.maritalStatus,
    
    // Campos del CRM - Estados del pipeline
    status: status,
    prioridad: application.status === 'approved' ? 'Alta' : 'Media', // Alta prioridad si está aprobado
    fuente: 'CrediExpress',
    fechaCreacion: fechaCreacion,
    fechaUltimoContacto: fechaCreacion,
    
    // Información del vehículo/préstamo
    vehicleAmount: application.loan.vehicleAmount || 0,
    downPaymentPct: application.loan.downPaymentPct,
    termMonths: application.loan.termMonths,
    creditScore: application.score, // Score del algoritmo de CrediExpress
    
    // Gestión comercial
    vehiculoInteres: 'Por definir',
    observaciones: notasArray.join('\n'),
    asignadoA: undefined, // Sin asignar inicialmente
    
    // Firebase
    createdAt: application.createdAt,
    updatedAt: application.updatedAt,
    
    // CAMPOS DEPRECATED (para compatibilidad)
    nombres: application.applicant.fullName ? application.applicant.fullName.split(' ').slice(0, 2).join(' ') : 'Sin nombres',
    apellidos: application.applicant.fullName ? application.applicant.fullName.split(' ').slice(2).join(' ') : 'Sin apellidos',
    telefono: application.applicant.phone,
    cedula: application.applicant.idNumber,
    presupuesto: application.loan.vehicleAmount,
    modelo: 'Por definir',
    notas: notasArray.join('\n'),
    ultimaInteraccion: fechaCreacion,
  };
}