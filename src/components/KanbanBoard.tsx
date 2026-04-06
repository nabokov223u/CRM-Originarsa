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
  { status: 'Por Facturar', title: '📋 Por Facturar', color: 'primary' },
  { status: 'Facturado', title: '✅ Facturado', color: 'green' },
  { status: 'Seguimiento', title: '🔄 Seguimiento', color: 'yellow' },
  { status: 'Caido', title: '❌ Caído', color: 'orange' },
  { status: 'No Contactado', title: '📵 No Contactado', color: 'purple' },
];

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  leads,
  onLeadClick,
  onStatusChange,
}) => {
  // Agrupar leads por estado
  const leadsByStatus = React.useMemo(() => {
    const grouped: Record<LeadStatus, Lead[]> = {
      'Por Facturar': [],
      'Facturado': [],
      'Seguimiento': [],
      'Caido': [],
      'No Contactado': [],
    };

    leads.forEach((lead) => {
      const status = lead.status || 'Por Facturar';
      if (grouped[status]) {
        grouped[status].push(lead);
      } else {
        // Mapear estados antiguos al nuevo pipeline
        grouped['Por Facturar'].push(lead);
      }
    });

    return grouped;
  }, [leads]);

  // Calcular estadísticas
  const stats = React.useMemo(() => {
    const totalValue = leads.reduce((sum, lead) => sum + (lead.vehicleAmount || 0), 0);
    const wonLeads = leadsByStatus['Facturado'].length;
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
          <div className="text-sm text-gray-600">Facturados</div>
          <div className="text-2xl font-bold text-emerald-600">{stats.wonLeads}</div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Tasa Conversión</div>
          <div className="text-2xl font-bold text-primary">{stats.conversionRate.toFixed(1)}%</div>
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
    </div>
  );
};
