import { 
  collection, 
  deleteDoc,
  getDocs,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  Timestamp
} from "firebase/firestore";
import { db } from "../../lib/firebase";
import { LEAD_STATUS_SCHEMA_VERSION } from '../../utils/leadStatus';

// Interfaz para los datos de CrediExpress (estructura real)
export interface Application {
  id: string;
  applicant: {
    fullName: string;
    email: string;
    phone: string;
    idNumber: string;
    maritalStatus: string;
    spouseId?: string;
  };
  loan: {
    downPaymentPct: number;
    termMonths: number;
    vehicleAmount: number;
  };
  status: "approved" | "rejected" | "pending" | "denied" | "review"; // Decisión crediticia/original de CrediExpress
  crmStatus?: string; // Estado comercial del CRM, separado de la decisión crediticia
  crmStatusVersion?: number;
  createdAt: any;
  updatedAt: any;
  // Campos adicionales que puede tener CrediExpress
  score?: number;
  creditLimit?: number;
  // Campos de origen y asesor
  origen?: string;
  asesor?: string;
  concesionario?: string;
  codigoSolicitud?: string;
  etiqueta?: string;
  ultimaNota?: string;
}

const COLLECTION_NAME = "applications";

export const applicationsService = {
  // Obtener todas las applications
  async getAll(): Promise<Application[]> {
    try {
      const q = query(collection(db, COLLECTION_NAME), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      
      // ✅ Cargando applications con estructura applicant.* correcta
      
      return querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          applicant: {
            fullName: data.applicant?.fullName || '',
            email: data.applicant?.email || '',
            phone: String(data.applicant?.phone || ''),
            idNumber: String(data.applicant?.idNumber || ''),
            maritalStatus: data.applicant?.maritalStatus || '',
            spouseId: data.applicant?.spouseId,
          },
          loan: {
            downPaymentPct: data.loan?.downPaymentPct || 0,
            termMonths: data.loan?.termMonths || 0,
            vehicleAmount: data.loan?.vehicleAmount || 0,
          },
          status: data.status || "pending",
          crmStatus: data.crmStatus, // Estado del CRM
          crmStatusVersion: data.crmStatusVersion,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
          score: data.score,
          creditLimit: data.creditLimit,
          origen: data.origen,
          asesor: data.asesor,
          concesionario: data.concesionario,
          codigoSolicitud: data.codigoSolicitud,
          etiqueta: data.etiqueta,
          ultimaNota: data.ultimaNota,
        } as Application;
      }).filter((app) => app.status !== "denied");
    } catch (error) {
      console.error("Error obteniendo applications:", error);
      return [];
    }
  },

  // Escuchar cambios en tiempo real
  subscribeToChanges(callback: (applications: Application[]) => void) {
    const q = query(collection(db, COLLECTION_NAME), orderBy("createdAt", "desc"));
    
    return onSnapshot(q, (querySnapshot) => {
      const applications = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          applicant: {
            fullName: data.applicant?.fullName || '',
            email: data.applicant?.email || '',
            phone: String(data.applicant?.phone || ''),
            idNumber: String(data.applicant?.idNumber || ''),
            maritalStatus: data.applicant?.maritalStatus || '',
            spouseId: data.applicant?.spouseId,
          },
          loan: {
            downPaymentPct: data.loan?.downPaymentPct || 0,
            termMonths: data.loan?.termMonths || 0,
            vehicleAmount: data.loan?.vehicleAmount || 0,
          },
          status: data.status || "pending",
          crmStatus: data.crmStatus, // Estado del CRM
          crmStatusVersion: data.crmStatusVersion,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
          score: data.score,
          creditLimit: data.creditLimit,
          origen: data.origen,
          asesor: data.asesor,
          concesionario: data.concesionario,
          codigoSolicitud: data.codigoSolicitud,
          etiqueta: data.etiqueta,
          ultimaNota: data.ultimaNota,
        } as Application;
      }).filter((app) => app.status !== "denied");
      
      callback(applications);
    }, (error) => {
      console.error("Error en tiempo real de applications:", error);
    });
  },

  // Marcar application como procesada (opcional)
  async markAsProcessed(id: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, {
        processed: true,
        processedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error marcando application como procesada:", error);
      throw error;
    }
  },

  // Actualizar decisión crediticia/original de una application.
  // No usar para mover etapas del pipeline del CRM.
  async updateStatus(id: string, status: "approved" | "rejected" | "pending"): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, {
        status: status,
        updatedAt: new Date().toISOString(),
      });
      console.log(`✅ Application ${id} actualizada a status: ${status}`);
    } catch (error) {
      console.error("Error actualizando status de application:", error);
      throw error;
    }
  },

  // Actualizar estado del CRM (independiente del status de CrediExpress)
  async updateCrmStatus(id: string, crmStatus: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, {
        crmStatus: crmStatus,
        crmStatusVersion: LEAD_STATUS_SCHEMA_VERSION,
        updatedAt: new Date().toISOString(),
      });
      console.log(`✅ Application ${id} actualizada a CRM status: ${crmStatus}`);
    } catch (error) {
      console.error("Error actualizando CRM status de application:", error);
      throw error;
    }
  },

  // Suscripción a TODAS las applications sin filtrar (para estadísticas reales)
  // IMPORTANT: sin orderBy para incluir docs que no tengan createdAt
  subscribeToAllRaw(callback: (applications: Application[]) => void) {
    return onSnapshot(collection(db, COLLECTION_NAME), (querySnapshot) => {
      const applications = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          applicant: {
            fullName: data.applicant?.fullName || '',
            email: data.applicant?.email || '',
            phone: String(data.applicant?.phone || ''),
            idNumber: String(data.applicant?.idNumber || ''),
            maritalStatus: data.applicant?.maritalStatus || '',
            spouseId: data.applicant?.spouseId,
          },
          loan: {
            downPaymentPct: data.loan?.downPaymentPct || 0,
            termMonths: data.loan?.termMonths || 0,
            vehicleAmount: data.loan?.vehicleAmount || 0,
          },
          status: data.status || "pending",
          crmStatus: data.crmStatus,
          crmStatusVersion: data.crmStatusVersion,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
          score: data.score,
          creditLimit: data.creditLimit,
          origen: data.origen,
          asesor: data.asesor,
          concesionario: data.concesionario,
          codigoSolicitud: data.codigoSolicitud,
          etiqueta: data.etiqueta,
          ultimaNota: data.ultimaNota,
        } as Application;
      });
      callback(applications);
    }, (error) => {
      console.error("Error en tiempo real de applications (raw):", error);
    });
  },

  // Actualizar campos arbitrarios en la application (etiqueta, ultimaNota, etc.)
  async updateFields(id: string, fields: Record<string, unknown>): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, {
        ...fields,
        updatedAt: new Date().toISOString(),
      });
      console.log(`✅ Application ${id} campos actualizados:`, Object.keys(fields));
    } catch (error) {
      console.error("Error actualizando campos de application:", error);
      throw error;
    }
  },

  async reassignAdvisor(id: string, advisorName: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, {
        asesor: advisorName,
        crmStatus: 'Por Contactar',
        crmStatusVersion: LEAD_STATUS_SCHEMA_VERSION,
        porContactarStartedAt: Timestamp.now(),
        updatedAt: new Date().toISOString(),
      });
      console.log(`✅ Application ${id} reasignada a ${advisorName} y reiniciada a Por Contactar`);
    } catch (error) {
      console.error('Error reasignando application:', error);
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await deleteDoc(docRef);
      console.log(`✅ Application ${id} eliminada correctamente`);
    } catch (error) {
      console.error('Error eliminando application:', error);
      throw error;
    }
  },
};