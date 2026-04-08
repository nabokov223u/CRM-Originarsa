// Estados del pipeline de ventas
export type LeadStatus = 
  | "Por Facturar"     // Lead listo para facturar
  | "Facturado"       // Factura emitida
  | "Seguimiento"     // En seguimiento activo
  | "Caido"           // Lead perdido/caído
  | "No Contactado";  // No se ha logrado contactar

// Etiquetas por estado del pipeline
export const ETIQUETAS_POR_ESTADO: Record<string, string[]> = {
  'Seguimiento': ['Condiciones', 'Inventario'],
  'Caido': ['Contado', 'Cotización', 'Competencia'],
  'No Contactado': ['Inubicable', 'Seguimiento'],
};

// Prioridad del lead
export type LeadPriority = "Alta" | "Media" | "Baja";

// Fuentes de leads
export type LeadSource = "CrediExpress" | "Aprobados no Facturados" | "Web" | "Referido" | "Redes Sociales" | "Llamada" | "Otro" | string;

export interface Lead {
  id: string;
  
  // ===== DATOS DEL CLIENTE (desde CrediExpress) =====
  fullName: string;        // Nombre completo
  email: string;
  phone: string;
  idNumber: string;        // Cédula
  maritalStatus?: string;
  
  // ===== DATOS DEL CRÉDITO (desde CrediExpress) =====
  vehicleAmount: number;   // Monto del vehículo
  downPaymentPct?: number; // Porcentaje de entrada
  termMonths?: number;     // Plazo en meses
  creditScore?: number;    // Score del algoritmo de CrediExpress
  
  // ===== ESTADOS DEL CRM =====
  status: LeadStatus;
  prioridad: LeadPriority;
  fuente: LeadSource;
  
  // ===== GESTIÓN COMERCIAL =====
  asignadoA?: string;           // ID o nombre del asesor
  vehiculoInteres?: string;     // Modelo que le interesa
  observaciones?: string;       // Notas del asesor
  
  // ===== TRACKING =====
  fechaCreacion: string;
  fechaUltimoContacto?: string;
  proximaAccion?: {
    tipo: "Llamada" | "Reunión" | "Email" | "WhatsApp";
    fecha: string;
    descripcion: string;
  };
  
  // ===== ORIGEN Y ASESOR =====
  origen?: string;              // Origen del lead (CrediExpress, Facebook Ads, Google Ads, n8n campaign, etc.)
  asesor?: string;              // Asesor a cargo del lead
  
  // ===== ETIQUETA DE ESTADO =====
  etiqueta?: string;            // Etiqueta/tag dentro del estado (ej: Condiciones, Inventario)
  ultimaNota?: string;          // Última nota escrita por el asesor
  
  // ===== RESULTADO =====
  motivoPerdida?: string;       // Si status = "Caido"
  fechaCierre?: string;         // Si status = "Facturado"
  montoFinal?: number;          // Monto final del cierre
  
  // ===== CAMPOS DE FIREBASE =====
  createdAt?: any;
  updatedAt?: any;
  
  // ===== CAMPOS DEPRECATED (compatibilidad) =====
  nombres?: string;
  apellidos?: string;
  telefono?: string;
  cedula?: string;
  presupuesto?: number;
  modelo?: string;
  notas?: string;
  ultimaInteraccion?: string;
}

export interface Cliente {
  id: string;
  nombres: string;
  apellidos: string;
  telefono: string;
  email: string;
  cedula: string;
  direccion?: string;
  fechaRegistro: string;
  vehiculosComprados: number;
  valorTotal: number;
  ultimaCompra?: string;
}

export interface Actividad {
  id: string;
  leadId: string;                    // Lead asociado
  tipo: "Llamada" | "Reunión" | "Email" | "WhatsApp" | "Nota" | "Tarea" | "Cambio de Estado";
  titulo: string;
  descripcion: string;
  fecha: string;
  userId?: string;                   // Usuario que creó la actividad
  userName?: string;                 // Nombre del usuario
  completada?: boolean;
  metadata?: {                       // Datos adicionales según el tipo
    estadoAnterior?: LeadStatus;
    estadoNuevo?: LeadStatus;
    duracionLlamada?: number;        // en minutos
    archivoAdjunto?: string;
  };
  createdAt?: any;
}

// Interfaz para usuarios/asesores
export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  rol: "asesor" | "gerente" | "admin";
  activo: boolean;
  leadsAsignados?: string[];         // IDs de leads
  metaMensual?: number;              // Meta de ventas
  createdAt?: any;
}

// Estadísticas del pipeline
export interface PipelineStats {
  totalLeads: number;
  porEstado: Record<LeadStatus, number>;
  tasaConversion: number;
  promedioTiempoCierre: number;      // en días
  valorTotalPipeline: number;
}

export interface Estadistica {
  label: string;
  valor: number | string;
  cambio?: number;
  icon: string;
}

export interface Vehiculo {
  id: string;
  marca: string;
  modelo: string;
  año: number;
  precio: number;
  stock: number;
  imagen?: string;
}
