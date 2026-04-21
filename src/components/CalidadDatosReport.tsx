import React, { useState, useEffect, useRef } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { ArrowLeft, Search, RefreshCw, Clock, AlertTriangle, CheckCircle2, XCircle, BarChart3 } from 'lucide-react';

interface ErrorEntry {
  Solicitud: string;
  Asesor?: string;
  Cliente: string;
  'Origen (BPM)': string;
  'Destino (DWH)': string;
  Estado: string;
  Análisis_Detallado?: string;
}

interface CalidadDatosDoc {
  ultima_actualizacion: string;
  errores: ErrorEntry[];
}

const RANGE_OPTIONS = [
  { label: 'Últimos 7 días', value: 7 },
  { label: 'Últimos 15 días', value: 15 },
  { label: 'Últimos 30 días', value: 30 },
];

const N8N_WEBHOOK_URL = 'https://n8n.originarsa.com/webhook/generar-reporte-calidad';

function getStatusStyle(estado: string) {
  if (estado.includes('✅') || estado.includes('ARREGLÓ'))
    return { bg: 'bg-secondary-light', text: 'text-secondary', border: 'border-secondary/20', icon: CheckCircle2 };
  if (estado.includes('🗑️') || estado.includes('❌') || estado.includes('BASURA'))
    return { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', icon: XCircle };
  if (estado.includes('⚠️') || estado.includes('ERROR') || estado.includes('INTACTO'))
    return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', icon: AlertTriangle };
  return { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-200', icon: BarChart3 };
}

function formatDate(isoString: string) {
  try {
    const d = new Date(isoString);
    return d.toLocaleDateString('es-EC', { day: 'numeric', month: 'long', year: 'numeric' })
      + ', '
      + d.toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return isoString;
  }
}

interface Props {
  onBack: () => void;
}

export const CalidadDatosReport: React.FC<Props> = ({ onBack }) => {
  const [data, setData] = useState<CalidadDatosDoc | null>(null);
  const [loading, setLoading] = useState(false);
  const [dias, setDias] = useState(15);
  const [search, setSearch] = useState('');
  const [filterEstado, setFilterEstado] = useState('Todos');
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const prevTimestamp = useRef<string | null>(null);

  useEffect(() => {
    const docRef = doc(db, 'informes', 'calidad_datos_bpm');
    const unsub = onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        const docData = snap.data() as CalidadDatosDoc;
        setData(docData);
        if (prevTimestamp.current && docData.ultima_actualizacion !== prevTimestamp.current) {
          setLoading(false);
        }
        prevTimestamp.current = docData.ultima_actualizacion;
      }
    });
    return () => unsub();
  }, []);

  const handleGenerar = async () => {
    setLoading(true);
    try {
      await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dias }),
      });
    } catch {
      // n8n puede no devolver CORS headers, pero el POST se envía igual
    }
    setTimeout(() => setLoading(false), 120000);
  };

  const errores = data?.errores || [];
  const totalErrores = errores.length;
  const corregidos = errores.filter(e => e.Estado.includes('✅') || e.Estado.includes('ARREGLÓ')).length;
  const pendientes = errores.filter(e => e.Estado.includes('⚠️') || e.Estado.includes('ERROR') || e.Estado.includes('INTACTO')).length;
  const graves = errores.filter(e => e.Estado.includes('🗑️') || e.Estado.includes('❌') || e.Estado.includes('BASURA')).length;

  const estadosUnicos = ['Todos', ...Array.from(new Set(errores.map(e => e.Estado)))];

  const filtered = errores.filter(e => {
    const matchSearch = !search ||
      e.Cliente?.toLowerCase().includes(search.toLowerCase()) ||
      e.Solicitud?.includes(search) ||
      e.Asesor?.toLowerCase().includes(search.toLowerCase());
    const matchEstado = filterEstado === 'Todos' || e.Estado === filterEstado;
    return matchSearch && matchEstado;
  });

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      {/* Breadcrumb + Header */}
      <div>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-primary transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a Informes
        </button>

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-primary">Auditoría de Calidad de Datos</h2>
            <p className="text-sm text-slate-500 mt-1">
              Cruce automático BPM ↔ Data Warehouse · Detección de errores en datos de contacto
            </p>
          </div>
          {data?.ultima_actualizacion && (
            <div className="inline-flex items-center gap-2 text-sm text-slate-500 bg-slate-50 px-4 py-2 rounded-lg border border-slate-200 shrink-0">
              <Clock className="w-3.5 h-3.5" />
              Última auditoría: <span className="font-medium text-slate-700">{formatDate(data.ultima_actualizacion)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Controls Bar */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
          <div className="w-full sm:w-56">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Rango de análisis
            </label>
            <select
              value={dias}
              onChange={(e) => setDias(Number(e.target.value))}
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-700 focus:ring-2 focus:ring-secondary/30 focus:border-secondary bg-white transition-all"
              disabled={loading}
            >
              {RANGE_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <button
            onClick={handleGenerar}
            disabled={loading}
            className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
              loading
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                : 'bg-secondary hover:bg-secondary-hover text-white shadow-sm hover:shadow-md'
            }`}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Procesando...' : 'Ejecutar Auditoría'}
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      {data && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard label="Registros Analizados" value={totalErrores} icon={BarChart3} color="primary" />
          <KpiCard label="Corregidos por DWH" value={corregidos} icon={CheckCircle2} color="green" />
          <KpiCard label="Error Intacto" value={pendientes} icon={AlertTriangle} color="amber" />
          <KpiCard label="Dato Basura" value={graves} icon={XCircle} color="red" />
        </div>
      )}

      {/* Search & Filters */}
      {data && errores.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por solicitud, cliente o asesor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-slate-200 rounded-lg pl-10 pr-3 py-2.5 text-sm focus:ring-2 focus:ring-secondary/30 focus:border-secondary bg-white transition-all"
            />
          </div>
          <select
            value={filterEstado}
            onChange={(e) => setFilterEstado(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-secondary/30 focus:border-secondary bg-white min-w-[220px] transition-all"
          >
            {estadosUnicos.map(est => (
              <option key={est} value={est}>{est}</option>
            ))}
          </select>
        </div>
      )}

      {/* Data Table */}
      {data && errores.length > 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Solicitud</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Asesor</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Cliente</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Origen (BPM)</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Destino (DWH)</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Estado</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row, idx) => {
                  const style = getStatusStyle(row.Estado);
                  const Icon = style.icon;
                  const isExpanded = expandedRow === idx;
                  return (
                    <React.Fragment key={idx}>
                      <tr
                        className={`border-b border-slate-50 hover:bg-slate-50/60 transition-colors cursor-pointer ${isExpanded ? 'bg-slate-50/60' : ''}`}
                        onClick={() => setExpandedRow(isExpanded ? null : idx)}
                      >
                        <td className="px-5 py-3.5 font-mono text-sm text-primary font-semibold">{row.Solicitud}</td>
                        <td className="px-5 py-3.5 text-slate-600">{row.Asesor || '—'}</td>
                        <td className="px-5 py-3.5 font-medium text-slate-800">{row.Cliente}</td>
                        <td className="px-5 py-3.5 font-mono text-slate-600">{row['Origen (BPM)'] || '—'}</td>
                        <td className="px-5 py-3.5 font-mono text-slate-600">{row['Destino (DWH)'] || '—'}</td>
                        <td className="px-5 py-3.5">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${style.bg} ${style.text} ${style.border}`}>
                            <Icon className="w-3 h-3" />
                            {row.Estado.replace(/[✅🗑️❌⚠️]/g, '').trim()}
                          </span>
                        </td>
                      </tr>
                      {isExpanded && row.Análisis_Detallado && (
                        <tr className="bg-slate-50/40">
                          <td colSpan={6} className="px-5 py-3 text-sm text-slate-600 border-b border-slate-100">
                            <span className="font-medium text-slate-700">Análisis: </span>
                            {row.Análisis_Detallado}
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-3 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Mostrando {filtered.length} de {totalErrores} registros
            </span>
          </div>
        </div>
      ) : data && errores.length === 0 ? (
        <EmptyState
          icon={CheckCircle2}
          title="Sin errores detectados"
          description="La auditoría no encontró discrepancias en el rango seleccionado."
        />
      ) : !data ? (
        <EmptyState
          icon={BarChart3}
          title="Sin datos aún"
          description="Haz clic en «Ejecutar Auditoría» para generar el primer informe."
        />
      ) : null}
    </div>
  );
};

