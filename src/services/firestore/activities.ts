import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Actividad, LeadStatus } from '../../utils/types';

const COLLECTION_NAME = 'activities';

// Crear nueva actividad
export const createActivity = async (activity: Omit<Actividad, 'id' | 'createdAt'>): Promise<string> => {
  try {
    const activityData = {
      ...activity,
      createdAt: serverTimestamp(),
      fecha: activity.fecha || new Date().toISOString(),
    };

    const docRef = await addDoc(collection(db, COLLECTION_NAME), activityData);
    console.log('✅ Actividad creada:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('❌ Error creando actividad:', error);
    throw error;
  }
};

// Obtener actividades de un lead
export const getActivitiesByLead = async (leadId: string): Promise<Actividad[]> => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('leadId', '==', leadId),
      orderBy('fecha', 'desc')
    );

    const snapshot = await getDocs(q);
    
    const activities: Actividad[] = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || new Date(),
    } as Actividad));

    return activities;
  } catch (error) {
    console.error('❌ Error obteniendo actividades:', error);
    throw error;
  }
};

// Crear actividad de cambio de estado
export const createStatusChangeActivity = async (
  leadId: string,
  estadoAnterior: LeadStatus,
  estadoNuevo: LeadStatus,
  userName: string = 'Sistema'
): Promise<string> => {
  const activity: Omit<Actividad, 'id' | 'createdAt'> = {
    leadId,
    tipo: 'Cambio de Estado',
    titulo: `Estado actualizado: ${estadoAnterior} → ${estadoNuevo}`,
    descripcion: `El lead pasó de "${estadoAnterior}" a "${estadoNuevo}"`,
    fecha: new Date().toISOString(),
    userName,
    metadata: {
      estadoAnterior,
      estadoNuevo,
    },
  };

  return createActivity(activity);
};

// Crear actividad de llamada
export const createCallActivity = async (
  leadId: string,
  descripcion: string,
  duracionMinutos?: number,
  userName: string = 'Usuario'
): Promise<string> => {
  const activity: Omit<Actividad, 'id' | 'createdAt'> = {
    leadId,
    tipo: 'Llamada',
    titulo: 'Llamada realizada',
    descripcion,
    fecha: new Date().toISOString(),
    userName,
    completada: true,
    metadata: {
      duracionLlamada: duracionMinutos,
    },
  };

  return createActivity(activity);
};

// Crear actividad de nota
export const createNoteActivity = async (
  leadId: string,
  titulo: string,
  descripcion: string,
  userName: string = 'Usuario'
): Promise<string> => {
  const activity: Omit<Actividad, 'id' | 'createdAt'> = {
    leadId,
    tipo: 'Nota',
    titulo,
    descripcion,
    fecha: new Date().toISOString(),
    userName,
    completada: true,
  };

  return createActivity(activity);
};

// Actualizar actividad
export const updateActivity = async (
  activityId: string,
  updates: Partial<Actividad>
): Promise<void> => {
  try {
    const activityRef = doc(db, COLLECTION_NAME, activityId);
    await updateDoc(activityRef, updates);
    console.log('✅ Actividad actualizada:', activityId);
  } catch (error) {
    console.error('❌ Error actualizando actividad:', error);
    throw error;
  }
};

// Eliminar actividad
export const deleteActivity = async (activityId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, activityId));
    console.log('✅ Actividad eliminada:', activityId);
  } catch (error) {
    console.error('❌ Error eliminando actividad:', error);
    throw error;
  }
};

// Marcar actividad como completada
export const markActivityAsCompleted = async (activityId: string): Promise<void> => {
  return updateActivity(activityId, { completada: true });
};
