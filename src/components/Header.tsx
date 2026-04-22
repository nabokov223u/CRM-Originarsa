import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AlertTriangle, Bell, Clock3, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { leadAlertsService } from '../services/firestore/leadAlerts';
import { getDateFromTimestampLike } from '../utils/dateTime';
import { getVisibleLeadAlerts } from '../utils/leadAlerts';
import type { LeadAlert } from '../utils/types';

interface HeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
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
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle, actions }) => {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [activeAlerts, setActiveAlerts] = useState<LeadAlert[]>([]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const notificationsRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const unsubscribe = leadAlertsService.subscribeToActive((alerts) => {
      setActiveAlerts(alerts);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!notificationsRef.current?.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
    };
  }, []);

  const visibleAlerts = useMemo(() => {
    const alerts = getVisibleLeadAlerts(activeAlerts, { isAdmin, viewerName: user?.displayName || null });
    const severityOrder: Record<LeadAlert['currentLevel'], number> = {
      critical: 0,
      overdue: 1,
      warning: 2,
    };

    return [...alerts].sort((a, b) => {
      const severityDiff = severityOrder[a.currentLevel] - severityOrder[b.currentLevel];
      if (severityDiff !== 0) return severityDiff;
      const aTime = getDateFromTimestampLike(a.updatedAt)?.getTime() || 0;
      const bTime = getDateFromTimestampLike(b.updatedAt)?.getTime() || 0;
      return bTime - aTime;
    });
  }, [activeAlerts, isAdmin, user?.displayName]);

  const notificationsBadge = visibleAlerts.length > 99 ? '99+' : String(visibleAlerts.length);
  const overdueCount = visibleAlerts.filter((alert) => alert.currentLevel !== 'warning').length;

  return (
    <div className="bg-white border-b border-gray-100 px-8 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-primary">{title}</h1>
          {subtitle && <p className="text-sm text-gray-400 mt-0.5">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-3">
          {actions && <div className="flex gap-2">{actions}</div>}
          <button className="p-2 rounded-lg hover:bg-gray-50 text-gray-400 transition-colors">
            <Search className="w-4 h-4" />
          </button>
          <div className="relative" ref={notificationsRef}>
            <button
              onClick={() => setIsNotificationsOpen((prev) => !prev)}
              className="p-2 rounded-lg hover:bg-gray-50 text-gray-400 transition-colors relative"
              aria-label="Abrir notificaciones"
            >
              <Bell className="w-4 h-4" />
              {visibleAlerts.length > 0 ? (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-secondary text-white rounded-full text-[10px] font-semibold flex items-center justify-center">
                  {notificationsBadge}
                </span>
              ) : (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-gray-200 rounded-full"></span>
              )}
            </button>

            {isNotificationsOpen && (
              <div className="absolute right-0 top-full mt-3 w-[380px] bg-white border border-gray-100 rounded-2xl shadow-xl z-50 overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/70">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-semibold text-primary">Notificaciones</h3>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {isAdmin
                          ? `${overdueCount} alertas visibles para administración`
                          : `${visibleAlerts.length} alertas visibles para tu bandeja`}
                      </p>
                    </div>
                    {visibleAlerts.length > 0 && (
                      <span className="inline-flex items-center rounded-full bg-primary-light text-primary px-2.5 py-1 text-[10px] font-semibold">
                        {visibleAlerts.length} activas
                      </span>
                    )}
                  </div>
                </div>

                <div className="max-h-[420px] overflow-y-auto">
                  {visibleAlerts.length === 0 ? (
                    <div className="px-5 py-10 text-center">
                      <div className="w-12 h-12 rounded-2xl bg-gray-50 text-gray-300 flex items-center justify-center mx-auto mb-3">
                        <Bell className="w-5 h-5" />
                      </div>
                      <p className="text-sm font-medium text-primary">Sin alertas activas</p>
                      <p className="text-xs text-gray-400 mt-1">Cuando un lead entre en SLA aparecerá aquí.</p>
                    </div>
                  ) : (
                    <div className="p-3 space-y-2">
                      {visibleAlerts.slice(0, 8).map((alert) => (
                        <button
                          key={alert.id}
                          onClick={() => {
                            setIsNotificationsOpen(false);
                            navigate('/leads');
                          }}
                          className="w-full text-left rounded-xl border border-gray-100 hover:border-secondary/30 hover:bg-gray-50 px-4 py-3 transition-colors"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 mb-1.5">
                                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${LEVEL_STYLES[alert.currentLevel]}`}>
                                  {alert.badgeLabel}
                                </span>
                                <span className="text-[11px] text-gray-400">{alert.roundedHoursElapsed}h útiles</span>
                              </div>
                              <p className="text-sm font-medium text-primary truncate">{alert.leadName}</p>
                              <p className="text-xs text-gray-400 mt-1 truncate">
                                {isAdmin ? `Asesor: ${alert.advisorName || 'Sin asignar'} · ` : ''}
                                {alert.origin || 'Sin origen'}
                              </p>
                            </div>
                            <div className="shrink-0 text-[11px] text-gray-400 flex items-center gap-1">
                              {alert.currentLevel === 'critical' ? <AlertTriangle className="w-3.5 h-3.5 text-red-500" /> : <Clock3 className="w-3.5 h-3.5" />}
                              {formatDateTime(alert.firstVisibleAt || alert.updatedAt)}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="px-4 py-3 border-t border-gray-100 bg-gray-50/70 flex items-center justify-between gap-2">
                  <button
                    onClick={() => {
                      setIsNotificationsOpen(false);
                      navigate('/leads');
                    }}
                    className="text-sm font-medium text-primary hover:text-secondary transition-colors"
                  >
                    Ver gestión de leads
                  </button>
                  {isAdmin && (
                    <button
                      onClick={() => {
                        setIsNotificationsOpen(false);
                        navigate('/informes');
                      }}
                      className="text-sm font-medium text-secondary hover:text-secondary-hover transition-colors"
                    >
                      Ver informe SLA
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
