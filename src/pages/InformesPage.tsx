import React, { useMemo, useState } from 'react';
import { ShieldCheck, ChevronRight, Database, TrendingUp, Users, Clock, AlertTriangle } from 'lucide-react';
import { CalidadDatosReport } from '../components/CalidadDatosReport';
import { LeadContactAlertsReport } from '../components/LeadContactAlertsReport';
import { useAuth } from '../hooks/useAuth';

type ReportView = 'hub' | 'calidad-datos' | 'sla-contacto';

interface ReportTemplate {
  id: ReportView;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  iconBg: string;
  status: 'activo' | 'próximamente';
  adminOnly?: boolean;
}

const REPORTS: ReportTemplate[] = [
  {
    id: 'calidad-datos',
    title: 'Auditoría de Calidad de Datos',
    description: 'Cruce automático BPM ↔ Data Warehouse. Detecta errores en datos de contacto, duplicados y datos basura.',
    icon: ShieldCheck,
    color: 'text-secondary',
    iconBg: 'bg-secondary/10',
    status: 'activo',
  },
  {
    id: 'sla-contacto',
    title: 'SLA de Primer Contacto',
    description: 'Informe admin con la cantidad de leads que superaron 24 horas útiles en Por Contactar y su distribución por asesor.',
    icon: AlertTriangle,
    color: 'text-red-600',
    iconBg: 'bg-red-50',
    status: 'activo',
    adminOnly: true,
  },
  {
    id: 'hub',
    title: 'Rendimiento Comercial',
    description: 'Métricas de conversión por asesor, tiempos de respuesta y pipeline de ventas.',
    icon: TrendingUp,
    color: 'text-primary',
    iconBg: 'bg-primary-light',
    status: 'próximamente',
  },
  {
    id: 'hub',
    title: 'Trazabilidad de Leads',
    description: 'Seguimiento completo del ciclo de vida de cada lead desde origen hasta cierre.',
    icon: Users,
    color: 'text-violet-600',
    iconBg: 'bg-violet-50',
    status: 'próximamente',
  },
  {
    id: 'hub',
    title: 'Historial de Operaciones',
    description: 'Log de acciones del equipo: cambios de estado, asignaciones y notas.',
    icon: Clock,
    color: 'text-amber-600',
    iconBg: 'bg-amber-50',
    status: 'próximamente',
  },
];

export const InformesPage: React.FC = () => {
  const { isAdmin } = useAuth();
  const [activeView, setActiveView] = useState<ReportView>('hub');

  const visibleReports = useMemo(
    () => REPORTS.filter((report) => !report.adminOnly || isAdmin),
    [isAdmin],
  );

  if (activeView === 'calidad-datos') {
    return <CalidadDatosReport onBack={() => setActiveView('hub')} />;
  }

  if (activeView === 'sla-contacto') {
    return <LeadContactAlertsReport onBack={() => setActiveView('hub')} />;
  }

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto">
      {/* Hero Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Database className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-xl font-semibold text-primary">Centro de Informes</h2>
        </div>
        <p className="text-sm text-gray-400 mt-2 ml-11">
          Selecciona un informe para generar reportes y auditorías sobre los datos del CRM.
        </p>
      </div>

      {/* Report Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {visibleReports.map((report, idx) => {
          const Icon = report.icon;
          const isActive = report.status === 'activo';
          return (
            <button
              key={idx}
              onClick={() => isActive && setActiveView(report.id)}
              disabled={!isActive}
              className={`group relative bg-white rounded-xl border text-left p-6 transition-all duration-200 ${
                isActive
                  ? 'border-gray-100 shadow-sm hover:shadow-md hover:border-secondary/40 cursor-pointer'
                  : 'border-gray-50 opacity-60 cursor-not-allowed'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`${report.iconBg} p-3 rounded-xl shrink-0`}>
                  <Icon className={`w-6 h-6 ${report.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <h3 className="font-semibold text-slate-800 text-base">{report.title}</h3>
                    {report.status === 'próximamente' && (
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                        Próximamente
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-500 leading-relaxed">{report.description}</p>
                </div>
                {isActive && (
                  <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-secondary group-hover:translate-x-0.5 transition-all shrink-0 mt-1" />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