/* ── KPI Card ── */
function KpiCard({ label, value, icon: Icon, color }: { label: string; value: number; icon: React.ElementType; color: string }) {
  const styles: Record<string, { bg: string; iconBg: string; iconColor: string; num: string }> = {
    primary: { bg: 'bg-white', iconBg: 'bg-primary/10', iconColor: 'text-primary', num: 'text-primary' },
    green:   { bg: 'bg-white', iconBg: 'bg-emerald-50',  iconColor: 'text-emerald-600', num: 'text-emerald-600' },
    amber:   { bg: 'bg-white', iconBg: 'bg-amber-50',    iconColor: 'text-amber-600',   num: 'text-amber-600' },
    red:     { bg: 'bg-white', iconBg: 'bg-red-50',      iconColor: 'text-red-600',     num: 'text-red-600' },
  };
  const s = styles[color] || styles.primary;
  return (
    <div className={`${s.bg} rounded-xl border border-slate-200 shadow-sm p-5 flex items-start gap-4`}>
      <div className={`${s.iconBg} p-2.5 rounded-lg`}>
        <Icon className={`w-5 h-5 ${s.iconColor}`} />
      </div>
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
        <p className={`text-3xl font-bold ${s.num} mt-0.5`}>{value}</p>
      </div>
    </div>
  );
}

/* ── Empty State ── */
function EmptyState({ icon: Icon, title, description }: { icon: React.ElementType; title: string; description: string }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-16 text-center">
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-slate-100 mb-4">
        <Icon className="w-7 h-7 text-slate-400" />
      </div>
      <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
      <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">{description}</p>
    </div>
  );
}
