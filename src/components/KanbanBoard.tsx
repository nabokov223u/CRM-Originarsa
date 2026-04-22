import React from 'react';
import { Lead, LeadAlert, LeadStatus } from '../utils/types';
import { KanbanColumn } from './KanbanColumn';
import { DEFAULT_LEAD_STATUS } from '../utils/leadStatus';

interface KanbanBoardProps {
  leads: Lead[];
  onLeadClick: (lead: Lead) => void;
  onStatusChange: (leadId: string, newStatus: LeadStatus) => void;
  alertsByLeadId?: Record<string, LeadAlert>;
}

// Configuración de las columnas del Kanban (orden nuevo)
const ALL_KANBAN_COLUMNS: Array<{
  status: LeadStatus;
  title: string;
  color: string;
}> = [
  { status: 'Por Contactar', title: '📋 Por Contactar', color: 'primary' },
  { status: 'Seguimiento', title: '🔄 Seguimiento', color: 'yellow' },
  { status: 'Por Facturar', title: '🧾 Por Facturar', color: 'purple' },
  { status: 'Facturado', title: '✅ Facturado', color: 'green' },
  { status: 'Caido', title: '❌ Caído', color: 'orange' },
];

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  leads,
  onLeadClick,
  onStatusChange,
  alertsByLeadId = {},
}) => {
  // Agrupar leads por estado
  const leadsByStatus = React.useMemo(() => {
    const grouped: Record<string, Lead[]> = {
      'Por Contactar': [],
      'Por Facturar': [],
      'Seguimiento': [],
      'Facturado': [],
      'Caido': [],
      'No Contactado': [],
    };

    leads.forEach((lead) => {
      const status = lead.status || DEFAULT_LEAD_STATUS;
      if (grouped[status]) {
        grouped[status].push(lead);
      } else {
        // Mapear estados antiguos al nuevo pipeline
        grouped[DEFAULT_LEAD_STATUS].push(lead);
      }
    });

    return grouped;
  }, [leads]);

  // Calcular estadísticas
  const stats = React.useMemo(() => {
    const valueToInvoice = leadsByStatus['Por Facturar'].reduce((sum, lead) => sum + (lead.vehicleAmount || 0), 0);
    const wonLeads = leadsByStatus['Facturado'].length;
    const totalLeads = leads.length;
    const conversionRate = totalLeads > 0 ? (wonLeads / totalLeads) * 100 : 0;

    return {
      totalLeads,
      valueToInvoice,
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
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <div className="text-xs text-gray-400 font-medium uppercase tracking-wider">Total Leads</div>
          <div className="text-2xl font-bold text-primary mt-1">{stats.totalLeads}</div>
        </div>
        
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <div className="text-xs text-gray-400 font-medium uppercase tracking-wider">Valor por Facturar</div>
          <div className="text-2xl font-bold text-secondary mt-1">{formatCurrency(stats.valueToInvoice)}</div>
        </div>
        
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <div className="text-xs text-gray-400 font-medium uppercase tracking-wider">Facturados</div>
          <div className="text-2xl font-bold text-secondary mt-1">{stats.wonLeads}</div>
        </div>
        
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <div className="text-xs text-gray-400 font-medium uppercase tracking-wider">Tasa Conversión</div>
          <div className="text-2xl font-bold text-primary mt-1">{stats.conversionRate.toFixed(1)}%</div>
        </div>
      </div>

      {/* Tablero Kanban */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-primary">Pipeline de Ventas</h2>
          <div className="text-xs text-gray-400">
            Arrastra las tarjetas para cambiar de estado
          </div>
        </div>

        <div className="overflow-x-auto">
          <div className="flex gap-4 pb-4">
            {ALL_KANBAN_COLUMNS.map((column) => (
              <KanbanColumn
                key={column.status}
                title={column.title}
                status={column.status}
                leads={leadsByStatus[column.status] || []}
                count={leadsByStatus[column.status]?.length || 0}
                color={column.color}
                onLeadClick={onLeadClick}
                onDrop={onStatusChange}
                alertsByLeadId={alertsByLeadId}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
