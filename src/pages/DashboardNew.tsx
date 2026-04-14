import React, { useState, useEffect, useMemo } from 'react';
import { StatCard } from '../components/StatCard';
import { Card } from '../components/Card';
import { Lead } from '../utils/types';
import { unifiedLeadsService } from '../services/unifiedLeads';
import { useAuth } from '../hooks/useAuth';

interface DashboardProps {
  leads?: Lead[];
}

export const Dashboard: React.FC<DashboardProps> = ({ leads: externalLeads }) => {
  const { user, isAdmin } = useAuth();
  const [allLeads, setAllLeads] = useState<Lead[]>(externalLeads || []);
  const [loading, setLoading] = useState(!externalLeads);
  const [selectedAsesor, setSelectedAsesor] = useState<string>('todos');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Cargar leads con suscripción en tiempo real si no vienen como prop
  useEffect(() => {
    if (!externalLeads) {
      setLoading(true);
      console.log('🔄 Dashboard: Suscribiéndose a cambios en tiempo real...');
      
      // Suscribirse a cambios en tiempo real
      const unsubscribe = unifiedLeadsService.subscribeToAllLeads((data) => {
        console.log('✅ Dashboard: Leads actualizados en tiempo real:', data.length);
        setAllLeads(data);
        setLoading(false);
      });

      // Cleanup: cancelar suscripción al desmontar
      return () => {
        console.log('🔌 Dashboard: Desconectando suscripción en tiempo real');
        unsubscribe();
      };
    } else {
      setAllLeads(externalLeads);
    }
  }, [externalLeads]);

  // Normalizar texto removiendo acentos para comparación
  const normalize = (str: string) => str.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  // Lista de asesores únicos para el filtro admin
  const asesoresUnicos = useMemo(() => {
    const set = new Set<string>();
    allLeads.forEach(l => { if (l.asesor?.trim()) set.add(l.asesor.trim()); });
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'es'));
  }, [allLeads]);

  // Filtrar leads por asesor (no-admin solo ve sus leads, admin puede filtrar)
  const leads = useMemo(() => {
    if (isAdmin) {
      if (selectedAsesor === 'todos') return allLeads;
      return allLeads.filter(lead => {
        const asesor = (lead.asesor || '').trim();
        return normalize(asesor) === normalize(selectedAsesor);
      });
    }
    const name = user?.displayName?.trim();
    if (!name) return [];
    const normalizedName = normalize(name);
    return allLeads.filter(lead => {
      const asesor = (lead.asesor || '').trim();
      if (!asesor) return false;
      return normalize(asesor) === normalizedName;
    });
  }, [allLeads, isAdmin, user?.displayName, selectedAsesor]);

  // Filtrar por fechas
  const leadsFiltered = useMemo(() => {
    if (!dateFrom && !dateTo) return leads;
    return leads.filter(l => {
      const fecha = new Date(l.fechaCreacion);
      if (dateFrom && fecha < new Date(dateFrom)) return false;
      if (dateTo) {
        const to = new Date(dateTo);
        to.setHours(23, 59, 59, 999);
        if (fecha > to) return false;
      }
      return true;
    });
  }, [leads, dateFrom, dateTo]);

  // ===== CÁLCULO DE MÉTRICAS DEL PIPELINE =====
  
  // Leads por estado
  const leadsPorEstado = {
    porFacturar: leadsFiltered.filter(l => l.status === 'Por Facturar').length,
    seguimiento: leadsFiltered.filter(l => l.status === 'Seguimiento').length,
    citaAgendada: leadsFiltered.filter(l => l.status === 'Cita Agendada').length,
    facturado: leadsFiltered.filter(l => l.status === 'Facturado').length,
    caido: leadsFiltered.filter(l => l.status === 'Caido').length,
    noContactado: leadsFiltered.filter(l => l.status === 'No Contactado').length,
  };

  // Total de leads activos (excluye caídos)
  const leadsActivos = leadsFiltered.filter(l => 
    !['Caido'].includes(l.status)
  ).length;

  // Tasa de contactabilidad: (Facturado + Seguimiento) / Total
  const leadsContactados = leadsFiltered.filter(l => 
    ['Facturado', 'Seguimiento'].includes(l.status)
  ).length;
  const tasaContactabilidad = leadsFiltered.length > 0 
    ? Math.round((leadsContactados / leadsFiltered.length) * 100) 
    : 0;

  // Tasa de conversión: Facturados / Total
  const tasaConversion = leadsFiltered.length > 0 
    ? Math.round((leadsPorEstado.facturado / leadsFiltered.length) * 100) 
    : 0;

  // Valor total del pipeline (solo leads activos)
  const valorPipeline = leadsFiltered
    .filter(l => !['Caido'].includes(l.status))
    .reduce((sum, lead) => sum + (lead.vehicleAmount || 0), 0);

  // Valor de negocios facturados
  const valorGanados = leadsFiltered
    .filter(l => l.status === 'Facturado')
    .reduce((sum, lead) => sum + (lead.montoFinal || lead.vehicleAmount || 0), 0);

  // Leads urgentes (Por Facturar de alta prioridad)
  const leadsUrgentes = leadsFiltered.filter(l => 
    l.status === 'Por Facturar' && l.prioridad === 'Alta'
  ).length;

  // Leads de CrediExpress esta semana
  const haceUnaSemana = new Date();
  haceUnaSemana.setDate(haceUnaSemana.getDate() - 7);
  const leadsCrediExpressRecientes = leadsFiltered.filter(l => {
    if (l.fuente !== 'CrediExpress') return false;
    const fechaCreacion = new Date(l.fechaCreacion);
    return fechaCreacion >= haceUnaSemana;
  }).length;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-EC', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Por Facturar': return 'text-primary';
      case 'Facturado': return 'text-emerald-600';
      case 'Seguimiento': return 'text-yellow-600';
      case 'Caido': return 'text-red-600';
      case 'No Contactado': return 'text-purple-600';
      default: return 'text-gray-600';
    }
  };

  // Leads recientes
  const leadsRecientes = [...leadsFiltered]
    .sort((a, b) => {
      const dateA = new Date(a.fechaCreacion).getTime();
      const dateB = new Date(b.fechaCreacion).getTime();
      return dateB - dateA;
    })
    .slice(0, 4);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-secondary border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-400 text-sm">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtro por asesor (solo admin) */}
      {isAdmin && (
        <div className="flex items-center gap-3 bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3">
          <label className="text-sm font-medium text-gray-500 whitespace-nowrap">Filtrar por asesor:</label>
          <select
            value={selectedAsesor}
            onChange={(e) => setSelectedAsesor(e.target.value)}
            className="flex-1 max-w-xs px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary"
          >
            <option value="todos">Todos los asesores</option>
            {asesoresUnicos.map(a => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
          {selectedAsesor !== 'todos' && (
            <span className="text-xs text-gray-400">
              {leadsFiltered.length} leads de {allLeads.length}
            </span>
          )}
        </div>
      )}

      {/* Filtro por fechas */}
      <div className="flex items-center gap-3 bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3">
        <label className="text-sm font-medium text-gray-500 whitespace-nowrap">Periodo:</label>
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary"
          />
          <span className="text-gray-400 text-sm">—</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary"
          />
        </div>
        {(dateFrom || dateTo) && (
          <button
            onClick={() => { setDateFrom(''); setDateTo(''); }}
            className="text-xs text-secondary hover:underline whitespace-nowrap"
          >
            Limpiar
          </button>
        )}
        {(dateFrom || dateTo) && (
          <span className="text-xs text-gray-400">
            {leadsFiltered.length} de {leads.length} leads
          </span>
        )}
      </div>

      {/* KPIs Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Leads"
          value={leadsFiltered.length}
          icon="🎯"
          change={12}
          changeLabel="vs mes anterior"
        />
        
        <StatCard
          title="Tasa de Contactabilidad"
          value={`${tasaContactabilidad}%`}
          icon="📞"
          change={tasaContactabilidad > 70 ? 5 : -3}
          changeLabel="vs mes anterior"
        />
        
        <StatCard
          title="En Seguimiento"
          value={leadsPorEstado.seguimiento}
          icon="💼"
        />
        
        <StatCard
          title="Tasa de Conversión"
          value={`${tasaConversion}%`}
          icon="📈"
          change={tasaConversion > 10 ? 5 : -2}
          changeLabel="vs mes anterior"
        />
      </div>

      {/* Segunda fila de KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Valor Pipeline</p>
              <p className="text-2xl font-bold text-secondary mt-1">
                {formatCurrency(valorPipeline)}
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center text-xl">💰</div>
          </div>
          <p className="text-xs text-gray-400 mt-2">{leadsActivos} leads activos</p>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Facturados</p>
              <p className="text-2xl font-bold text-secondary mt-1">
                {formatCurrency(valorGanados)}
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center text-xl">✅</div>
          </div>
          <p className="text-xs text-gray-400 mt-2">{leadsPorEstado.facturado} cierres</p>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Leads Urgentes</p>
              <p className="text-2xl font-bold text-red-500 mt-1">{leadsUrgentes}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center text-xl">🚨</div>
          </div>
          <p className="text-xs text-gray-400 mt-2">Alta prioridad sin contactar</p>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">CrediExpress</p>
              <p className="text-2xl font-bold text-primary mt-1">
                {leadsCrediExpressRecientes}
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-xl">🔥</div>
          </div>
          <p className="text-xs text-gray-400 mt-2">Esta semana</p>
        </Card>
      </div>

      {/* Gráficos y detalles */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Pipeline de ventas */}
        <Card>
          <h2 className="text-base font-semibold text-primary mb-4">Pipeline de Ventas</h2>
          <div className="space-y-3">
            {[
              { status: 'Por Facturar', count: leadsPorEstado.porFacturar, color: 'bg-primary', total: leadsFiltered.length },
              { status: 'Seguimiento', count: leadsPorEstado.seguimiento, color: 'bg-amber-400', total: leadsFiltered.length },
              { status: 'Cita Agendada', count: leadsPorEstado.citaAgendada, color: 'bg-indigo-400', total: leadsFiltered.length },
              { status: 'Facturado', count: leadsPorEstado.facturado, color: 'bg-secondary', total: leadsFiltered.length },
              { status: 'Caido', count: leadsPorEstado.caido, color: 'bg-red-400', total: leadsFiltered.length },
              { status: 'No Contactado', count: leadsPorEstado.noContactado, color: 'bg-gray-300', total: leadsFiltered.length },
            ].map((item) => {
              const percentage = item.total > 0 ? (item.count / item.total) * 100 : 0;
              return (
                <div key={item.status} className="flex items-center gap-3">
                  <div className="w-28 text-sm font-medium text-gray-500">{item.status}</div>
                  <div className="flex-1 bg-gray-100 rounded-full h-2">
                    <div
                      className={`${item.color} h-2 rounded-full transition-all duration-500`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <div className="w-12 text-right text-sm font-semibold text-primary">
                    {item.count}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Leads Recientes */}
        <Card>
          <h2 className="text-base font-semibold text-primary mb-4">Leads Recientes</h2>
          <div className="space-y-2">
            {leadsRecientes.length === 0 ? (
              <p className="text-gray-400 text-center py-4">No hay leads aún</p>
            ) : (
              leadsRecientes.map((lead) => (
                <div
                  key={lead.id}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="font-medium text-primary text-sm">{lead.fullName}</div>
                    <div className="text-xs text-gray-400">{lead.phone}</div>
                  </div>
                  <div className="text-right">
                    <div className={`text-xs font-medium ${getStatusColor(lead.status)}`}>
                      {lead.status}
                    </div>
                    <div className="text-sm font-semibold text-secondary">
                      {formatCurrency(lead.vehicleAmount || 0)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Alertas y acciones rápidas */}
      {leadsUrgentes > 0 && (
        <Card>
          <div className="flex items-start gap-3">
            <div className="text-3xl">⚠️</div>
            <div className="flex-1">
              <h3 className="font-semibold text-primary">Acción Requerida</h3>
              <p className="text-gray-500 text-sm mt-1">
                Tienes <strong className="text-primary">{leadsUrgentes} leads de alta prioridad</strong> que aún no han sido contactados.
                Es importante hacer seguimiento dentro de las próximas 24 horas para maximizar la conversión.
              </p>
              <div className="mt-3">
                <a
                  href="#/leads"
                  className="inline-flex items-center px-4 py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary-hover transition-colors"
                >
                  Ver Leads Urgentes
                </a>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
