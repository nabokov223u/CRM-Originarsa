import React, { useState, useEffect } from 'react';
import { StatCard } from '../components/StatCard';
import { Card } from '../components/Card';
import { Lead } from '../utils/types';
import { unifiedLeadsService } from '../services/unifiedLeads';

interface DashboardProps {
  leads?: Lead[];
}

export const Dashboard: React.FC<DashboardProps> = ({ leads: externalLeads }) => {
  const [leads, setLeads] = useState<Lead[]>(externalLeads || []);
  const [loading, setLoading] = useState(!externalLeads);

  // Cargar leads con suscripción en tiempo real si no vienen como prop
  useEffect(() => {
    if (!externalLeads) {
      setLoading(true);
      console.log('🔄 Dashboard: Suscribiéndose a cambios en tiempo real...');
      
      // Suscribirse a cambios en tiempo real
      const unsubscribe = unifiedLeadsService.subscribeToAllLeads((data) => {
        console.log('✅ Dashboard: Leads actualizados en tiempo real:', data.length);
        setLeads(data);
        setLoading(false);
      });

      // Cleanup: cancelar suscripción al desmontar
      return () => {
        console.log('🔌 Dashboard: Desconectando suscripción en tiempo real');
        unsubscribe();
      };
    } else {
      setLeads(externalLeads);
    }
  }, [externalLeads]);

  // ===== CÁLCULO DE MÉTRICAS DEL PIPELINE =====
  
  // Leads por estado
  const leadsPorEstado = {
    nuevo: leads.filter(l => l.status === 'Nuevo').length,
    contactado: leads.filter(l => l.status === 'Contactado').length,
    calificado: leads.filter(l => l.status === 'Calificado').length,
    negociacion: leads.filter(l => l.status === 'Negociación').length,
    documentacion: leads.filter(l => l.status === 'Documentación').length,
    ganado: leads.filter(l => l.status === 'Ganado').length,
    nutricion: leads.filter(l => l.status === 'Nutrición').length,
    perdido: leads.filter(l => l.status === 'Perdido').length,
  };

  // Total de leads activos (excluye ganados, perdidos y nutrición)
  const leadsActivos = leads.filter(l => 
    !['Ganado', 'Perdido', 'Nutrición'].includes(l.status)
  ).length;

  // 🎯 TASA DE CONTACTABILIDAD: (Calificados + estados superiores) / Total
  // Mide el éxito de contactar y calificar leads (paso de Contactado → Calificado)
  const leadsCalificadosOMas = leads.filter(l => 
    ['Calificado', 'Negociación', 'Documentación', 'Ganado'].includes(l.status)
  ).length;
  const tasaContactabilidad = leads.length > 0 
    ? Math.round((leadsCalificadosOMas / leads.length) * 100) 
    : 0;

  // Tasa de conversión: Ganados / Total
  const tasaConversion = leads.length > 0 
    ? Math.round((leadsPorEstado.ganado / leads.length) * 100) 
    : 0;

  // Valor total del pipeline (solo leads activos)
  const valorPipeline = leads
    .filter(l => !['Ganado', 'Perdido', 'Nutrición'].includes(l.status))
    .reduce((sum, lead) => sum + (lead.vehicleAmount || 0), 0);

  // Valor de negocios ganados
  const valorGanados = leads
    .filter(l => l.status === 'Ganado')
    .reduce((sum, lead) => sum + (lead.montoFinal || lead.vehicleAmount || 0), 0);

  // Leads urgentes (nuevos de alta prioridad)
  const leadsUrgentes = leads.filter(l => 
    l.status === 'Nuevo' && l.prioridad === 'Alta'
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
      case 'Nuevo': return 'text-blue-600';
      case 'Contactado': return 'text-yellow-600';
      case 'Calificado': return 'text-orange-600';
      case 'Negociación': return 'text-purple-600';
      case 'Documentación': return 'text-indigo-600';
      case 'Ganado': return 'text-green-600';
      case 'Perdido': return 'text-red-600';
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
          title="En Negociación"
          value={leadsPorEstado.negociacion + leadsPorEstado.documentacion}
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
              <p className="text-sm font-medium text-gray-600">Ganados</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">
                {formatCurrency(valorGanados)}
              </p>
            </div>
            <div className="text-3xl">✅</div>
          </div>
          <p className="text-xs text-gray-500 mt-2">{leadsPorEstado.ganado} cierres</p>
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
              { status: 'Nuevo', count: leadsPorEstado.nuevo, color: 'bg-blue-500', total: leads.length },
              { status: 'Contactado', count: leadsPorEstado.contactado, color: 'bg-yellow-500', total: leads.length },
              { status: 'Calificado', count: leadsPorEstado.calificado, color: 'bg-orange-500', total: leads.length },
              { status: 'Negociación', count: leadsPorEstado.negociacion, color: 'bg-purple-500', total: leads.length },
              { status: 'Documentación', count: leadsPorEstado.documentacion, color: 'bg-indigo-500', total: leads.length },
              { status: 'Ganado', count: leadsPorEstado.ganado, color: 'bg-green-500', total: leads.length },
              { status: 'Perdido', count: leadsPorEstado.perdido, color: 'bg-red-500', total: leads.length },
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
