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
import type { Cliente } from "../../utils/types";

const COLLECTION_NAME = "clientes";

export const clientesService = {
  // Obtener todos los clientes
  async getAll(): Promise<Cliente[]> {
    try {
      const q = query(collection(db, COLLECTION_NAME), orderBy("fechaRegistro", "desc"));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map((doc) => ({
        id: parseInt(doc.id) || Date.now(),
        ...doc.data(),
      } as Cliente));
    } catch (error) {
      console.error("Error obteniendo clientes:", error);
      throw error;
    }
  },

  // Crear nuevo cliente
  async create(cliente: Omit<Cliente, "id">): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        ...cliente,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      return docRef.id;
    } catch (error) {
      console.error("Error creando cliente:", error);
      throw error;
    }
  },

  // Actualizar cliente
  async update(id: string, cliente: Partial<Cliente>): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, {
        ...cliente,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error("Error actualizando cliente:", error);
      throw error;
    }
  },

  // Eliminar cliente
  async delete(id: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error("Error eliminando cliente:", error);
      throw error;
    }
  },
};
