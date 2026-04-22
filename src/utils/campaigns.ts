import type { Application } from '../services/firestore/applications';
import type { Lead } from './types';

const CAMPAIGN_ORDER = ['CrediExpress', 'Aprobados en Vivo', 'Otros'];

const normalize = (value?: string) =>
  String(value || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

function resolveCampaign(value?: string): string | null {
  const normalized = normalize(value);

  if (!normalized) return null;
  if (normalized === 'crediexpress') return 'CrediExpress';
  if (normalized === 'aprobados en vivo' || normalized === 'aprobados no facturados' || normalized === 'aprobados no facturado') {
    return 'Aprobados en Vivo';
  }

  return 'Otros';
}

export function getLeadCampaign(lead: Pick<Lead, 'id' | 'fuente' | 'origen'>): string {
  return resolveCampaign(lead.origen) || resolveCampaign(lead.fuente) || (lead.id.startsWith('crediexpress_') ? 'CrediExpress' : 'Otros');
}

export function getApplicationCampaign(application: Pick<Application, 'origen'>): string {
  return resolveCampaign(application.origen) || 'CrediExpress';
}

export function sortCampaignNames(campaigns: string[]): string[] {
  return [...campaigns].sort((left, right) => {
    const leftIndex = CAMPAIGN_ORDER.indexOf(left);
    const rightIndex = CAMPAIGN_ORDER.indexOf(right);

    if (leftIndex !== -1 || rightIndex !== -1) {
      const normalizedLeftIndex = leftIndex === -1 ? Number.MAX_SAFE_INTEGER : leftIndex;
      const normalizedRightIndex = rightIndex === -1 ? Number.MAX_SAFE_INTEGER : rightIndex;
      if (normalizedLeftIndex !== normalizedRightIndex) {
        return normalizedLeftIndex - normalizedRightIndex;
      }
    }

    return left.localeCompare(right, 'es');
  });
}