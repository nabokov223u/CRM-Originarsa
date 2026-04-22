import React, { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, ArrowLeft, CheckCircle, Clock, Users } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { leadAlertsService } from '../services/firestore/leadAlerts';
import { getDateFromTimestampLike } from '../utils/dateTime';
import type { LeadAlert } from '../utils/types';

interface LeadContactAlertsReportProps {
  onBack: () => void;
}

const LEVEL_STYLES: Record<LeadAlert['currentLevel'], string> = {
  warning: 'bg-amber-100 text-amber-800',
  overdue: 'bg-red-100 text-red-700',
  critical: 'bg-red-600 text-white',
};

function formatDateTime(value: unknown): string {
  const date = getDateFromTimestampLike(value);
  if (!date) return '—';

  return new Intl.DateTimeFormat('es-EC', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
}

export const LeadContactAlertsReport: React.FC<LeadContactAlertsReportProps> = ({ onBack }) => {
  const { isAdmin } = useAuth();
  const [alerts, setAlerts] = useState<LeadAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }

    const unsubscribe = leadAlertsService.subscribeToAll((data) => {
      setAlerts(data);
      setLoading(false);
    });

    return () => { unsubscribe(); };
  }, [isAdmin]);

  const breached24hAlerts = useMemo(
    () => alerts.filter((alert) => Boolean(alert.overdueTriggeredAt)),
    [alerts],
  );

  const activeBreached24h = useMemo(
    () => breached24hAlerts.filter((alert) => alert.isActive),
    [breached24hAlerts],
  );

  const activeCritical = useMemo(
    () => activeBreached24h.filter((alert) => alert.currentLevel === 'critical'),
    [activeBreached24h],
  );

  const resolvedAfter24h = useMemo(
    () => breached24hAlerts.filter((alert) => !alert.isActive).length,
    [breached24hAlerts],
  );

  const byAdvisor = useMemo(() => {
    const grouped = breached24hAlerts.reduce<Record<string, { advisorName: string; total: number; active: number; critical: number }>>((accumulator, alert) => {
      const advisorName = (alert.advisorName || 'Sin asignar').trim() || 'Sin asignar';

      if (!accumulator[advisorName]) {
        accumulator[advisorName] = { advisorName, total: 0, active: 0, critical: 0 };
      }

      accumulator[advisorName].total += 1;
      if (alert.isActive) accumulator[advisorName].active += 1;
      if (alert.isActive && alert.currentLevel === 'critical') accumulator[advisorName].critical += 1;

      return accumulator;
    }, {});

    return Object.values(grouped).sort((a, b) => b.total - a.total || a.advisorName.localeCompare(b.advisorName, 'es'));
  }, [breached24hAlerts]);

  const recentBreaches = useMemo(() => {
    return [...breached24hAlerts]
      .sort((a, b) => (getDateFromTimestampLike(b.overdueTriggeredAt)?.getTime() || 0) - (getDateFromTimestampLike(a.overdueTriggeredAt)?.getTime() || 0))
      .slice(0, 12);
  }, [breached24hAlerts]);

  const detailedBreaches = useMemo(() => {
    return [...breached24hAlerts]
      .sort((a, b) => (getDateFromTimestampLike(b.overdueTriggeredAt)?.getTime() || 0) - (getDateFromTimestampLike(a.overdueTriggeredAt)?.getTime() || 0));
  }, [breached24hAlerts]);

  if (!isAdmin) {
    return (
      <div className="space-y-6 max-w-[1400px] mx-auto">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al centro de informes
        </button>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 text-center">
          <h2 className="text-lg font-semibold text-primary">Informe restringido</h2>
          <p className="text-sm text-slate-500 mt-2">
            Este informe de SLA de contacto está disponible solo para administradores.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6 max-w-[1400px] mx-auto">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al centro de informes
        </button>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 text-center text-slate-500">
          Cargando informe de alertas...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-primary transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver al centro de informes
      </button>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-xl font-semibold text-primary">SLA de Primer Contacto</h2>
            <p className="text-sm text-slate-500 mt-1">
              Seguimiento backend de leads que superan 24 horas útiles en Por Contactar.
            </p>
          </div>
          <span className="inline-flex items-center rounded-full bg-amber-50 text-amber-700 px-3 py-1 text-xs font-semibold">
            Sin retroactivos: solo cuenta desde la activación del sistema o reingreso a Por Contactar
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-500" />
            </div>
            <span className="text-xs font-medium uppercase tracking-wider text-slate-500">Leads que pasaron 24h</span>
          </div>
          <p className="text-3xl font-bold text-primary">{breached24hAlerts.length}</p>
          <p className="text-[11px] text-slate-400 mt-1">acumulado desde la activación</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <span className="text-xs font-medium uppercase tracking-wider text-slate-500">24h+ activas</span>
          </div>
          <p className="text-3xl font-bold text-primary">{activeBreached24h.length}</p>
          <p className="text-[11px] text-slate-400 mt-1">siguen en Por Contactar</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
              <Users className="w-5 h-5 text-red-600" />
            </div>
            <span className="text-xs font-medium uppercase tracking-wider text-slate-500">Críticas 48h+</span>
          </div>
          <p className="text-3xl font-bold text-primary">{activeCritical.length}</p>
          <p className="text-[11px] text-slate-400 mt-1">requieren escalamiento inmediato</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-secondary-light flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-secondary" />
            </div>
            <span className="text-xs font-medium uppercase tracking-wider text-slate-500">Resueltas tras 24h</span>
          </div>
          <p className="text-3xl font-bold text-primary">{resolvedAfter24h}</p>
          <p className="text-[11px] text-slate-400 mt-1">salieron de Por Contactar después de vencer</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h3 className="text-sm font-semibold text-primary mb-4">Leads que superaron 24h por asesor</h3>
          {byAdvisor.length === 0 ? (
            <p className="text-sm text-slate-400">Todavía no hay brechas de 24h registradas.</p>
          ) : (
            <div className="space-y-3">
              {byAdvisor.map((advisor) => (
                <div key={advisor.advisorName} className="flex items-center justify-between gap-4 rounded-xl border border-slate-100 px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-primary">{advisor.advisorName}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{advisor.active} activas, {advisor.critical} críticas</p>
                  </div>
                  <span className="text-lg font-bold text-primary">{advisor.total}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h3 className="text-sm font-semibold text-primary mb-4">Últimos leads que superaron 24h</h3>
          {recentBreaches.length === 0 ? (
            <p className="text-sm text-slate-400">Todavía no hay leads que hayan superado 24 horas útiles.</p>
          ) : (
            <div className="space-y-3">
              {recentBreaches.map((alert) => (
                <div key={alert.id} className="rounded-xl border border-slate-100 px-4 py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-primary">{alert.leadName}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{alert.advisorName || 'Sin asignar'} · {alert.origin || 'Sin origen'}</p>
                    </div>
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${LEVEL_STYLES[alert.currentLevel]}`}>
                      {alert.badgeLabel}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3 mt-3 text-xs text-slate-500">
                    <span>Superó 24h: {formatDateTime(alert.overdueTriggeredAt)}</span>
                    <span>{alert.isActive ? 'Activa' : `Resuelta ${formatDateTime(alert.resolvedAt)}`}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h3 className="text-sm font-semibold text-primary mb-4">Detalle de Leads que Superaron 24h</h3>
        {detailedBreaches.length === 0 ? (
          <p className="text-sm text-slate-400">Todavía no hay leads con brechas de 24h para detallar.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100">
              <thead>
                <tr className="text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  <th className="py-3 pr-4">Lead</th>
                  <th className="py-3 pr-4">Asesor a Cargo</th>
                  <th className="py-3 pr-4">Origen</th>
                  <th className="py-3 pr-4">SLA</th>
                  <th className="py-3 pr-4">Horas Útiles</th>
                  <th className="py-3 pr-4">Superó 24h</th>
                  <th className="py-3">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {detailedBreaches.map((alert) => (
                  <tr key={alert.id} className="text-sm text-slate-600">
                    <td className="py-3 pr-4 font-medium text-primary">{alert.leadName}</td>
                    <td className="py-3 pr-4">{alert.advisorName || 'Sin asignar'}</td>
                    <td className="py-3 pr-4">{alert.origin || 'Sin origen'}</td>
                    <td className="py-3 pr-4">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${LEVEL_STYLES[alert.currentLevel]}`}>
                        {alert.badgeLabel}
                      </span>
                    </td>
                    <td className="py-3 pr-4">{alert.roundedHoursElapsed}h</td>
                    <td className="py-3 pr-4">{formatDateTime(alert.overdueTriggeredAt)}</td>
                    <td className="py-3">
                      {alert.isActive ? 'Activa' : `Resuelta ${formatDateTime(alert.resolvedAt)}`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};