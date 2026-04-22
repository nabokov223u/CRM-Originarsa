import type { Application } from '../services/firestore/applications';
import type { Lead } from './types';
import { DEFAULT_LEAD_STATUS, normalizeLeadStatus } from './leadStatus';

// Función para convertir una Application de CrediExpress a Lead del CRM
export function convertApplicationToLead(application: Application): Omit<Lead, 'id'> {
  // ✅ Estructura de datos corregida - usando applicant.* y status directo

  // Determinar el status basado en crmStatus si existe, sino mapear desde CrediExpress
  let status: Lead['status'] = DEFAULT_LEAD_STATUS;
  
  if (application.crmStatus) {
    // Si tiene un estado del CRM guardado, usarlo directamente
    status = normalizeLeadStatus(application.crmStatus, application.crmStatusVersion);
  } else if (application.status === 'rejected') {
    // Si fue rechazado en CrediExpress y no tiene crmStatus, marcarlo como Caido
    status = 'Caido';
  } else {
    // Todos los nuevos leads de CrediExpress empiezan en "Por Contactar"
    status = DEFAULT_LEAD_STATUS;
  }

  // Crear fecha de creación
  let fechaCreacion = new Date().toISOString();
  if (application.createdAt && application.createdAt.toDate) {
    fechaCreacion = application.createdAt.toDate().toISOString();
  }

  // Construir notas con información del crédito
  const notasArray = [];
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
    statusVersion: application.crmStatusVersion,
    prioridad: 'Media', // Todos empiezan en Media, el asesor puede cambiarla después
    fuente: application.origen || 'CrediExpress',
    fechaCreacion: fechaCreacion,
    fechaUltimoContacto: fechaCreacion,
    
    // Información del vehículo/préstamo
    vehicleAmount: application.loan.vehicleAmount || 0,
    downPaymentPct: application.loan.downPaymentPct,
    termMonths: application.loan.termMonths,
    creditScore: application.score, // Score del algoritmo de CrediExpress
    
    // Gestión comercial
    vehiculoInteres: 'Por definir',
    concesionario: application.concesionario,
    observaciones: notasArray.join('\n'),
    asignadoA: undefined, // Sin asignar inicialmente
    
    // Origen y asesor (usar valores de Firebase si existen)
    origen: application.origen || 'CrediExpress',
    asesor: application.asesor || 'Telemarketing',
    etiqueta: application.etiqueta,
    ultimaNota: application.ultimaNota,
    
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