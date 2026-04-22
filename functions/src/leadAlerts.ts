import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

const db = admin.firestore();

const ALERTS_COLLECTION = 'leadAlerts';
const LEADS_COLLECTION = 'leads';
const APPLICATIONS_COLLECTION = 'applications';
const POR_CONTACTAR = 'Por Contactar';
const HOUR_IN_MS = 60 * 60 * 1000;
const ECUADOR_OFFSET_MS = -5 * HOUR_IN_MS;

type SourceCollection = 'leads' | 'applications';
type LeadAlertLevel = 'warning' | 'overdue' | 'critical';

interface AlertCandidate {
  alertId: string;
  sourceCollection: SourceCollection;
  sourceId: string;
  leadId: string;
  leadName: string;
  advisorName: string;
  origin: string;
  startedAt: FirebaseFirestore.Timestamp;
  currentLevel: LeadAlertLevel;
  badgeLabel: string;
  workingHoursElapsed: number;
  roundedHoursElapsed: number;
}

function normalizeText(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function isTimestamp(value: unknown): value is FirebaseFirestore.Timestamp {
  return typeof value === 'object' && value !== null && typeof (value as { toDate?: unknown }).toDate === 'function';
}

function getEcuadorShiftedDate(date: Date): Date {
  return new Date(date.getTime() + ECUADOR_OFFSET_MS);
}

function isWeekendInEcuador(date: Date): boolean {
  const day = getEcuadorShiftedDate(date).getUTCDay();
  return day === 0 || day === 6;
}

function getNextEcuadorDayBoundary(date: Date): Date {
  const shifted = getEcuadorShiftedDate(date);
  const nextBoundaryMs = Date.UTC(
    shifted.getUTCFullYear(),
    shifted.getUTCMonth(),
    shifted.getUTCDate() + 1,
    0,
    0,
    0,
    0,
  ) - ECUADOR_OFFSET_MS;

  return new Date(nextBoundaryMs);
}

function getWorkingMillisecondsExcludingWeekends(start: Date, end: Date): number {
  if (end <= start) return 0;

  let cursor = start;
  let total = 0;

  while (cursor < end) {
    const nextBoundary = getNextEcuadorDayBoundary(cursor);
    const segmentEnd = nextBoundary < end ? nextBoundary : end;

    if (!isWeekendInEcuador(cursor)) {
      total += segmentEnd.getTime() - cursor.getTime();
    }

    cursor = segmentEnd;
  }

  return total;
}

function getAlertMetadata(workingHoursElapsed: number): { level: LeadAlertLevel; badgeLabel: string } | null {
  if (workingHoursElapsed < 12) return null;

  if (workingHoursElapsed >= 48) {
    return { level: 'critical', badgeLabel: 'SLA 48h+' };
  }

  if (workingHoursElapsed >= 24) {
    return { level: 'overdue', badgeLabel: 'SLA 24h+' };
  }

  return { level: 'warning', badgeLabel: 'SLA 12h+' };
}

function getAlertDocumentId(sourceCollection: SourceCollection, sourceId: string): string {
  return `${sourceCollection}_${sourceId}_por-contactar`;
}

function getLeadStatus(data?: FirebaseFirestore.DocumentData | null): string {
  return normalizeText(data?.status);
}

function getApplicationPipelineStatus(data?: FirebaseFirestore.DocumentData | null): string {
  const crmStatus = normalizeText(data?.crmStatus);
  if (crmStatus) return crmStatus;

  const creditStatus = normalizeText(data?.status).toLowerCase();
  if (creditStatus === 'rejected' || creditStatus === 'denied') {
    return 'Caido';
  }

  return POR_CONTACTAR;
}

function getLeadName(data: FirebaseFirestore.DocumentData): string {
  const fullName = normalizeText(data.fullName);
  if (fullName) return fullName;

  const nombres = normalizeText(data.nombres);
  const apellidos = normalizeText(data.apellidos);
  return `${nombres} ${apellidos}`.trim() || 'Sin nombre';
}

function getLeadAdvisorName(data: FirebaseFirestore.DocumentData): string {
  return normalizeText(data.asesor) || normalizeText(data.asignadoA) || 'Sin asignar';
}

function getLeadOrigin(data: FirebaseFirestore.DocumentData): string {
  return normalizeText(data.origen) || normalizeText(data.fuente) || 'Otros';
}

function getApplicationLeadName(data: FirebaseFirestore.DocumentData): string {
  return normalizeText(data.applicant?.fullName) || 'Sin nombre';
}

function getApplicationAdvisorName(data: FirebaseFirestore.DocumentData): string {
  return normalizeText(data.asesor) || 'Telemarketing';
}

function getApplicationOrigin(data: FirebaseFirestore.DocumentData): string {
  return normalizeText(data.origen) || 'CrediExpress';
}

function buildAlertCandidate(params: {
  sourceCollection: SourceCollection;
  sourceId: string;
  leadId: string;
  leadName: string;
  advisorName: string;
  origin: string;
  startedAt: FirebaseFirestore.Timestamp;
  now: Date;
}): AlertCandidate | null {
  const workingHoursElapsed = getWorkingMillisecondsExcludingWeekends(params.startedAt.toDate(), params.now) / HOUR_IN_MS;
  const alertMetadata = getAlertMetadata(workingHoursElapsed);

  if (!alertMetadata) return null;

  return {
    alertId: getAlertDocumentId(params.sourceCollection, params.sourceId),
    sourceCollection: params.sourceCollection,
    sourceId: params.sourceId,
    leadId: params.leadId,
    leadName: params.leadName,
    advisorName: params.advisorName,
    origin: params.origin,
    startedAt: params.startedAt,
    currentLevel: alertMetadata.level,
    badgeLabel: alertMetadata.badgeLabel,
    workingHoursElapsed: Number(workingHoursElapsed.toFixed(2)),
    roundedHoursElapsed: Math.floor(workingHoursElapsed),
  };
}

async function resolveAlertDocument(sourceCollection: SourceCollection, sourceId: string): Promise<void> {
  const ref = db.collection(ALERTS_COLLECTION).doc(getAlertDocumentId(sourceCollection, sourceId));
  const snapshot = await ref.get();

  if (!snapshot.exists || snapshot.data()?.isActive !== true) {
    return;
  }

  const now = admin.firestore.Timestamp.now();
  await ref.set({
    isActive: false,
    resolvedAt: now,
    updatedAt: now,
    lastEvaluatedAt: now,
  }, { merge: true });
}

async function syncTrackingField(change: functions.Change<FirebaseFirestore.DocumentSnapshot>, options: {
  sourceCollection: SourceCollection;
  getStatus: (data?: FirebaseFirestore.DocumentData | null) => string;
}): Promise<void> {
  const sourceId = String(change.after.exists ? change.after.id : change.before.id);
  const beforeData = change.before.exists ? change.before.data() : null;
  const afterData = change.after.exists ? change.after.data() : null;

  if (!afterData) {
    await resolveAlertDocument(options.sourceCollection, sourceId);
    return;
  }

  const beforeStatus = options.getStatus(beforeData);
  const afterStatus = options.getStatus(afterData);
  const hasTrackingField = isTimestamp(afterData.porContactarStartedAt);
  const now = admin.firestore.Timestamp.now();

  if (!beforeData && afterStatus === POR_CONTACTAR && !hasTrackingField) {
    await change.after.ref.update({ porContactarStartedAt: now });
    return;
  }

  if (beforeStatus !== POR_CONTACTAR && afterStatus === POR_CONTACTAR && !hasTrackingField) {
    await change.after.ref.update({ porContactarStartedAt: now });
    return;
  }

  if (beforeStatus === POR_CONTACTAR && afterStatus !== POR_CONTACTAR) {
    const updates: FirebaseFirestore.DocumentData = {};
    if (afterData.porContactarStartedAt !== undefined) {
      updates.porContactarStartedAt = admin.firestore.FieldValue.delete();
    }

    if (Object.keys(updates).length > 0) {
      await change.after.ref.update(updates);
    }

    await resolveAlertDocument(options.sourceCollection, sourceId);
  }
}

async function collectAlertCandidates(now: Date): Promise<Map<string, AlertCandidate>> {
  const candidates = new Map<string, AlertCandidate>();
  const epoch = admin.firestore.Timestamp.fromMillis(1);

  const [leadSnapshots, applicationSnapshots] = await Promise.all([
    db.collection(LEADS_COLLECTION).where('status', '==', POR_CONTACTAR).get(),
    db.collection(APPLICATIONS_COLLECTION).where('porContactarStartedAt', '>', epoch).get(),
  ]);

  leadSnapshots.forEach((snapshot) => {
    const data = snapshot.data();
    if (!isTimestamp(data.porContactarStartedAt)) return;

    const candidate = buildAlertCandidate({
      sourceCollection: 'leads',
      sourceId: snapshot.id,
      leadId: snapshot.id,
      leadName: getLeadName(data),
      advisorName: getLeadAdvisorName(data),
      origin: getLeadOrigin(data),
      startedAt: data.porContactarStartedAt,
      now,
    });

    if (candidate) {
      candidates.set(candidate.alertId, candidate);
    }
  });

  applicationSnapshots.forEach((snapshot) => {
    const data = snapshot.data();
    if (!isTimestamp(data.porContactarStartedAt)) return;
    if (getApplicationPipelineStatus(data) !== POR_CONTACTAR) return;

    const candidate = buildAlertCandidate({
      sourceCollection: 'applications',
      sourceId: snapshot.id,
      leadId: `crediexpress_${snapshot.id}`,
      leadName: getApplicationLeadName(data),
      advisorName: getApplicationAdvisorName(data),
      origin: getApplicationOrigin(data),
      startedAt: data.porContactarStartedAt,
      now,
    });

    if (candidate) {
      candidates.set(candidate.alertId, candidate);
    }
  });

  return candidates;
}

export const onLeadWriteTrackContactAlerts = functions.firestore
  .document('leads/{leadId}')
  .onWrite(async (change) => {
    await syncTrackingField(change, {
      sourceCollection: 'leads',
      getStatus: getLeadStatus,
    });
  });

export const onApplicationWriteTrackContactAlerts = functions.firestore
  .document('applications/{applicationId}')
  .onWrite(async (change) => {
    await syncTrackingField(change, {
      sourceCollection: 'applications',
      getStatus: getApplicationPipelineStatus,
    });
  });

export const syncLeadContactAlerts = functions.pubsub
  .schedule('every 15 minutes')
  .timeZone('America/Guayaquil')
  .onRun(async () => {
    const now = admin.firestore.Timestamp.now();
    const candidates = await collectAlertCandidates(now.toDate());
    const alertsSnapshot = await db.collection(ALERTS_COLLECTION).get();
    const batch = db.batch();
    const touchedAlertIds = new Set<string>();

    alertsSnapshot.forEach((snapshot) => {
      const data = snapshot.data();

      if (data.alertType !== 'por-contactar') {
        return;
      }

      const candidate = candidates.get(snapshot.id);

      if (!candidate) {
        if (data.isActive === true) {
          batch.set(snapshot.ref, {
            isActive: false,
            resolvedAt: now,
            updatedAt: now,
            lastEvaluatedAt: now,
          }, { merge: true });
        }
        return;
      }

      touchedAlertIds.add(snapshot.id);

      const payload: FirebaseFirestore.SetOptions = { merge: true };
      const update: FirebaseFirestore.DocumentData = {
        alertType: 'por-contactar',
        sourceCollection: candidate.sourceCollection,
        sourceId: candidate.sourceId,
        leadId: candidate.leadId,
        leadName: candidate.leadName,
        advisorName: candidate.advisorName,
        origin: candidate.origin,
        leadStatus: POR_CONTACTAR,
        startedAt: candidate.startedAt,
        currentLevel: candidate.currentLevel,
        badgeLabel: candidate.badgeLabel,
        workingHoursElapsed: candidate.workingHoursElapsed,
        roundedHoursElapsed: candidate.roundedHoursElapsed,
        isActive: true,
        updatedAt: now,
        lastEvaluatedAt: now,
        firstVisibleAt: data.firstVisibleAt || now,
        warningTriggeredAt: data.warningTriggeredAt || now,
        resolvedAt: admin.firestore.FieldValue.delete(),
      };

      if (!data.createdAt) {
        update.createdAt = now;
      }

      if ((candidate.currentLevel === 'overdue' || candidate.currentLevel === 'critical') && !data.overdueTriggeredAt) {
        update.overdueTriggeredAt = now;
      }

      if (candidate.currentLevel === 'critical' && !data.criticalTriggeredAt) {
        update.criticalTriggeredAt = now;
      }

      batch.set(snapshot.ref, update, payload);
    });

    candidates.forEach((candidate) => {
      if (touchedAlertIds.has(candidate.alertId)) {
        return;
      }

      const ref = db.collection(ALERTS_COLLECTION).doc(candidate.alertId);
      const update: FirebaseFirestore.DocumentData = {
        alertType: 'por-contactar',
        sourceCollection: candidate.sourceCollection,
        sourceId: candidate.sourceId,
        leadId: candidate.leadId,
        leadName: candidate.leadName,
        advisorName: candidate.advisorName,
        origin: candidate.origin,
        leadStatus: POR_CONTACTAR,
        startedAt: candidate.startedAt,
        currentLevel: candidate.currentLevel,
        badgeLabel: candidate.badgeLabel,
        workingHoursElapsed: candidate.workingHoursElapsed,
        roundedHoursElapsed: candidate.roundedHoursElapsed,
        isActive: true,
        createdAt: now,
        updatedAt: now,
        lastEvaluatedAt: now,
        firstVisibleAt: now,
        warningTriggeredAt: now,
      };

      if (candidate.currentLevel === 'overdue' || candidate.currentLevel === 'critical') {
        update.overdueTriggeredAt = now;
      }

      if (candidate.currentLevel === 'critical') {
        update.criticalTriggeredAt = now;
      }

      batch.set(ref, update, { merge: true });
    });

    await batch.commit();
    return null;
  });