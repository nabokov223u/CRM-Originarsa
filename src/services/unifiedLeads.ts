import { leadsService } from './firestore/leads';
import { applicationsService, type Application } from './firestore/applications';
import { convertApplicationToLead } from '../utils/convertApplications';
import type { Lead } from '../utils/types';
import { getIdTokenResult } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { isExcludedCrmUserName } from '../utils/crmUsers';

// Deduplicar applications de CrediExpress por cédula (idNumber).
// Cuando hay múltiples solicitudes con la misma cédula, se conserva la más reciente.
function deduplicateApplications(apps: Application[]): Application[] {
  const map = new Map<string, Application>();
  for (const app of apps) {
    const cedula = (app.applicant?.idNumber || '').trim();
    if (!cedula) { map.set(app.id, app); continue; } // sin cédula → conservar
    const existing = map.get(cedula);
    if (!existing) {
      map.set(cedula, app);
    } else {
      // Conservar la más reciente por createdAt
      const existingTime = existing.createdAt?.toDate?.() ? existing.createdAt.toDate().getTime() : 0;
      const currentTime = app.createdAt?.toDate?.() ? app.createdAt.toDate().getTime() : 0;
      if (currentTime > existingTime) {
        map.set(cedula, app);
      }
    }
  }
  return Array.from(map.values());
}

async function ensureAdminAccess(action: string): Promise<void> {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error(`Debes iniciar sesión para ${action}.`);
  }

  const tokenResult = await getIdTokenResult(currentUser);
  if (tokenResult.claims.admin !== true) {
    throw new Error(`Solo los administradores pueden ${action}.`);
  }
}

export const unifiedLeadsService = {
  // Obtener todos los leads (CRM + CrediExpress)
  async getAllLeads(): Promise<Lead[]> {
    try {
      console.log('🔄 Cargando leads del CRM...');
      const crmLeads = await leadsService.getAll();
      console.log(`✅ ${crmLeads.length} leads del CRM cargados`);

      console.log('🔄 Cargando applications de CrediExpress...');
      const rawApplications = await applicationsService.getAll();
      const applications = deduplicateApplications(rawApplications);
      console.log(`✅ ${rawApplications.length} applications de CrediExpress (${applications.length} únicas por cédula)`);

      // Convertir applications a leads
      const crediexpressLeads: Lead[] = applications.map((app) => {
        const leadData = convertApplicationToLead(app);
        return {
          id: `crediexpress_${app.id}`, // Prefijo para identificar origen
          ...leadData,
        };
      });

      console.log(`🔄 Convirtiendo ${applications.length} applications a leads...`);
      console.log(`✅ Total leads combinados: ${crmLeads.length + crediexpressLeads.length}`);

      // Combinar ambas fuentes
      return [...crmLeads, ...crediexpressLeads];
    } catch (error) {
      console.error("❌ Error obteniendo leads unificados:", error);
      throw error;
    }
  },

  // Escuchar cambios en tiempo real de ambas fuentes
  subscribeToAllLeads(callback: (leads: Lead[]) => void) {
    let crmLeads: Lead[] = [];
    let applications: Application[] = [];

    const updateCallback = () => {
      const uniqueApps = deduplicateApplications(applications);
      const crediexpressLeads: Lead[] = uniqueApps.map((app) => {
        const leadData = convertApplicationToLead(app);
        return {
          id: `crediexpress_${app.id}`,
          ...leadData,
        };
      });

      const allLeads = [...crmLeads, ...crediexpressLeads];
      console.log(`🔄 Actualizando leads en tiempo real: ${allLeads.length} total`);
      callback(allLeads);
    };

    // Suscripción a leads del CRM en tiempo real
    const unsubscribeLeads = leadsService.subscribeToChanges((leads) => {
      console.log(`🔄 ${leads.length} leads del CRM actualizados en tiempo real`);
      crmLeads = leads;
      updateCallback();
    });

    // Suscripción a applications en tiempo real
    const unsubscribeApplications = applicationsService.subscribeToChanges((apps) => {
      console.log(`🔄 ${apps.length} applications actualizadas en tiempo real`);
      applications = apps;
      updateCallback();
    });

    // Retornar función para cancelar ambas suscripciones
    return () => {
      unsubscribeLeads();
      unsubscribeApplications();
    };
  },

  // Determinar si un lead viene de CrediExpress
  isFromCrediExpress(leadId: string): boolean {
    return leadId.startsWith('crediexpress_');
  },

  // Obtener ID original de CrediExpress
  getOriginalCrediExpressId(leadId: string): string {
    return leadId.replace('crediexpress_', '');
  },

  // Métodos CRUD del universo unificado.
  async create(lead: Omit<Lead, 'id'>): Promise<string> {
    return leadsService.create(lead);
  },

  async update(id: string, lead: Partial<Lead>): Promise<void> {
    if (this.isFromCrediExpress(id)) {
      throw new Error('No se pueden editar leads de CrediExpress desde el CRM. Edítalos desde CrediExpress.');
    }
    return leadsService.update(id, lead);
  },

  async delete(id: string): Promise<void> {
    await ensureAdminAccess('eliminar leads');

    if (this.isFromCrediExpress(id)) {
      return applicationsService.delete(this.getOriginalCrediExpressId(id));
    }
    return leadsService.delete(id);
  },

  async reassignLead(id: string, advisorName: string): Promise<void> {
    await ensureAdminAccess('reasignar leads');

    const trimmedAdvisorName = advisorName.trim();
    if (!trimmedAdvisorName) {
      throw new Error('Selecciona un asesor para reasignar el lead.');
    }

    if (isExcludedCrmUserName(trimmedAdvisorName)) {
      throw new Error('Ese usuario no está disponible para asignación dentro del CRM.');
    }

    if (this.isFromCrediExpress(id)) {
      return applicationsService.reassignAdvisor(this.getOriginalCrediExpressId(id), trimmedAdvisorName);
    }

    return leadsService.reassignAdvisor(id, trimmedAdvisorName);
  },

  // Actualizar estado comercial de una application en el CRM.
  // El campo application.status pertenece a la decisión crediticia de CrediExpress
  // y no debe sobrescribirse desde el pipeline comercial.
  async updateApplicationStatus(id: string, newStatus: Lead['status']): Promise<void> {
    console.log(`🔄 Actualizando application ${id} a CRM status: ${newStatus}`);
    
    // Guardar solo el estado del CRM para no contaminar la reportería crediticia.
    await applicationsService.updateCrmStatus(id, newStatus);
    
    console.log(`✅ Application ${id} actualizada a CRM status: ${newStatus}`);
  },
};