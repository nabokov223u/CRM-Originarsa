import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs,
  query,
  orderBy,
  where,
  Timestamp,
  onSnapshot 
} from "firebase/firestore";
import { db } from "../../lib/firebase";
import type { Lead, LeadStatus, LeadPriority } from "../../utils/types";
import { createStatusChangeActivity } from "./activities";
import { DEFAULT_LEAD_STATUS, LEAD_STATUS_SCHEMA_VERSION, normalizeLeadStatus } from '../../utils/leadStatus';

const COLLECTION_NAME = "leads";

export const leadsService = {
  // Obtener todos los leads
  async getAll(): Promise<Lead[]> {
    try {
      const q = query(collection(db, COLLECTION_NAME), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map((doc) => {
        const data = doc.data();
        
        // Determinar si es formato nuevo o antiguo
        const isNewFormat = data.fullName && data.phone && data.idNumber;
        
        if (isNewFormat) {
          // Formato nuevo (CrediExpress)
          return {
            id: doc.id,
            fullName: data.fullName || '',
            email: data.email || '',
            phone: String(data.phone || ''),
            idNumber: String(data.idNumber || ''),
            maritalStatus: data.maritalStatus,
            status: normalizeLeadStatus(data.status, data.statusVersion),
            statusVersion: data.statusVersion,
            prioridad: data.prioridad || 'Media',
            fuente: data.fuente || 'Aprobados no Facturados',
            fechaCreacion: data.fechaCreacion || new Date().toISOString(),
            fechaUltimoContacto: data.fechaUltimoContacto,
            vehicleAmount: data.vehicleAmount || data.presupuesto || 0,
            downPaymentPct: data.downPaymentPct,
            termMonths: data.termMonths,
            creditScore: data.creditScore,
            vehiculoInteres: data.vehiculoInteres,
            observaciones: data.observaciones,
            asignadoA: data.asignadoA,
            origen: data.origen || 'CrediExpress',
            asesor: data.asesor || 'Telemarketing',
            etiqueta: data.etiqueta,
            ultimaNota: data.ultimaNota,
            proximaAccion: data.proximaAccion,
            motivoPerdida: data.motivoPerdida,
            fechaCierre: data.fechaCierre,
            montoFinal: data.montoFinal,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
            // Campos deprecated para compatibilidad
            nombres: data.nombres || (data.fullName ? data.fullName.split(' ').slice(0, 2).join(' ') : ''),
            apellidos: data.apellidos || (data.fullName ? data.fullName.split(' ').slice(2).join(' ') : ''),
            telefono: data.telefono || data.phone,
            cedula: data.cedula || data.idNumber,
            presupuesto: data.presupuesto || data.vehicleAmount,
            modelo: data.modelo || data.vehiculoInteres,
            notas: data.notas || data.observaciones,
            ultimaInteraccion: data.ultimaInteraccion || data.fechaUltimoContacto,
          } as Lead;
        } else {
          // Formato antiguo (CRM legacy)
          return {
            id: doc.id,
            // Mapear a formato nuevo
            fullName: data.fullName || `${data.nombres || ''} ${data.apellidos || ''}`.trim(),
            email: data.email || '',
            phone: String(data.phone || data.telefono || ''),
            idNumber: String(data.idNumber || data.cedula || ''),
            maritalStatus: data.maritalStatus,
            status: normalizeLeadStatus(data.status, data.statusVersion),
            statusVersion: data.statusVersion,
            prioridad: data.prioridad || 'Media',
            fuente: data.fuente || 'Web',
            fechaCreacion: data.fechaCreacion || new Date().toISOString(),
            fechaUltimoContacto: data.fechaUltimoContacto || data.ultimaInteraccion,
            vehicleAmount: data.vehicleAmount || data.presupuesto || 0,
            downPaymentPct: data.downPaymentPct,
            termMonths: data.termMonths,
            creditScore: data.creditScore,
            vehiculoInteres: data.vehiculoInteres || data.modelo,
            observaciones: data.observaciones || data.notas,
            asignadoA: data.asignadoA,
            origen: data.origen || '',
            asesor: data.asesor || '',
            etiqueta: data.etiqueta,
            ultimaNota: data.ultimaNota,
            proximaAccion: data.proximaAccion,
            motivoPerdida: data.motivoPerdida,
            fechaCierre: data.fechaCierre,
            montoFinal: data.montoFinal,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
            // Campos deprecated para compatibilidad
            nombres: data.nombres || '',
            apellidos: data.apellidos || '',
            telefono: data.telefono || '',
            cedula: data.cedula || '',
            presupuesto: data.presupuesto || 0,
            modelo: data.modelo || '',
            notas: data.notas || '',
            ultimaInteraccion: data.ultimaInteraccion,
          } as Lead;
        }
      });
    } catch (error) {
      console.error("Error obteniendo leads:", error);
      throw error;
    }
  },

  // Suscribirse a cambios en tiempo real
  subscribeToChanges(callback: (leads: Lead[]) => void) {
    const q = query(collection(db, COLLECTION_NAME), orderBy("createdAt", "desc"));
    
    return onSnapshot(q, (querySnapshot) => {
      const leads = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        
        // Determinar si es formato nuevo o antiguo
        const isNewFormat = data.fullName && data.phone && data.idNumber;
        
        if (isNewFormat) {
          // Formato nuevo (CrediExpress)
          return {
            id: doc.id,
            fullName: data.fullName || '',
            email: data.email || '',
            phone: String(data.phone || ''),
            idNumber: String(data.idNumber || ''),
            maritalStatus: data.maritalStatus,
            status: normalizeLeadStatus(data.status, data.statusVersion),
            statusVersion: data.statusVersion,
            prioridad: data.prioridad || 'Media',
            fuente: data.fuente || 'Aprobados no Facturados',
            fechaCreacion: data.fechaCreacion || new Date().toISOString(),
            fechaUltimoContacto: data.fechaUltimoContacto,
            vehicleAmount: data.vehicleAmount || data.presupuesto || 0,
            downPaymentPct: data.downPaymentPct,
            termMonths: data.termMonths,
            creditScore: data.creditScore,
            vehiculoInteres: data.vehiculoInteres,
            observaciones: data.observaciones,
            asignadoA: data.asignadoA,
            origen: data.origen || 'CrediExpress',
            asesor: data.asesor || 'Telemarketing',
            etiqueta: data.etiqueta,
            ultimaNota: data.ultimaNota,
            proximaAccion: data.proximaAccion,
            motivoPerdida: data.motivoPerdida,
            fechaCierre: data.fechaCierre,
            montoFinal: data.montoFinal,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
            // Campos deprecated para compatibilidad
            nombres: data.nombres || (data.fullName ? data.fullName.split(' ').slice(0, 2).join(' ') : ''),
            apellidos: data.apellidos || (data.fullName ? data.fullName.split(' ').slice(2).join(' ') : ''),
            telefono: data.telefono || data.phone,
            cedula: data.cedula || data.idNumber,
            presupuesto: data.presupuesto || data.vehicleAmount,
            modelo: data.modelo || data.vehiculoInteres,
            notas: data.notas || data.observaciones,
            ultimaInteraccion: data.ultimaInteraccion || data.fechaUltimoContacto,
          } as Lead;
        } else {
          // Formato antiguo (CRM legacy)
          return {
            id: doc.id,
            // Mapear a formato nuevo
            fullName: data.fullName || `${data.nombres || ''} ${data.apellidos || ''}`.trim(),
            email: data.email || '',
            phone: String(data.phone || data.telefono || ''),
            idNumber: String(data.idNumber || data.cedula || ''),
            maritalStatus: data.maritalStatus,
            status: normalizeLeadStatus(data.status, data.statusVersion),
            statusVersion: data.statusVersion,
            prioridad: data.prioridad || 'Media',
            fuente: data.fuente || 'Web',
            fechaCreacion: data.fechaCreacion || new Date().toISOString(),
            fechaUltimoContacto: data.fechaUltimoContacto || data.ultimaInteraccion,
            vehicleAmount: data.vehicleAmount || data.presupuesto || 0,
            downPaymentPct: data.downPaymentPct,
            termMonths: data.termMonths,
            creditScore: data.creditScore,
            vehiculoInteres: data.vehiculoInteres || data.modelo,
            observaciones: data.observaciones || data.notas,
            asignadoA: data.asignadoA,
            origen: data.origen || '',
            asesor: data.asesor || '',
            etiqueta: data.etiqueta,
            ultimaNota: data.ultimaNota,
            proximaAccion: data.proximaAccion,
            motivoPerdida: data.motivoPerdida,
            fechaCierre: data.fechaCierre,
            montoFinal: data.montoFinal,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
            // Campos deprecated para compatibilidad
            nombres: data.nombres || '',
            apellidos: data.apellidos || '',
            telefono: data.telefono || '',
            cedula: data.cedula || '',
            presupuesto: data.presupuesto || 0,
            modelo: data.modelo || '',
            notas: data.notas || '',
            ultimaInteraccion: data.ultimaInteraccion,
          } as Lead;
        }
      });
      
      callback(leads);
    }, (error) => {
      console.error("Error en tiempo real de leads:", error);
    });
  },

  // Crear nuevo lead
  async create(lead: Omit<Lead, "id">): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        ...lead,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        fechaCreacion: new Date().toISOString(),
        status: lead.status || DEFAULT_LEAD_STATUS,
        statusVersion: LEAD_STATUS_SCHEMA_VERSION,
        prioridad: lead.prioridad || "Media",
        fuente: lead.fuente || "CrediExpress",
      });
      return docRef.id;
    } catch (error) {
      console.error("Error creando lead:", error);
      throw error;
    }
  },

  // Actualizar lead
  async update(id: string, lead: Partial<Lead>): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const payload: Record<string, unknown> = {
        ...lead,
        updatedAt: Timestamp.now(),
        ultimaInteraccion: new Date().toISOString().split('T')[0],
      };

      if (lead.status) {
        payload.statusVersion = LEAD_STATUS_SCHEMA_VERSION;
      }

      await updateDoc(docRef, {
        ...payload,
      });
    } catch (error) {
      console.error("Error actualizando lead:", error);
      throw error;
    }
  },

  // Eliminar lead
  async delete(id: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error("Error eliminando lead:", error);
      throw error;
    }
  },

  // ===== NUEVAS FUNCIONES PARA GESTIÃ“N DEL PIPELINE =====

  // Cambiar estado del lead
  async updateStatus(
    id: string, 
    newStatus: LeadStatus, 
    userName: string = 'Sistema'
  ): Promise<void> {
    try {
      console.log(`ðŸ”„ Actualizando status de lead ${id} a ${newStatus}`);
      
      // Actualizar estado directamente sin obtener todos los leads
      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, {
        status: newStatus,
        statusVersion: LEAD_STATUS_SCHEMA_VERSION,
        updatedAt: Timestamp.now(),
        fechaUltimoContacto: new Date().toISOString().split('T')[0], // Solo fecha YYYY-MM-DD
      });

      console.log(`âœ… Lead ${id} actualizado a ${newStatus}`);
      
      // Crear actividad de cambio de estado (solo registra, no afecta el estado)
      try {
        await createStatusChangeActivity(id, 'Status Anterior' as LeadStatus, newStatus, userName);
      } catch (activityError) {
        console.warn('âš ï¸ Error creando actividad (no crÃ­tico):', activityError);
      }
    } catch (error) {
      console.error("Error actualizando estado:", error);
      throw error;
    }
  },

  // Asignar lead a asesor
  async assignToUser(id: string, userName: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, {
        asignadoA: userName,
        updatedAt: Timestamp.now(),
      });
      console.log(`âœ… Lead asignado a ${userName}`);
    } catch (error) {
      console.error("Error asignando lead:", error);
      throw error;
    }
  },

  async reassignAdvisor(id: string, advisorName: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, {
        asesor: advisorName,
        asignadoA: advisorName,
        status: 'Por Contactar',
        statusVersion: LEAD_STATUS_SCHEMA_VERSION,
        porContactarStartedAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      console.log(`✅ Lead ${id} reasignado a ${advisorName} y reiniciado a Por Contactar`);
    } catch (error) {
      console.error('Error reasignando lead:', error);
      throw error;
    }
  },

  // Actualizar prioridad
  async updatePriority(id: string, priority: LeadPriority): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, {
        prioridad: priority,
        updatedAt: Timestamp.now(),
      });
      console.log(`âœ… Prioridad actualizada a ${priority}`);
    } catch (error) {
      console.error("Error actualizando prioridad:", error);
      throw error;
    }
  },

  // Marcar lead como perdido
  async markAsLost(id: string, reason: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, {
        status: 'Perdido',
        motivoPerdida: reason,
        updatedAt: Timestamp.now(),
      });
      console.log(`âœ… Lead marcado como perdido: ${reason}`);
    } catch (error) {
      console.error("Error marcando como perdido:", error);
      throw error;
    }
  },

  // Marcar lead como ganado
  async markAsWon(id: string, finalAmount?: number): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, {
        status: 'Ganado',
        fechaCierre: new Date().toISOString(),
        montoFinal: finalAmount,
        updatedAt: Timestamp.now(),
      });
      console.log(`âœ… Lead marcado como ganado`);
    } catch (error) {
      console.error("Error marcando como ganado:", error);
      throw error;
    }
  },

  // Obtener leads por estado
  async getByStatus(status: LeadStatus): Promise<Lead[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('status', '==', status),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Lead));
    } catch (error) {
      console.error(`Error obteniendo leads con estado ${status}:`, error);
      throw error;
    }
  },

  // Obtener leads asignados a un usuario
  async getByAssignee(userName: string): Promise<Lead[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('asignadoA', '==', userName),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Lead));
    } catch (error) {
      console.error(`Error obteniendo leads de ${userName}:`, error);
      throw error;
    }
  },

  // Actualizar observaciones/notas
  async updateNotes(id: string, notes: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, {
        observaciones: notes,
        updatedAt: Timestamp.now(),
      });
      console.log(`âœ… Notas actualizadas`);
    } catch (error) {
      console.error("Error actualizando notas:", error);
      throw error;
    }
  },
};
