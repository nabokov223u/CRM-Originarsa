import type { LeadStatus } from './types';

export const LEAD_STATUS_SCHEMA_VERSION = 2;
export const DEFAULT_LEAD_STATUS: LeadStatus = 'Por Contactar';
export const CONTACTABLE_STATUSES: LeadStatus[] = ['Seguimiento', 'Por Facturar', 'Facturado'];
export const PIPELINE_STATUSES: LeadStatus[] = ['Por Contactar', 'Seguimiento', 'Por Facturar', 'Facturado', 'Caido', 'No Contactado'];

const VALID_STATUSES = new Set<LeadStatus>(PIPELINE_STATUSES);

export function normalizeLeadStatus(rawStatus?: string | null, statusVersion?: number | null): LeadStatus {
  const status = String(rawStatus || '').trim();

  if (!status) {
    return DEFAULT_LEAD_STATUS;
  }

  if (status === 'Por Facturar' && statusVersion !== LEAD_STATUS_SCHEMA_VERSION) {
    return 'Por Contactar';
  }

  if (status === 'Cita Agendada') {
    return 'Seguimiento';
  }

  if (VALID_STATUSES.has(status as LeadStatus)) {
    return status as LeadStatus;
  }

  return DEFAULT_LEAD_STATUS;
}