import { leadsService } from './firestore/leads';
import { applicationsService, type Application } from './firestore/applications';
import { convertApplicationToLead } from '../utils/convertApplications';
import type { Lead } from '../utils/types';

export const unifiedLeadsService = {
  // Obtener todos los leads (CRM + CrediExpress)
  async getAllLeads(): Promise<Lead[]> {
    try {
      console.log('🔄 Cargando leads del CRM...');
      const crmLeads = await leadsService.getAll();
      console.log(`✅ ${crmLeads.length} leads del CRM cargados`);

      console.log('🔄 Cargando applications de CrediExpress...');
      const applications = await applicationsService.getAll();
      console.log(`✅ ${applications.length} applications de CrediExpress cargadas`);

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
      const crediexpressLeads: Lead[] = applications.map((app) => {
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

    // Suscripción a leads del CRM (simulada - no tenemos onSnapshot para leads aún)
    leadsService.getAll().then((leads) => {
      crmLeads = leads;
      updateCallback();
    });

    // Suscripción a applications en tiempo real
    const unsubscribeApplications = applicationsService.subscribeToChanges((apps) => {
      console.log(`🔄 ${apps.length} applications actualizadas en tiempo real`);
      applications = apps;
      updateCallback();
    });

    // Retornar función para cancelar suscripciones
    return () => {
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

  // Métodos CRUD - solo para leads del CRM (no applications)
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
    if (this.isFromCrediExpress(id)) {
      throw new Error('No se pueden eliminar leads de CrediExpress desde el CRM.');
    }
    return leadsService.delete(id);
  },

  // Actualizar estado de una application de CrediExpress
  async updateApplicationStatus(id: string, newStatus: string): Promise<void> {
    // Mapear estados del CRM a estados de CrediExpress
    let crediExpressStatus: "approved" | "rejected" | "pending" = "pending";
    
    if (newStatus === "Ganado" || newStatus === "Calificado") {
      crediExpressStatus = "approved";
    } else if (newStatus === "Perdido") {
      crediExpressStatus = "rejected";
    } else {
      crediExpressStatus = "pending";
    }
    
    return applicationsService.updateStatus(id, crediExpressStatus);
  },
};