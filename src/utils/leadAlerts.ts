import type { LeadAlert } from './types';

interface LeadAlertViewer {
  isAdmin: boolean;
  viewerName?: string | null;
}

function normalizePersonName(value?: string | null): string {
  return (value || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function isAdvisorForAlert(alert: LeadAlert, viewerName?: string | null): boolean {
  const advisor = normalizePersonName(alert.advisorName || '');
  const viewer = normalizePersonName(viewerName);
  return Boolean(advisor && viewer && advisor === viewer);
}

export function canViewerSeeLeadAlert(alert: LeadAlert, viewer: LeadAlertViewer): boolean {
  if (!alert.isActive) return false;

  const advisorCanSee = isAdvisorForAlert(alert, viewer.viewerName);

  if (alert.currentLevel === 'warning') {
    return !viewer.isAdmin && advisorCanSee;
  }

  return viewer.isAdmin || advisorCanSee;
}

export function getVisibleLeadAlerts(alerts: LeadAlert[], viewer: LeadAlertViewer): LeadAlert[] {
  return alerts.filter((alert) => canViewerSeeLeadAlert(alert, viewer));
}

export function getVisibleLeadAlertMap(alerts: LeadAlert[], viewer: LeadAlertViewer): Record<string, LeadAlert> {
  return getVisibleLeadAlerts(alerts, viewer).reduce<Record<string, LeadAlert>>((accumulator, alert) => {
    accumulator[alert.leadId] = alert;
    return accumulator;
  }, {});
}