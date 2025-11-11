import { 
  collection, 
  getDocs,
  query,
  orderBy 
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
      
      return querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          nombres: data.nombres || '',
          apellidos: data.apellidos || '',
          telefono: data.telefono || '',
          email: data.email || '',
          cedula: data.cedula || '',
          direccion: data.direccion || '',
          fechaRegistro: data.fechaRegistro || new Date().toISOString(),
          vehiculosComprados: data.vehiculosComprados || 0,
          valorTotal: data.valorTotal || 0,
          ultimaCompra: data.ultimaCompra,
        } as Cliente;
      });
    } catch (error) {
      console.error("Error obteniendo clientes:", error);
      return []; // Retornar array vacío en caso de error
    }
  },
};
