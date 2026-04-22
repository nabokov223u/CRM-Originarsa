import {
  collection,
  onSnapshot,
  query,
  where,
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import type { LeadAlert } from '../../utils/types';

const COLLECTION_NAME = 'leadAlerts';

function mapLeadAlert(snapshot: { id: string; data: () => Record<string, unknown> }): LeadAlert {
  const data = snapshot.data();

  return {
    id: snapshot.id,
    alertType: (data.alertType as LeadAlert['alertType']) || 'por-contactar',
    sourceCollection: (data.sourceCollection as LeadAlert['sourceCollection']) || 'leads',
    sourceId: String(data.sourceId || ''),
    leadId: String(data.leadId || ''),
    leadName: String(data.leadName || 'Sin nombre'),
    advisorName: data.advisorName ? String(data.advisorName) : undefined,
    origin: data.origin ? String(data.origin) : undefined,
    leadStatus: String(data.leadStatus || ''),
    currentLevel: (data.currentLevel as LeadAlert['currentLevel']) || 'warning',
    badgeLabel: String(data.badgeLabel || ''),
    workingHoursElapsed: Number(data.workingHoursElapsed || 0),
    roundedHoursElapsed: Number(data.roundedHoursElapsed || 0),
    isActive: data.isActive === true,
    startedAt: data.startedAt,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    lastEvaluatedAt: data.lastEvaluatedAt,
    firstVisibleAt: data.firstVisibleAt,
    warningTriggeredAt: data.warningTriggeredAt,
    overdueTriggeredAt: data.overdueTriggeredAt,
    criticalTriggeredAt: data.criticalTriggeredAt,
    resolvedAt: data.resolvedAt,
  };
}

export const leadAlertsService = {
  subscribeToActive(callback: (alerts: LeadAlert[]) => void) {
    const alertsQuery = query(collection(db, COLLECTION_NAME), where('isActive', '==', true));

    return onSnapshot(alertsQuery, (querySnapshot) => {
      callback(
        querySnapshot.docs
          .map(mapLeadAlert)
          .filter((alert) => alert.alertType === 'por-contactar'),
      );
    }, (error) => {
      console.error('Error en tiempo real de leadAlerts activas:', error);
    });
  },

  subscribeToAll(callback: (alerts: LeadAlert[]) => void) {
    return onSnapshot(collection(db, COLLECTION_NAME), (querySnapshot) => {
      callback(
        querySnapshot.docs
          .map(mapLeadAlert)
          .filter((alert) => alert.alertType === 'por-contactar'),
      );
    }, (error) => {
      console.error('Error en tiempo real de leadAlerts:', error);
    });
  },
};