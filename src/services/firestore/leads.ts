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
      
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      } as Lead));
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
