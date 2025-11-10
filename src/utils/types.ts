export interface Lead {
  id: string;
  nombres: string;
  apellidos: string;
  telefono: string;
  email?: string;
  cedula: string;
  modelo?: string;
  status: "Nuevo" | "Contactado" | "Negociación" | "Aprobado" | "Perdido";
  fuente: "Web" | "Referido" | "Redes Sociales" | "Llamada" | "Otro";
  fechaCreacion: string;
  ultimaInteraccion?: string;
  presupuesto?: number;
  notas?: string;
  asignadoA?: string;
  createdAt?: any; // Firebase Timestamp
  updatedAt?: any; // Firebase Timestamp
}

export interface Cliente {
  id: number;
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
  id: number;
  tipo: "Llamada" | "Reunión" | "Email" | "Nota" | "Tarea";
  titulo: string;
  descripcion: string;
  fecha: string;
  leadId?: number;
  clienteId?: number;
  completada: boolean;
}

export interface Estadistica {
  label: string;
  valor: number | string;
  cambio?: number;
  icon: string;
}

export interface Vehiculo {
  id: number;
  marca: string;
  modelo: string;
  año: number;
  precio: number;
  stock: number;
  imagen?: string;
}
