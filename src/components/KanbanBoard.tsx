import React from 'react';
import { Lead, LeadStatus } from '../utils/types';
import { KanbanColumn } from './KanbanColumn';

interface KanbanBoardProps {
  leads: Lead[];
  onLeadClick: (lead: Lead) => void;
  onStatusChange: (leadId: string, newStatus: LeadStatus) => void;
}

// Configuración de las columnas del Kanban
const KANBAN_COLUMNS: Array<{
  status: LeadStatus;
  title: string;
  color: string;
}> = [
  { status: 'Nuevo', title: '🆕 Nuevos', color: 'blue' },
  { status: 'Contactado', title: '📞 Contactados', color: 'yellow' },
  { status: 'Calificado', title: '🔥 Calificados', color: 'orange' },
  { status: 'Negociación', title: '💬 Negociación', color: 'purple' },
  { status: 'Documentación', title: '📝 Documentación', color: 'indigo' },
  { status: 'Ganado', title: '✅ Ganados', color: 'green' },
];

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  leads,
  onLeadClick,
  onStatusChange,
}) => {
  // Agrupar leads por estado
  const leadsByStatus = React.useMemo(() => {
    const grouped: Record<LeadStatus, Lead[]> = {
      'Nuevo': [],
      'Contactado': [],
      'Calificado': [],
      'Negociación': [],
      'Documentación': [],
      'Ganado': [],
      'Nutrición': [],
      'Perdido': [],
    };

    leads.forEach((lead) => {
      const status = lead.status || 'Nuevo';
      if (grouped[status]) {
        grouped[status].push(lead);
      }
    });

    return grouped;
  }, [leads]);

  // Calcular estadísticas
  const stats = React.useMemo(() => {
    const totalValue = leads.reduce((sum, lead) => sum + (lead.vehicleAmount || 0), 0);
    const wonLeads = leadsByStatus['Ganado'].length;
    const totalLeads = leads.length;
    const conversionRate = totalLeads > 0 ? (wonLeads / totalLeads) * 100 : 0;

    return {
      totalLeads,
      totalValue,
      wonLeads,
      conversionRate,
    };
  }, [leads, leadsByStatus]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-EC', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-4">
      {/* Estadísticas del Pipeline */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Total Leads</div>
          <div className="text-2xl font-bold text-gray-900">{stats.totalLeads}</div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Valor Pipeline</div>
          <div className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalValue)}</div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Ganados</div>
          <div className="text-2xl font-bold text-blue-600">{stats.wonLeads}</div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Tasa Conversión</div>
          <div className="text-2xl font-bold text-purple-600">{stats.conversionRate.toFixed(1)}%</div>
        </div>
      </div>

      {/* Tablero Kanban */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Pipeline de Ventas</h2>
          <div className="text-sm text-gray-500">
            Arrastra las tarjetas para cambiar de estado
          </div>
        </div>

        <div className="overflow-x-auto">
          <div className="flex gap-4 pb-4">
            {KANBAN_COLUMNS.map((column) => (
              <KanbanColumn
                key={column.status}
                title={column.title}
                status={column.status}
                leads={leadsByStatus[column.status] || []}
                count={leadsByStatus[column.status]?.length || 0}
                color={column.color}
                onLeadClick={onLeadClick}
                onDrop={onStatusChange}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Sección de Nutrición y Perdidos (colapsable) */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-700">🌱 En Nutrición</h3>
            <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-sm">
              {leadsByStatus['Nutrición']?.length || 0}
            </span>
          </div>
          <div className="text-sm text-gray-600">
            Leads que requieren seguimiento a largo plazo
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-700">❌ Perdidos</h3>
            <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-sm">
              {leadsByStatus['Perdido']?.length || 0}
            </span>
          </div>
          <div className="text-sm text-gray-600">
            Leads que no continuaron con el proceso
          </div>
        </div>
      </div>
    </div>
  );
};
