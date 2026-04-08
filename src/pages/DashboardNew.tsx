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

  // ===== CÁLCULO DE MÉTRICAS DEL PIPELINE =====
  
  // Leads por estado
  const leadsPorEstado = {
    porFacturar: leads.filter(l => l.status === 'Por Facturar').length,
    facturado: leads.filter(l => l.status === 'Facturado').length,
    seguimiento: leads.filter(l => l.status === 'Seguimiento').length,
    caido: leads.filter(l => l.status === 'Caido').length,
    noContactado: leads.filter(l => l.status === 'No Contactado').length,
  };

  // Total de leads activos (excluye caídos)
  const leadsActivos = leads.filter(l => 
    !['Caido'].includes(l.status)
  ).length;

  // Tasa de contactabilidad: (Facturado + Seguimiento) / Total
  const leadsContactados = leads.filter(l => 
    ['Facturado', 'Seguimiento'].includes(l.status)
  ).length;
  const tasaContactabilidad = leads.length > 0 
    ? Math.round((leadsContactados / leads.length) * 100) 
    : 0;

  // Tasa de conversión: Facturados / Total
  const tasaConversion = leads.length > 0 
    ? Math.round((leadsPorEstado.facturado / leads.length) * 100) 
    : 0;

  // Valor total del pipeline (solo leads activos)
  const valorPipeline = leads
    .filter(l => !['Caido'].includes(l.status))
    .reduce((sum, lead) => sum + (lead.vehicleAmount || 0), 0);

  // Valor de negocios facturados
  const valorGanados = leads
    .filter(l => l.status === 'Facturado')
    .reduce((sum, lead) => sum + (lead.montoFinal || lead.vehicleAmount || 0), 0);

  // Leads urgentes (Por Facturar de alta prioridad)
  const leadsUrgentes = leads.filter(l => 
    l.status === 'Por Facturar' && l.prioridad === 'Alta'
  ).length;

  // Leads de CrediExpress esta semana
  const haceUnaSemana = new Date();
  haceUnaSemana.setDate(haceUnaSemana.getDate() - 7);
  const leadsCrediExpressRecientes = leads.filter(l => {
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
  const leadsRecientes = [...leads]
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtro por asesor (solo admin) */}
      {isAdmin && (
        <div className="flex items-center gap-3 bg-white rounded-lg border border-gray-200 px-4 py-3">
          <label className="text-sm font-medium text-gray-600 whitespace-nowrap">Filtrar por asesor:</label>
          <select
            value={selectedAsesor}
            onChange={(e) => setSelectedAsesor(e.target.value)}
            className="flex-1 max-w-xs px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="todos">Todos los asesores</option>
            {asesoresUnicos.map(a => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
          {selectedAsesor !== 'todos' && (
            <span className="text-xs text-gray-500">
              {leads.length} leads de {allLeads.length}
            </span>
          )}
        </div>
      )}

      {/* KPIs Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Leads"
          value={leads.length}
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
              <p className="text-sm font-medium text-gray-600">Valor Pipeline</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {formatCurrency(valorPipeline)}
              </p>
            </div>
            <div className="text-3xl">💰</div>
          </div>
          <p className="text-xs text-gray-500 mt-2">{leadsActivos} leads activos</p>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Facturados</p>
              <p className="text-2xl font-bold text-emerald-600 mt-1">
                {formatCurrency(valorGanados)}
              </p>
            </div>
            <div className="text-3xl">✅</div>
          </div>
          <p className="text-xs text-gray-500 mt-2">{leadsPorEstado.facturado} cierres</p>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Leads Urgentes</p>
              <p className="text-2xl font-bold text-red-600 mt-1">{leadsUrgentes}</p>
            </div>
            <div className="text-3xl">🚨</div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Alta prioridad sin contactar</p>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">CrediExpress</p>
              <p className="text-2xl font-bold text-orange-600 mt-1">
                {leadsCrediExpressRecientes}
              </p>
            </div>
            <div className="text-3xl">🔥</div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Esta semana</p>
        </Card>
      </div>

      {/* Gráficos y detalles */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Pipeline de ventas */}
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Pipeline de Ventas</h2>
          <div className="space-y-3">
            {[
              { status: 'Por Facturar', count: leadsPorEstado.porFacturar, color: 'bg-primary', total: leads.length },
              { status: 'Facturado', count: leadsPorEstado.facturado, color: 'bg-green-500', total: leads.length },
              { status: 'Seguimiento', count: leadsPorEstado.seguimiento, color: 'bg-yellow-500', total: leads.length },
              { status: 'Caido', count: leadsPorEstado.caido, color: 'bg-red-500', total: leads.length },
              { status: 'No Contactado', count: leadsPorEstado.noContactado, color: 'bg-purple-500', total: leads.length },
            ].map((item) => {
              const percentage = item.total > 0 ? (item.count / item.total) * 100 : 0;
              return (
                <div key={item.status} className="flex items-center gap-3">
                  <div className="w-28 text-sm font-medium text-gray-600">{item.status}</div>
                  <div className="flex-1 bg-gray-200 rounded-full h-3">
                    <div
                      className={`${item.color} h-3 rounded-full transition-all duration-300`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <div className="w-12 text-right text-sm font-semibold text-gray-900">
                    {item.count}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Leads Recientes */}
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Leads Recientes</h2>
          <div className="space-y-3">
            {leadsRecientes.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No hay leads aún</p>
            ) : (
              leadsRecientes.map((lead) => (
                <div
                  key={lead.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{lead.fullName}</div>
                    <div className="text-sm text-gray-500">{lead.phone}</div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-medium ${getStatusColor(lead.status)}`}>
                      {lead.status}
                    </div>
                    <div className="text-sm font-bold text-green-600">
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
              <h3 className="font-semibold text-gray-900">Acción Requerida</h3>
              <p className="text-gray-600 mt-1">
                Tienes <strong>{leadsUrgentes} leads de alta prioridad</strong> que aún no han sido contactados.
                Es importante hacer seguimiento dentro de las próximas 24 horas para maximizar la conversión.
              </p>
              <div className="mt-3">
                <a
                  href="#/leads"
                  className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
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
