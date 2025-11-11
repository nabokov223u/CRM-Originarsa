import { 
  collection, 
  getDocs,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc
} from "firebase/firestore";
import { db } from "../../lib/firebase";

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
  status: "approved" | "rejected" | "pending";
  createdAt: any;
  updatedAt: any;
  // Campos adicionales que puede tener CrediExpress
  score?: number;
  creditLimit?: number;
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
            phone: data.applicant?.phone || '',
            idNumber: data.applicant?.idNumber || '',
            maritalStatus: data.applicant?.maritalStatus || '',
            spouseId: data.applicant?.spouseId,
          },
          loan: {
            downPaymentPct: data.loan?.downPaymentPct || 0,
            termMonths: data.loan?.termMonths || 0,
            vehicleAmount: data.loan?.vehicleAmount || 0,
          },
          status: data.status || "pending",
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
          score: data.score,
          creditLimit: data.creditLimit,
        } as Application;
      });
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
            phone: data.applicant?.phone || '',
            idNumber: data.applicant?.idNumber || '',
            maritalStatus: data.applicant?.maritalStatus || '',
            spouseId: data.applicant?.spouseId,
          },
          loan: {
            downPaymentPct: data.loan?.downPaymentPct || 0,
            termMonths: data.loan?.termMonths || 0,
            vehicleAmount: data.loan?.vehicleAmount || 0,
          },
          status: data.status || "pending",
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
          score: data.score,
          creditLimit: data.creditLimit,
        } as Application;
      });
      
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
};