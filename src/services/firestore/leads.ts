import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs,
  query,
  orderBy,
  Timestamp 
} from "firebase/firestore";
import { db } from "../../lib/firebase";
import type { Lead } from "../../utils/types";

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
            phone: data.phone || '',
            idNumber: data.idNumber || '',
            maritalStatus: data.maritalStatus,
            status: data.status || 'Nuevo',
            fuente: data.fuente || 'Web',
            fechaCreacion: data.fechaCreacion || new Date().toISOString().split('T')[0],
            ultimaInteraccion: data.ultimaInteraccion,
            vehicleAmount: data.vehicleAmount || data.presupuesto || 0,
            downPaymentPct: data.downPaymentPct,
            termMonths: data.termMonths,
            modelo: data.modelo,
            notas: data.notas || '',
            asignadoA: data.asignadoA,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
            // Campos deprecated para compatibilidad
            nombres: data.nombres || (data.fullName ? data.fullName.split(' ').slice(0, 2).join(' ') : ''),
            apellidos: data.apellidos || (data.fullName ? data.fullName.split(' ').slice(2).join(' ') : ''),
            telefono: data.telefono || data.phone,
            cedula: data.cedula || data.idNumber,
            presupuesto: data.presupuesto || data.vehicleAmount,
          } as Lead;
        } else {
          // Formato antiguo (CRM legacy)
          return {
            id: doc.id,
            // Mapear a formato nuevo
            fullName: data.fullName || `${data.nombres || ''} ${data.apellidos || ''}`.trim(),
            email: data.email || '',
            phone: data.phone || data.telefono || '',
            idNumber: data.idNumber || data.cedula || '',
            maritalStatus: data.maritalStatus,
            status: data.status || 'Nuevo',
            fuente: data.fuente || 'Web',
            fechaCreacion: data.fechaCreacion || new Date().toISOString().split('T')[0],
            ultimaInteraccion: data.ultimaInteraccion,
            vehicleAmount: data.vehicleAmount || data.presupuesto || 0,
            downPaymentPct: data.downPaymentPct,
            termMonths: data.termMonths,
            modelo: data.modelo || '',
            notas: data.notas || '',
            asignadoA: data.asignadoA,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
            // Campos deprecated para compatibilidad
            nombres: data.nombres || '',
            apellidos: data.apellidos || '',
            telefono: data.telefono || '',
            cedula: data.cedula || '',
            presupuesto: data.presupuesto || 0,
          } as Lead;
        }
      });
    } catch (error) {
      console.error("Error obteniendo leads:", error);
      throw error;
    }
  },

  // Crear nuevo lead
  async create(lead: Omit<Lead, "id">): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        ...lead,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        fechaCreacion: new Date().toISOString().split('T')[0],
        status: lead.status || "Nuevo",
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
      await updateDoc(docRef, {
        ...lead,
        updatedAt: Timestamp.now(),
        ultimaInteraccion: new Date().toISOString().split('T')[0],
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
};
