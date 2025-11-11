export interface Lead {
  id: string;
  // Campos principales (compatibles con CrediExpress)
  fullName: string;        // Nombre completo (reemplaza nombres + apellidos)
  email: string;
  phone: string;          // telefono -> phone
  idNumber: string;       // cedula -> idNumber
  maritalStatus?: string; // Nuevo campo de CrediExpress
  
  // Campos del CRM
  status: "Nuevo" | "Contactado" | "Negociación" | "Aprobado" | "Perdido";
  fuente: "Web" | "Referido" | "Redes Sociales" | "Llamada" | "CrediExpress";
  fechaCreacion: string;
  ultimaInteraccion?: string;
  
  // Información del vehículo/préstamo
  vehicleAmount?: number;  // presupuesto -> vehicleAmount (compatible con CrediExpress)
  downPaymentPct?: number; // Porcentaje de cuota inicial
  termMonths?: number;     // Plazo en meses
  
  // Campos adicionales
  modelo?: string;
  notas?: string;
  asignadoA?: string;
  
  // Campos de Firebase
  createdAt?: any;
  updatedAt?: any;
  
  // CAMPOS DEPRECATED (mantener por compatibilidad temporal)
  nombres?: string;
  apellidos?: string;
  telefono?: string;
  cedula?: string;
  presupuesto?: number;
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
  tipo: "Llamada" | "Reunión" | "Email" | "Nota" | "Tarea";
  titulo: string;
  descripcion: string;
  fecha: string;
  leadId?: string;
  clienteId?: string;
  completada: boolean;
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
