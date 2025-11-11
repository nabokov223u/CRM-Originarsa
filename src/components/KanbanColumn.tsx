import React from 'react';
import { Lead, LeadStatus } from '../utils/types';

interface KanbanColumnProps {
  title: string;
  status: LeadStatus;
  leads: Lead[];
  count: number;
  color: string;
  onLeadClick: (lead: Lead) => void;
  onDrop: (leadId: string, newStatus: LeadStatus) => void;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
  title,
  status,
  leads,
  count,
  color,
  onLeadClick,
  onDrop,
}) => {
  const [isDraggingOver, setIsDraggingOver] = React.useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragLeave = () => {
    setIsDraggingOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    
    const leadId = e.dataTransfer.getData('leadId');
    if (leadId) {
      onDrop(leadId, status);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-EC', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'Alta': return 'text-red-600 bg-red-50';
      case 'Media': return 'text-yellow-600 bg-yellow-50';
      case 'Baja': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getColumnStyle = (color: string) => {
    const styles: Record<string, { header: string; badge: string; border: string; hover: string }> = {
      blue: {
        header: 'bg-blue-50 border-blue-200',
        badge: 'bg-blue-200 text-blue-900',
        border: 'border-blue-400 bg-blue-50',
        hover: 'hover:border-blue-300'
      },
      yellow: {
        header: 'bg-yellow-50 border-yellow-200',
        badge: 'bg-yellow-200 text-yellow-900',
        border: 'border-yellow-400 bg-yellow-50',
        hover: 'hover:border-yellow-300'
      },
      orange: {
        header: 'bg-orange-50 border-orange-200',
        badge: 'bg-orange-200 text-orange-900',
        border: 'border-orange-400 bg-orange-50',
        hover: 'hover:border-orange-300'
      },
      purple: {
        header: 'bg-purple-50 border-purple-200',
        badge: 'bg-purple-200 text-purple-900',
        border: 'border-purple-400 bg-purple-50',
        hover: 'hover:border-purple-300'
      },
      indigo: {
        header: 'bg-indigo-50 border-indigo-200',
        badge: 'bg-indigo-200 text-indigo-900',
        border: 'border-indigo-400 bg-indigo-50',
        hover: 'hover:border-indigo-300'
      },
      green: {
        header: 'bg-green-50 border-green-200',
        badge: 'bg-green-200 text-green-900',
        border: 'border-green-400 bg-green-50',
        hover: 'hover:border-green-300'
      },
    };
    return styles[color] || styles.blue;
  };

  const columnStyle = getColumnStyle(color);

  return (
    <div className="flex-shrink-0 w-80">
      {/* Header de la columna */}
      <div className={`${columnStyle.header} border-2 rounded-t-lg p-3`}>
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <span className={`${columnStyle.badge} px-2 py-1 rounded-full text-sm font-bold`}>
            {count}
          </span>
        </div>
      </div>

      {/* Área de drop */}
      <div
        className={`min-h-[500px] border-2 ${
          isDraggingOver ? columnStyle.border : 'border-gray-200 bg-gray-50'
        } rounded-b-lg p-2 transition-colors`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {leads.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            <p>No hay leads en este estado</p>
          </div>
        ) : (
          <div className="space-y-2">
            {leads.map((lead) => (
              <KanbanCard
                key={lead.id}
                lead={lead}
                onClick={() => onLeadClick(lead)}
                getPriorityColor={getPriorityColor}
                formatCurrency={formatCurrency}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

interface KanbanCardProps {
  lead: Lead;
  onClick: () => void;
  getPriorityColor: (priority?: string) => string;
  formatCurrency: (amount: number) => string;
}

const KanbanCard: React.FC<KanbanCardProps> = ({
  lead,
  onClick,
  getPriorityColor,
  formatCurrency,
}) => {
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('leadId', lead.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onClick={onClick}
      className="bg-white border border-gray-200 rounded-lg p-3 cursor-pointer hover:shadow-md transition-shadow"
    >
      {/* Nombre y prioridad */}
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-semibold text-gray-900 text-sm flex-1">
          {lead.fullName}
        </h4>
        {lead.prioridad && (
          <span className={`text-xs px-2 py-0.5 rounded-full ml-2 ${getPriorityColor(lead.prioridad)}`}>
            {lead.prioridad}
          </span>
        )}
      </div>

      {/* Monto */}
      <div className="text-lg font-bold text-green-600 mb-2">
        {formatCurrency(lead.vehicleAmount || 0)}
      </div>

      {/* Info adicional */}
      <div className="space-y-1 text-xs text-gray-600">
        {lead.phone && (
          <div className="flex items-center">
            <span className="mr-1">📱</span>
            <span>{lead.phone}</span>
          </div>
        )}
        
        {lead.vehiculoInteres && (
          <div className="flex items-center">
            <span className="mr-1">🚗</span>
            <span className="truncate">{lead.vehiculoInteres}</span>
          </div>
        )}

        {lead.asignadoA && (
          <div className="flex items-center">
            <span className="mr-1">👤</span>
            <span className="truncate">{lead.asignadoA}</span>
          </div>
        )}
      </div>

      {/* Fuente */}
      <div className="mt-2 pt-2 border-t border-gray-100">
        <span className="inline-flex items-center text-xs text-gray-500">
          <span className="mr-1">🔥</span>
          {lead.fuente}
        </span>
      </div>
    </div>
  );
};
