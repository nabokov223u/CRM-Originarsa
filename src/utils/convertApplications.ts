import type { Application } from '../services/firestore/applications';
import type { Lead } from './types';
import { getApplicationCampaign } from './campaigns';
import { DEFAULT_LEAD_STATUS, normalizeLeadStatus } from './leadStatus';

const ECUADOR_OFFSET = '-05:00';

function padDatePart(value: number, length = 2): string {
  return String(value).padStart(length, '0');
}

function getApplicationCreatedAtDate(value: Application['createdAt']): Date | null {
  if (value && typeof value === 'object' && 'toDate' in value && typeof (value as { toDate?: unknown }).toDate === 'function') {
    const date = (value as { toDate: () => Date }).toDate();
    return Number.isNaN(date.getTime()) ? null : date;
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  if (typeof value === 'string') {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  return null;
}

function normalizeApplicationCreatedAt(
  value: Application['createdAt'],
  preserveWallClockTime: boolean,
): { createdAt: Date; fechaCreacion: string } {
  const rawDate = getApplicationCreatedAtDate(value) ?? new Date();

  if (!preserveWallClockTime) {
    return {
      createdAt: rawDate,
      fechaCreacion: rawDate.toISOString(),
    };
  }

  // Las applications llegan con el reloj correcto en createdAt, pero al interpretarlas
  // como UTC y luego formatearlas en Ecuador se restan 5 horas. Reconstituimos la
  // fecha como hora local de Ecuador para preservar el wall-clock del origen.
  const fechaCreacion = `${rawDate.getUTCFullYear()}-${padDatePart(rawDate.getUTCMonth() + 1)}-${padDatePart(rawDate.getUTCDate())}T${padDatePart(rawDate.getUTCHours())}:${padDatePart(rawDate.getUTCMinutes())}:${padDatePart(rawDate.getUTCSeconds())}.${padDatePart(rawDate.getUTCMilliseconds(), 3)}${ECUADOR_OFFSET}`;

  return {
    createdAt: new Date(fechaCreacion),
    fechaCreacion,
  };
}

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

  const shouldPreserveWallClockTime = getApplicationCampaign(application) !== 'CrediExpress';
  const normalizedCreatedAt = normalizeApplicationCreatedAt(application.createdAt, shouldPreserveWallClockTime);
  const fechaCreacion = normalizedCreatedAt.fechaCreacion;

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
    createdAt: normalizedCreatedAt.createdAt,
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