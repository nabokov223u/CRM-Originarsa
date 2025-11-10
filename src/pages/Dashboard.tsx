import React from 'react';
import { StatCard } from '../components/StatCard';
import { Card } from '../components/Card';
import { Lead, Actividad } from '../utils/types';

interface DashboardProps {
  leads: Lead[];
  actividades: Actividad[];
}

export const Dashboard: React.FC<DashboardProps> = ({ leads, actividades }) => {
  // Calcular estadísticas
  const leadsNuevos = leads.filter(l => l.status === 'Nuevo').length;
  const leadsEnNegociacion = leads.filter(l => l.status === 'Negociación').length;
  const leadsAprobados = leads.filter(l => l.status === 'Aprobado').length;
  const tasaConversion = leads.length > 0 ? Math.round((leadsAprobados / leads.length) * 100) : 0;

  const actividadesHoy = actividades.filter(a => {
    const hoy = new Date().toISOString().split('T')[0];
    return a.fecha.startsWith(hoy);
  }).length;

  // Leads recientes
  const leadsRecientes = [...leads].sort((a, b) => 
    new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime()
  ).slice(0, 5);

  // Actividades pendientes
  const actividadesPendientes = actividades
    .filter(a => !a.completada)
    .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Leads"
          value={leads.length}
          icon="🎯"
          change={12}
          changeLabel="vs mes anterior"
        />
        <StatCard
          title="Nuevos Leads"
          value={leadsNuevos}
          icon="✨"
          change={8}
          changeLabel="esta semana"
        />
        <StatCard
          title="En Negociación"
          value={leadsEnNegociacion}
          icon="💼"
        />
        <StatCard
          title="Tasa de Conversión"
          value={`${tasaConversion}%`}
          icon="📈"
          change={5}
          changeLabel="vs mes anterior"
        />
      </div>

      {/* Gráficos y resumen */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Pipeline de ventas */}
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Pipeline de Ventas</h2>
          <div className="space-y-3">
            {[
              { status: 'Nuevo', count: leadsNuevos, color: 'bg-blue-500' },
              { status: 'Contactado', count: leads.filter(l => l.status === 'Contactado').length, color: 'bg-yellow-500' },
              { status: 'Negociación', count: leadsEnNegociacion, color: 'bg-orange-500' },
              { status: 'Aprobado', count: leadsAprobados, color: 'bg-green-500' },
              { status: 'Perdido', count: leads.filter(l => l.status === 'Perdido').length, color: 'bg-red-500' },
            ].map((item) => (
              <div key={item.status} className="flex items-center gap-3">
                <div className="w-24 text-xs font-medium text-gray-600">{item.status}</div>
                <div className="flex-1 bg-gray-100 rounded-full h-8 overflow-hidden">
                  <div
                    className={`${item.color} h-full flex items-center justify-end px-3 text-white text-xs font-semibold transition-all`}
                    style={{ width: `${leads.length > 0 ? (item.count / leads.length) * 100 : 0}%` }}
                  >
                    {item.count > 0 && item.count}
                  </div>
                </div>
                <div className="w-10 text-right text-sm font-semibold text-gray-700">{item.count}</div>
              </div>
            ))}
          </div>
        </Card>

        {/* Actividades de Hoy */}
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Actividades de Hoy</h2>
          <div className="text-center py-8">
            <div className="text-4xl mb-2">📅</div>
            <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">{actividadesHoy}</div>
            <div className="text-sm text-gray-500 mt-2">Actividades programadas</div>
          </div>
        </Card>
      </div>

      {/* Tablas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Leads Recientes */}
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Leads Recientes</h2>
          <div className="space-y-2">
            {leadsRecientes.length > 0 ? (
              leadsRecientes.map((lead) => (
                <div key={lead.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-900 truncate">{lead.nombres} {lead.apellidos}</p>
                    <p className="text-xs text-gray-500">{lead.telefono}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap ml-2 ${
                    lead.status === 'Nuevo' ? 'bg-blue-50 text-blue-700' :
                    lead.status === 'Contactado' ? 'bg-yellow-50 text-yellow-700' :
                    lead.status === 'Negociación' ? 'bg-orange-50 text-orange-700' :
                    lead.status === 'Aprobado' ? 'bg-green-50 text-green-700' :
                    'bg-red-50 text-red-700'
                  }`}>
                    {lead.status}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-400 py-8 text-sm">No hay leads registrados</p>
            )}
          </div>
        </Card>

        {/* Actividades Pendientes */}
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Actividades Pendientes</h2>
          <div className="space-y-2">
            {actividadesPendientes.length > 0 ? (
              actividadesPendientes.map((actividad) => (
                <div key={actividad.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                  <div className="text-xl">
                    {actividad.tipo === 'Llamada' ? '📞' :
                     actividad.tipo === 'Reunión' ? '🤝' :
                     actividad.tipo === 'Email' ? '📧' :
                     actividad.tipo === 'Nota' ? '📝' : '✅'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-900">{actividad.titulo}</p>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{actividad.descripcion}</p>
                    <p className="text-xs text-gray-400 mt-1">{new Date(actividad.fecha).toLocaleDateString('es-ES')}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-400 py-8 text-sm">No hay actividades pendientes</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
