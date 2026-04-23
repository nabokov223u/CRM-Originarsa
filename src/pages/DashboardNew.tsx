import React, { useState, useEffect, useMemo } from 'react';
import { Lead, LeadAlert } from '../utils/types';
import { unifiedLeadsService } from '../services/unifiedLeads';
import { applicationsService, type Application } from '../services/firestore/applications';
import { leadAlertsService } from '../services/firestore/leadAlerts';
import { useAuth } from '../hooks/useAuth';
import { getApplicationCampaign, getLeadCampaign, sortCampaignNames } from '../utils/campaigns';
import { isExcludedCrmUserName } from '../utils/crmUsers';
import { formatCalendarDayInEcuador, getDateKeyInEcuador, getLeadEntryDate, getLeadEntryDateKey, getLeadEntryTimestamp, parseEcuadorDateInput, parseStoredDateTime } from '../utils/dateTime';
import { getVisibleLeadAlerts } from '../utils/leadAlerts';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import {
  Users, TrendingUp, DollarSign, Target, Clock,
  AlertTriangle, Tag, TrendingDown, UserX, Calendar,
  ChevronRight, Filter, X, CheckCircle, XCircle, Hourglass,
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════
   DESIGN TOKENS
   ═══════════════════════════════════════════════════════════════ */
const C = {
  // Brand
  brand:     '#0d234a',
  brandMid:  '#1a3a6a',
  brandLight:'#e8edf4',
  brandBg:   '#f0f4f8',
  mint:      '#08bd8f',
  mintMid:   '#06a37b',
  mintLight: '#e6f9f3',
  mintBg:    '#edfaf6',
  // Neutral
  slate500:  '#64748b',
  slate300:  '#cbd5e1',
  slate100:  '#f1f5f9',
  slate50:   '#f8fafc',
  // Status accents (non-brand)
  amber500:  '#f59e0b',
  amber100:  '#fef3c7',
  amber50:   '#fffbeb',
  indigo500: '#6366f1',
  indigo100: '#e0e7ff',
  red500:    '#ef4444',
  red100:    '#fee2e2',
  red50:     '#fef2f2',
  // Chart extras
  violet500: '#8b5cf6',
  sky500:    '#0ea5e9',
  gray300:   '#d1d5db',
  gray400:   '#9ca3af',
  white:     '#ffffff',
};

const PIE_COLORS = [C.brand, C.mint, C.amber500, C.indigo500, C.red500, C.violet500, C.sky500, C.slate500];

const STATUS_BG: Record<string, string> = {
  'Por Contactar': 'bg-primary-light text-primary',
  'Seguimiento': 'bg-amber-50 text-amber-700',
  'Por Facturar': 'bg-violet-50 text-violet-700',
  'Facturado': 'bg-secondary-light text-secondary',
  'Caido': 'bg-red-50 text-red-700',
  'No Contactado': 'bg-gray-100 text-gray-600',
};

/* ═══════════════════════════════════════════════════════════════
   REUSABLE SUB-COMPONENTS
   ═══════════════════════════════════════════════════════════════ */

// Section header with optional right content
const SectionHeader: React.FC<{ title: string; subtitle?: string; right?: React.ReactNode }> = ({ title, subtitle, right }) => (
  <div className="flex items-end justify-between mb-5">
    <div>
      <h2 className="text-lg font-semibold text-primary tracking-tight">{title}</h2>
      {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
    </div>
    {right}
  </div>
);

// Hero KPI card with ring sparkline
interface HeroCardProps {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  value: string | number;
  percent?: number;
  ringColor?: string;
  change?: number;
  changeLabel?: string;
  sub?: string;
}

const HeroCard: React.FC<HeroCardProps> = ({ icon, iconBg, label, value, percent, ringColor, change, changeLabel, sub }) => {
  const isPositive = change !== undefined && change >= 0;
  const ringData = percent !== undefined ? [{ v: percent }, { v: Math.max(0, 100 - percent) }] : null;
  return (
    <div className="group bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-lg hover:border-secondary/30 transition-all duration-300 cursor-default">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className={`inline-flex items-center justify-center w-9 h-9 rounded-xl ${iconBg} mb-3`}>
            {icon}
          </div>
          <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">{label}</p>
          <p className="text-2xl font-bold text-primary mt-1 tracking-tight">{value}</p>
          {change !== undefined && (
            <div className="flex items-center mt-2 gap-1.5">
              <span className={`inline-flex items-center gap-0.5 text-[11px] font-semibold px-1.5 py-0.5 rounded-full ${isPositive ? 'bg-secondary-light text-secondary' : 'bg-red-50 text-red-600'}`}>
                {isPositive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                {Math.abs(change)}%
              </span>
              {changeLabel && <span className="text-[11px] text-slate-400">{changeLabel}</span>}
            </div>
          )}
          {sub && <p className="text-[11px] text-slate-400 mt-1.5">{sub}</p>}
        </div>
        {ringData && ringColor && (
          <div className="relative w-14 h-14 shrink-0 ml-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={ringData} cx="50%" cy="50%" innerRadius={20} outerRadius={27} startAngle={90} endAngle={-270} dataKey="v" strokeWidth={0}>
                  <Cell fill={ringColor} />
                  <Cell fill={C.slate100} />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[9px] font-bold" style={{ color: ringColor }}>{percent}%</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Alert badge
const AlertBadge: React.FC<{ icon: React.ReactNode; label: string; value: number; color: string; bgColor: string; desc: string; href?: string }> = ({ icon, label, value, color, bgColor, desc, href }) => (
  <div className={`flex items-center gap-4 ${bgColor} rounded-2xl p-5 border border-transparent hover:shadow-md transition-all duration-300`}>
    <div className={`w-12 h-12 rounded-xl ${color} bg-white/80 flex items-center justify-center shadow-sm`}>
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[11px] font-medium uppercase tracking-wider opacity-70">{label}</p>
      <p className="text-2xl font-bold mt-0.5">{value}</p>
      <p className="text-[11px] opacity-60 mt-0.5">{desc}</p>
    </div>
    {href && (
      <a href={href} className="w-8 h-8 rounded-lg bg-white/50 hover:bg-white flex items-center justify-center transition-colors">
        <ChevronRight size={16} />
      </a>
    )}
  </div>
);

// Custom Recharts tooltip
const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-primary text-white rounded-lg shadow-xl px-3 py-2 text-xs border border-primary">
      {label && <p className="font-medium text-slate-300 mb-1 text-[10px] uppercase">{label}</p>}
      {payload.map((p: any, i: number) => (
        <p key={i} className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full inline-block" style={{ background: p.color || p.fill }} />
          {p.name}: <strong className="text-white">{p.value}</strong>
        </p>
      ))}
    </div>
  );
};

const renderPieLabel = ({ name, percent }: any) =>
  percent > 0.06 ? `${name} ${(percent * 100).toFixed(0)}%` : '';

/* ═══════════════════════════════════════════════════════════════
   MAIN DASHBOARD
   ═══════════════════════════════════════════════════════════════ */

interface DashboardProps {
  leads?: Lead[];
}

export const Dashboard: React.FC<DashboardProps> = ({ leads: externalLeads }) => {
  const { user, isAdmin } = useAuth();
  const [allLeads, setAllLeads] = useState<Lead[]>(externalLeads || []);
  const [loading, setLoading] = useState(!externalLeads);
  const [rawApplications, setRawApplications] = useState<Application[]>([]);
  const [activeAlerts, setActiveAlerts] = useState<LeadAlert[]>([]);
  const [selectedAsesor, setSelectedAsesor] = useState<string>('todos');
  const [selectedCampaign, setSelectedCampaign] = useState<string>('todas');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [diasTendencia, setDiasTendencia] = useState(30);

  useEffect(() => {
    if (!externalLeads) {
      setLoading(true);
      const unsubscribe = unifiedLeadsService.subscribeToAllLeads((data) => {
        setAllLeads(data);
        setLoading(false);
      });
      return () => { unsubscribe(); };
    } else {
      setAllLeads(externalLeads);
    }
  }, [externalLeads]);

  useEffect(() => {
    const unsubscribe = applicationsService.subscribeToAllRaw((apps) => {
      setRawApplications(apps);
    });
    return () => { unsubscribe(); };
  }, []);

  useEffect(() => {
    const unsubscribe = leadAlertsService.subscribeToActive((alerts) => {
      setActiveAlerts(alerts);
    });
    return () => { unsubscribe(); };
  }, []);

  const normalize = (str: string) => str.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const hasCrmPipelineStatus = (application: Application) => Boolean((application.crmStatus || '').trim());

  const asesoresUnicos = useMemo(() => {
    const set = new Set<string>();
    allLeads.forEach((lead) => {
      const advisorName = lead.asesor?.trim();
      if (advisorName && !isExcludedCrmUserName(advisorName)) {
        set.add(advisorName);
      }
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'es'));
  }, [allLeads]);

  const leads = useMemo(() => {
    if (isAdmin) {
      if (selectedAsesor === 'todos') return allLeads;
      return allLeads.filter(lead => normalize((lead.asesor || '').trim()) === normalize(selectedAsesor));
    }
    const name = user?.displayName?.trim();
    if (!name) return [];
    const nn = normalize(name);
    return allLeads.filter(lead => {
      const a = (lead.asesor || '').trim();
      return a && normalize(a) === nn;
    });
  }, [allLeads, isAdmin, user?.displayName, selectedAsesor]);

  const campaignsUnicas = useMemo(() => {
    const set = new Set<string>();
    leads.forEach((lead) => set.add(getLeadCampaign(lead)));
    return sortCampaignNames(Array.from(set));
  }, [leads]);

  useEffect(() => {
    if (selectedCampaign !== 'todas' && !campaignsUnicas.includes(selectedCampaign)) {
      setSelectedCampaign('todas');
    }
  }, [campaignsUnicas, selectedCampaign]);

  const campaignLeads = useMemo(() => {
    if (selectedCampaign === 'todas') return leads;
    return leads.filter((lead) => getLeadCampaign(lead) === selectedCampaign);
  }, [leads, selectedCampaign]);

  const visibleApplications = useMemo(() => {
    if (isAdmin) {
      if (selectedAsesor === 'todos') return rawApplications;
      return rawApplications.filter((application) => normalize((application.asesor || 'Telemarketing').trim()) === normalize(selectedAsesor));
    }

    const name = user?.displayName?.trim();
    if (!name) return [];

    const normalizedName = normalize(name);
    return rawApplications.filter((application) => normalize((application.asesor || 'Telemarketing').trim()) === normalizedName);
  }, [rawApplications, isAdmin, user?.displayName, selectedAsesor]);

  const campaignApplications = useMemo(() => {
    if (selectedCampaign === 'todas') return visibleApplications;
    return visibleApplications.filter((application) => getApplicationCampaign(application) === selectedCampaign);
  }, [visibleApplications, selectedCampaign]);

  const leadsFiltered = useMemo(() => {
    if (!dateFrom && !dateTo) return campaignLeads;
    const from = parseEcuadorDateInput(dateFrom);
    const to = parseEcuadorDateInput(dateTo, true);

    return campaignLeads.filter(l => {
      const f = getLeadEntryDate(l);
      if (!f) return false;
      if (from && f < from) return false;
      if (to && f > to) return false;
      return true;
    });
  }, [campaignLeads, dateFrom, dateTo]);

  /* ── Metrics ── */
  const leadsPorEstado = {
    porContactar: leadsFiltered.filter(l => l.status === 'Por Contactar').length,
    porFacturar: leadsFiltered.filter(l => l.status === 'Por Facturar').length,
    seguimiento: leadsFiltered.filter(l => l.status === 'Seguimiento').length,
    facturado: leadsFiltered.filter(l => l.status === 'Facturado').length,
    caido: leadsFiltered.filter(l => l.status === 'Caido').length,
    noContactado: leadsFiltered.filter(l => l.status === 'No Contactado').length,
  };

  const leadsActivos = leadsFiltered.filter(l => l.status !== 'Caido').length;

  const tasaConversion = leadsFiltered.length > 0
    ? Math.round((leadsPorEstado.facturado / leadsFiltered.length) * 100) : 0;

  const valorPipeline = leadsFiltered.filter(l => l.status !== 'Caido').reduce((s, l) => s + (l.vehicleAmount || 0), 0);
  const valorPorFacturar = leadsFiltered.filter(l => l.status === 'Por Facturar').reduce((s, l) => s + (l.vehicleAmount || 0), 0);
  const valorGanados = leadsFiltered.filter(l => l.status === 'Facturado').reduce((s, l) => s + (l.montoFinal || l.vehicleAmount || 0), 0);
  const leadsUrgentes = leadsFiltered.filter(l => l.status === 'Por Contactar' && l.prioridad === 'Alta').length;
  const leadsEnFacturacion = leadsPorEstado.porFacturar + leadsPorEstado.facturado;
  const tasaConvertibilidad = leadsEnFacturacion > 0
    ? Math.round((leadsPorEstado.facturado / leadsEnFacturacion) * 100)
    : 0;
  const visibleLeadIds = useMemo(() => new Set(leadsFiltered.map((lead) => lead.id)), [leadsFiltered]);
  const visibleContactAlerts = useMemo(() => {
    return getVisibleLeadAlerts(activeAlerts, { isAdmin, viewerName: user?.displayName || null })
      .filter((alert) => visibleLeadIds.has(alert.leadId));
  }, [activeAlerts, isAdmin, user?.displayName, visibleLeadIds]);
  const alertasContacto = visibleContactAlerts.length;
  const alertasCriticas = visibleContactAlerts.filter((alert) => alert.currentLevel === 'critical').length;
  const alertasVencidas = visibleContactAlerts.filter((alert) => alert.currentLevel !== 'warning').length;

  const ticketPromedio = leadsActivos > 0 ? Math.round(valorPipeline / leadsActivos) : 0;
  const tiempoPromedioCierre = useMemo(() => {
    const f = leadsFiltered.filter((lead) => lead.status === 'Facturado' && lead.fechaCierre && getLeadEntryDate(lead));
    if (!f.length) return null;
    return Math.round(f.reduce((sum, lead) => {
      const createdAt = getLeadEntryDate(lead);
      const closedAt = parseStoredDateTime(lead.fechaCierre);
      if (!createdAt || !closedAt) return sum;
      return sum + Math.max(0, Math.ceil((closedAt.getTime() - createdAt.getTime()) / 86400000));
    }, 0) / f.length);
  }, [leadsFiltered]);

  const tasaCaida = leadsFiltered.length > 0 ? Math.round((leadsPorEstado.caido / leadsFiltered.length) * 100) : 0;

  /* ── Approval rate metrics (CrediExpress) ──
     application.status = decisión crediticia original
     application.crmStatus = estado comercial dentro del CRM
     Los registros legacy que llegaron al CRM y luego cayeron no deben dejar de contar como aprobados. */
  const approvalStats = useMemo(() => {
    const crediexpress = campaignApplications.filter((application) => getApplicationCampaign(application) === 'CrediExpress');
    const total = crediexpress.length;
    const aprobados = crediexpress.filter(a => a.status === 'approved' || hasCrmPipelineStatus(a)).length;
    const rechazados = crediexpress.filter(a => !hasCrmPipelineStatus(a) && (a.status === 'rejected' || a.status === 'denied')).length;
    const pendientes = crediexpress.filter(a => !hasCrmPipelineStatus(a) && (a.status === 'pending' || a.status === 'review')).length;
    const tasaAprobacion = total > 0 ? Math.round((aprobados / total) * 100) : 0;
    return { total, aprobados, rechazados, pendientes, tasaAprobacion };
  }, [campaignApplications]);

  const cutoff7 = new Date(); cutoff7.setDate(cutoff7.getDate() - 7);
  const leadsOlvidados = leadsFiltered.filter(l => {
    if (['Facturado', 'Caido'].includes(l.status)) return false;
    if (!l.fechaUltimoContacto) return true;
    return new Date(l.fechaUltimoContacto) < cutoff7;
  }).length;

  /* ── Period comparison ── */
  const periodComparison = useMemo(() => {
    const now = new Date();
    const leadTimestamps = campaignLeads.map(getLeadEntryTimestamp).filter((timestamp) => timestamp > 0);
    const earliestLeadDate = leadTimestamps.length > 0 ? new Date(Math.min(...leadTimestamps)) : now;

    if (dateFrom || dateTo) {
      const from = dateFrom ? (parseEcuadorDateInput(dateFrom) || earliestLeadDate) : earliestLeadDate;
      const to = dateTo ? (parseEcuadorDateInput(dateTo, true) || now) : now; to.setHours(23, 59, 59, 999);
      const days = Math.max(1, Math.ceil((to.getTime() - from.getTime()) / 86400000));
      const pf = new Date(from); pf.setDate(pf.getDate() - days);
      const pt = new Date(from); pt.setDate(pt.getDate() - 1); pt.setHours(23, 59, 59, 999);
      return campaignLeads.filter((lead) => {
        const d = getLeadEntryDate(lead);
        return Boolean(d && d >= pf && d <= pt);
      });
    }
    const ms = new Date(now.getFullYear(), now.getMonth(), 1);
    const ps = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const pe = new Date(ms); pe.setDate(pe.getDate() - 1); pe.setHours(23, 59, 59, 999);
    return campaignLeads.filter((lead) => {
      const d = getLeadEntryDate(lead);
      return Boolean(d && d >= ps && d <= pe);
    });
  }, [campaignLeads, dateFrom, dateTo]);

  const calcChange = (cur: number, prev: number): number | undefined => {
    if (!prev && !cur) return undefined;
    if (!prev) return cur > 0 ? 100 : undefined;
    return Math.round(((cur - prev) / prev) * 100);
  };
  const prevTotal = periodComparison.length;
  const prevPorFacturar = periodComparison.filter(l => l.status === 'Por Facturar').length;
  const prevFacturados = periodComparison.filter(l => l.status === 'Facturado').length;
  const prevLeadsEnFacturacion = prevPorFacturar + prevFacturados;
  const prevTasaConvertibilidad = prevLeadsEnFacturacion > 0 ? Math.round((prevFacturados / prevLeadsEnFacturacion) * 100) : 0;
  const prevTasaConversion = prevTotal > 0 ? Math.round((prevFacturados / prevTotal) * 100) : 0;

  const changeTotal = calcChange(leadsFiltered.length, prevTotal);
  const changeConvertibilidad = calcChange(tasaConvertibilidad, prevTasaConvertibilidad);
  const changeConversion = calcChange(tasaConversion, prevTasaConversion);

  /* ── Chart Data ── */
  const dataFuente = useMemo(() => {
    const c: Record<string, number> = {};
    leadsFiltered.forEach((lead) => {
      const campaign = getLeadCampaign(lead);
      c[campaign] = (c[campaign] || 0) + 1;
    });
    return Object.entries(c).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [leadsFiltered]);

  const dataTendenciaDiaria = useMemo(() => {
    const hoy = new Date(); hoy.setHours(23, 59, 59, 999);
    const inicio = new Date(); inicio.setDate(inicio.getDate() - diasTendencia + 1); inicio.setHours(0, 0, 0, 0);
    const days: { name: string; date: string; CrediExpress: number; 'Aprobados en Vivo': number; Otros: number }[] = [];
    const cur = new Date(inicio);
    while (cur <= hoy) {
      days.push({ name: formatCalendarDayInEcuador(cur), date: getDateKeyInEcuador(cur), CrediExpress: 0, 'Aprobados en Vivo': 0, Otros: 0 });
      cur.setDate(cur.getDate() + 1);
    }
    campaignLeads.forEach((lead) => {
      const fe = getLeadEntryDateKey(lead);
      if (!fe) return;
      const d = days.find(x => x.date === fe);
      if (!d) return;
      const campaign = getLeadCampaign(lead);
      if (campaign === 'CrediExpress') d.CrediExpress++;
      else if (campaign === 'Aprobados en Vivo') d['Aprobados en Vivo']++;
      else d.Otros++;
    });
    return days;
  }, [campaignLeads, diasTendencia]);

  const showApprovalStats = selectedCampaign === 'todas' || selectedCampaign === 'CrediExpress';

  const dataAsesor = useMemo(() => {
    if (!isAdmin) return [];
    const m: Record<string, Record<string, number>> = {};
    leadsFiltered.forEach(l => {
      const a = (l.asesor || 'Sin asignar').trim();
      if (!m[a]) m[a] = {};
      m[a][l.status] = (m[a][l.status] || 0) + 1;
    });
    return Object.entries(m).map(([name, st]) => ({
      name: name.length > 18 ? name.slice(0, 18) + '…' : name,
      Facturado: st['Facturado'] || 0, Seguimiento: st['Seguimiento'] || 0,
      'Por Contactar': st['Por Contactar'] || 0, 'Por Facturar': st['Por Facturar'] || 0, Caido: st['Caido'] || 0,
      total: Object.values(st).reduce((s, v) => s + v, 0),
    })).sort((a, b) => b.total - a.total);
  }, [leadsFiltered, isAdmin]);

  const dataMotivoPerdida = useMemo(() => {
    const c: Record<string, number> = {};
    leadsFiltered.filter(l => l.status === 'Caido').forEach(l => {
      const m = l.motivoPerdida || l.etiqueta || 'Sin especificar';
      c[m] = (c[m] || 0) + 1;
    });
    return Object.entries(c).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [leadsFiltered]);

  const leadsRecientes = useMemo(() =>
    [...leadsFiltered].sort((a, b) => getLeadEntryTimestamp(b) - getLeadEntryTimestamp(a)).slice(0, 5),
  [leadsFiltered]);

  const fmt = (n: number) => new Intl.NumberFormat('es-EC', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(n);

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-secondary border-t-transparent mx-auto mb-3" />
          <p className="text-slate-400 text-sm">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  /* ═══════════════════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════════════════ */
  return (
    <div className="space-y-8 pb-8">

      {/* ─── Global Filters Bar ─── */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Asesor filter (admin) */}
        {isAdmin && (
          <div className="flex items-center gap-2 bg-white rounded-xl border border-slate-200 px-3 py-2 shadow-sm">
            <Filter size={14} className="text-slate-400" />
            <select
              value={selectedAsesor}
              onChange={(e) => setSelectedAsesor(e.target.value)}
              className="text-sm bg-transparent border-none outline-none text-slate-700 pr-6 cursor-pointer"
            >
              <option value="todos">Todos los asesores</option>
              {asesoresUnicos.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
        )}

        <div className="flex items-center gap-2 bg-white rounded-xl border border-slate-200 px-3 py-2 shadow-sm">
          <Tag size={14} className="text-slate-400" />
          <select
            value={selectedCampaign}
            onChange={(e) => setSelectedCampaign(e.target.value)}
            className="text-sm bg-transparent border-none outline-none text-slate-700 pr-6 cursor-pointer"
          >
            <option value="todas">Todas las campañas</option>
            {campaignsUnicas.map((campaign) => <option key={campaign} value={campaign}>{campaign}</option>)}
          </select>
        </div>

        {/* Date range */}
        <div className="flex items-center gap-2 bg-white rounded-xl border border-slate-200 px-3 py-2 shadow-sm">
          <Calendar size={14} className="text-slate-400" />
          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
            className="text-sm bg-transparent border-none outline-none text-slate-700" />
          <span className="text-slate-300">—</span>
          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
            className="text-sm bg-transparent border-none outline-none text-slate-700" />
          {(dateFrom || dateTo) && (
            <button onClick={() => { setDateFrom(''); setDateTo(''); }}
              className="ml-1 p-0.5 rounded-full hover:bg-slate-100 transition-colors">
              <X size={14} className="text-slate-400" />
            </button>
          )}
        </div>

        {/* Active filter tags */}
        {(dateFrom || dateTo || selectedAsesor !== 'todos' || selectedCampaign !== 'todas') && (
          <span className="text-[11px] text-slate-400 font-medium">
            {leadsFiltered.length} de {allLeads.length} leads
          </span>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════
          SECTION 1 — OVERVIEW
          ═══════════════════════════════════════════════════════ */}
      <section>
        <SectionHeader title="Vista General" subtitle="Métricas clave de rendimiento" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <HeroCard
            icon={<Users size={18} className="text-primary" />}
            iconBg="bg-primary-light"
            label="Total Leads"
            value={leadsFiltered.length}
            change={changeTotal}
            changeLabel="vs periodo anterior"
            sub={`${leadsActivos} activos`}
          />
          <HeroCard
            icon={<CheckCircle size={18} className="text-secondary" />}
            iconBg="bg-secondary-light"
            label="Convertibilidad"
            value={`${tasaConvertibilidad}%`}
            percent={tasaConvertibilidad}
            ringColor={C.mint}
            change={changeConvertibilidad}
            changeLabel="vs periodo anterior"
            sub={`${leadsPorEstado.facturado} facturados de ${leadsEnFacturacion} en facturación`}
          />
          <HeroCard
            icon={<Target size={18} className="text-primary" />}
            iconBg="bg-primary-light"
            label="Conversión"
            value={`${tasaConversion}%`}
            percent={tasaConversion}
            ringColor={C.brand}
            change={changeConversion}
            changeLabel="vs periodo anterior"
          />
          <HeroCard
            icon={<DollarSign size={18} className="text-secondary" />}
            iconBg="bg-secondary-light"
            label="Valor por Facturar"
            value={fmt(valorPorFacturar)}
            sub={`${leadsPorEstado.porFacturar} leads en esta etapa`}
          />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          SECTION 2 — PIPELINE & CONVERSION
          ═══════════════════════════════════════════════════════ */}
      <section>
        <SectionHeader title="Pipeline y Conversión" subtitle="Estado de las ventas y eficiencia" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Pipeline bars — takes 2 cols */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-primary mb-5">Pipeline de Ventas</h3>
            <div className="space-y-4">
              {([
                { label: 'Por Contactar', count: leadsPorEstado.porContactar, color: C.brand },
                { label: 'Seguimiento', count: leadsPorEstado.seguimiento, color: C.amber500 },
                { label: 'Por Facturar', count: leadsPorEstado.porFacturar, color: C.violet500 },
                { label: 'Facturado', count: leadsPorEstado.facturado, color: C.mint },
                { label: 'Caido', count: leadsPorEstado.caido, color: C.red500 },
                { label: 'No Contactado', count: leadsPorEstado.noContactado, color: C.gray400 },
              ] as const).map(item => {
                const pct = leadsFiltered.length > 0 ? (item.count / leadsFiltered.length) * 100 : 0;
                return (
                  <div key={item.label} className="group/bar">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-medium text-slate-600">{item.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-slate-400">{pct.toFixed(0)}%</span>
                        <span className="text-xs font-bold text-primary w-6 text-right">{item.count}</span>
                      </div>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700 ease-out group-hover/bar:opacity-80"
                        style={{ width: `${pct}%`, backgroundColor: item.color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Efficiency metrics — right column */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-primary-light flex items-center justify-center">
                  <Tag size={16} className="text-primary" />
                </div>
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Ticket Promedio</span>
              </div>
              <p className="text-2xl font-bold text-primary">{fmt(ticketPromedio)}</p>
              <p className="text-[11px] text-slate-400 mt-1">por lead activo</p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                  <Clock size={16} className="text-amber-600" />
                </div>
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Tiempo de Cierre</span>
              </div>
              <p className="text-2xl font-bold text-primary">{tiempoPromedioCierre !== null ? `${tiempoPromedioCierre} días` : '—'}</p>
              <p className="text-[11px] text-slate-400 mt-1">promedio de creación a factura</p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-secondary-light flex items-center justify-center">
                  <DollarSign size={16} className="text-secondary" />
                </div>
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Facturado</span>
              </div>
              <p className="text-2xl font-bold text-primary">{fmt(valorGanados)}</p>
              <p className="text-[11px] text-slate-400 mt-1">{leadsPorEstado.facturado} cierres</p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          SECTION 3 — LEAD ANALYSIS & ALERTS
          ═══════════════════════════════════════════════════════ */}
      <section>
        <SectionHeader title="Análisis de Leads" subtitle="Fuentes, alertas y áreas de mejora" />
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {/* Fuente chart — 3 cols */}
          <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-primary mb-4">Leads por Campaña</h3>
            {dataFuente.length === 0 ? (
              <p className="text-slate-400 text-center py-12 text-sm">Sin datos</p>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={dataFuente} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value" label={renderPieLabel} labelLine={false} style={{ fontSize: 11 }}>
                    {dataFuente.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                  <Legend verticalAlign="bottom" iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Alert badges — 2 cols */}
          <div className="lg:col-span-2 space-y-4">
            <AlertBadge
              icon={<AlertTriangle size={20} className={isAdmin ? 'text-red-500' : 'text-amber-500'} />}
              label="Alertas por Contactar"
              value={alertasContacto}
              color={isAdmin ? 'text-red-600' : 'text-amber-600'}
              bgColor={isAdmin ? 'bg-red-50' : 'bg-amber-50'}
              desc={isAdmin ? `${alertasVencidas} alertas visibles desde 24h+, fines de semana suspendidos` : `${alertasCriticas} críticas; incluye preventiva de 12h, fines de semana suspendidos`}
              href="#/leads"
            />
            <AlertBadge
              icon={<AlertTriangle size={20} className="text-red-500" />}
              label="Leads Urgentes"
              value={leadsUrgentes}
              color="text-red-600"
              bgColor="bg-red-50"
              desc="Alta prioridad sin contactar"
              href="#/leads"
            />
            <AlertBadge
              icon={<UserX size={20} className="text-amber-500" />}
              label="Sin Seguimiento"
              value={leadsOlvidados}
              color="text-amber-600"
              bgColor="bg-amber-50"
              desc="+7 días sin contacto"
            />
            <AlertBadge
              icon={<TrendingDown size={20} className="text-slate-500" />}
              label="Tasa de Caída"
              value={tasaCaida}
              color="text-slate-600"
              bgColor="bg-slate-50"
              desc={`${leadsPorEstado.caido} leads perdidos`}
            />
            {dataMotivoPerdida.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                <h4 className="text-xs font-semibold text-primary uppercase tracking-wider mb-3">Motivos de Pérdida</h4>
                <div className="space-y-2">
                  {dataMotivoPerdida.slice(0, 4).map((m, i) => (
                    <div key={m.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                        <span className="text-xs text-slate-600">{m.name}</span>
                      </div>
                      <span className="text-xs font-semibold text-primary">{m.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          SECTION 4 — TEAM ACTIVITY
          ═══════════════════════════════════════════════════════ */}
      <section>
        <SectionHeader title="Actividad del Equipo" subtitle="Volumen de leads y rendimiento" />

        {/* Daily ingress */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm mb-4">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-semibold text-primary">Ingreso Diario de Leads</h3>
            <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5">
              {[7, 15, 30].map(d => (
                <button key={d} onClick={() => setDiasTendencia(d)}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-all duration-200 ${
                    diasTendencia === d ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-primary'}`}>
                  {d}d
                </button>
              ))}
            </div>
          </div>
          {dataTendenciaDiaria.every(d => !d.CrediExpress && !d['Aprobados en Vivo'] && !d.Otros) ? (
            <p className="text-slate-400 text-center py-12 text-sm">Sin actividad en este periodo</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dataTendenciaDiaria} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.slate100} />
                <XAxis dataKey="name" tick={{ fontSize: diasTendencia > 15 ? 9 : 11, fill: C.slate500 }} interval={diasTendencia <= 7 ? 0 : diasTendencia <= 15 ? 1 : 2} axisLine={{ stroke: C.slate300 }} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: C.slate500 }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, paddingTop: 12 }} />
                <Bar dataKey="CrediExpress" stackId="a" fill={C.brand} />
                <Bar dataKey="Aprobados en Vivo" stackId="a" fill={C.mint} />
                <Bar dataKey="Otros" stackId="a" fill={C.gray400} radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Asesor performance (admin only) */}
        {isAdmin && dataAsesor.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-primary mb-5">Rendimiento por Asesor</h3>
            <ResponsiveContainer width="100%" height={Math.max(220, dataAsesor.length * 48)}>
              <BarChart data={dataAsesor} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.slate100} horizontal={false} />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: C.slate500 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 11, fill: C.brand }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                <Bar dataKey="Por Contactar" stackId="a" fill={C.brand} />
                <Bar dataKey="Facturado" stackId="a" fill={C.mint} />
                <Bar dataKey="Seguimiento" stackId="a" fill={C.amber500} />
                <Bar dataKey="Por Facturar" stackId="a" fill={C.violet500} />
                <Bar dataKey="Caido" stackId="a" fill={C.red500} radius={[0, 3, 3, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>

      {/* ═══════════════════════════════════════════════════════
          SECTION 5 — RECENT ACTIVITY
          ═══════════════════════════════════════════════════════ */}

      <section>
        <SectionHeader title="Actividad Reciente" subtitle="Últimos leads registrados"
          right={
            <a href="#/leads" className="text-xs font-medium text-secondary hover:text-secondary-hover transition-colors flex items-center gap-1">
              Ver todos <ChevronRight size={14} />
            </a>
          }
        />
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {leadsRecientes.length === 0 ? (
            <p className="text-slate-400 text-center py-12 text-sm">No hay leads aún</p>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">Nombre</th>
                  <th className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-4 py-3 hidden sm:table-cell">Teléfono</th>
                  <th className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Estado</th>
                  <th className="text-right text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">Valor</th>
                </tr>
              </thead>
              <tbody>
                {leadsRecientes.map((lead) => (
                  <tr key={lead.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-3.5">
                      <p className="text-sm font-medium text-primary">{lead.fullName}</p>
                      <p className="text-[11px] text-slate-400 sm:hidden">{lead.phone}</p>
                    </td>
                    <td className="px-4 py-3.5 hidden sm:table-cell">
                      <span className="text-sm text-slate-500">{lead.phone}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${STATUS_BG[lead.status] || 'bg-slate-100 text-slate-600'}`}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <span className="text-sm font-semibold text-primary">{fmt(lead.vehicleAmount || 0)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          SECTION 6 — ÍNDICE DE APROBACIÓN CREDIEXPRESS
          ═══════════════════════════════════════════════════════ */}
      {showApprovalStats && (
      <section>
        <SectionHeader
          title="Índice de Aprobación — Crediexpress"
          subtitle="De todas las solicitudes recibidas en Firebase, cuántas son aprobadas"
        />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Big approval rate card */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col items-center justify-center gap-3">
            <div className="relative w-32 h-32">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { v: approvalStats.tasaAprobacion },
                      { v: Math.max(0, 100 - approvalStats.tasaAprobacion) },
                    ]}
                    cx="50%" cy="50%"
                    innerRadius={42} outerRadius={56}
                    startAngle={90} endAngle={-270}
                    dataKey="v"
                    strokeWidth={0}
                  >
                    <Cell fill={C.mint} />
                    <Cell fill={C.slate100} />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-primary leading-none">{approvalStats.tasaAprobacion}%</span>
                <span className="text-[10px] text-slate-400 mt-0.5">aprobación</span>
              </div>
            </div>
            <div className="text-center">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tasa de Aprobación</p>
              <p className="text-[11px] text-slate-400 mt-1">
                {approvalStats.aprobados} aprobados de {approvalStats.total} solicitudes totales
              </p>
            </div>
          </div>

          {/* Breakdown cards */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Aprobados */}
            <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl bg-secondary-light flex items-center justify-center">
                  <CheckCircle size={18} className="text-secondary" />
                </div>
                <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Aprobados</span>
              </div>
              <p className="text-3xl font-bold text-primary">{approvalStats.aprobados}</p>
              <div className="mt-3 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-secondary transition-all duration-700"
                  style={{ width: approvalStats.total > 0 ? `${(approvalStats.aprobados / approvalStats.total) * 100}%` : '0%' }}
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5">
                {approvalStats.total > 0 ? Math.round((approvalStats.aprobados / approvalStats.total) * 100) : 0}% del total
              </p>
            </div>

            {/* Rechazados */}
            <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center">
                  <XCircle size={18} className="text-red-500" />
                </div>
                <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Rechazados</span>
              </div>
              <p className="text-3xl font-bold text-primary">{approvalStats.rechazados}</p>
              <div className="mt-3 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-red-400 transition-all duration-700"
                  style={{ width: approvalStats.total > 0 ? `${(approvalStats.rechazados / approvalStats.total) * 100}%` : '0%' }}
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5">
                {approvalStats.total > 0 ? Math.round((approvalStats.rechazados / approvalStats.total) * 100) : 0}% del total
              </p>
            </div>

            {/* Pendientes / en revisión */}
            <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center">
                  <Hourglass size={18} className="text-amber-500" />
                </div>
                <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Pendientes</span>
              </div>
              <p className="text-3xl font-bold text-primary">{approvalStats.pendientes}</p>
              <div className="mt-3 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-amber-400 transition-all duration-700"
                  style={{ width: approvalStats.total > 0 ? `${(approvalStats.pendientes / approvalStats.total) * 100}%` : '0%' }}
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5">
                {approvalStats.total > 0 ? Math.round((approvalStats.pendientes / approvalStats.total) * 100) : 0}% del total
              </p>
            </div>
          </div>
        </div>
      </section>
      )}
    </div>
  );
};