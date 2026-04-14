import React, { useState } from 'react';
import { Lead, LeadStatus } from '../utils/types';

interface LeadsTableViewProps {
  leads: Lead[];
  onLeadClick: (lead: Lead) => void;
  onStatusChange: (leadId: string, newStatus: LeadStatus) => void;
}

export const LeadsTableView: React.FC<LeadsTableViewProps> = ({
  leads,
  onLeadClick,
  onStatusChange,
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-EC', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-EC', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const getStatusColor = (status: LeadStatus) => {
    switch (status) {
      case 'Por Facturar':
        return 'bg-blue-100 text-blue-800';
      case 'Facturado':
        return 'bg-green-100 text-green-800';
      case 'Seguimiento':
        return 'bg-yellow-100 text-yellow-800';
      case 'Cita Agendada':
        return 'bg-indigo-100 text-indigo-800';
      case 'Caido':
        return 'bg-red-100 text-red-800';
      case 'No Contactado':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const statusOptions: LeadStatus[] = [
    'Por Facturar',
    'Seguimiento',
    'Cita Agendada',
    'Facturado',
    'Caido',
    'No Contactado',
  ];

  const getEtiquetaColor = (etiqueta?: string) => {
    switch (etiqueta) {
      case 'Condiciones': return 'bg-amber-100 text-amber-800';
      case 'Inventario': return 'bg-indigo-100 text-indigo-800';
      case 'Contado': return 'bg-emerald-100 text-emerald-800';
      case 'Cotización': return 'bg-cyan-100 text-cyan-800';
      case 'Competencia': return 'bg-rose-100 text-rose-800';
      case 'Inubicable': return 'bg-gray-200 text-gray-700';
      case 'Seguimiento': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const [expandedNotes, setExpandedNotes] = useState<Record<string, boolean>>({});

  if (leads.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
        <div className="text-4xl mb-4">📭</div>
        <h3 className="text-lg font-semibold text-primary mb-2">No hay leads</h3>
        <p className="text-gray-400 text-sm">Los leads aparecerán aquí cuando lleguen desde CrediExpress</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-100">
          <thead className="bg-gray-50/80">
            <tr>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider max-w-[180px]">
                Cliente
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider max-w-[160px]">
                Contacto
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Monto
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Etiqueta
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Asesor
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Fecha Inicio
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Última Nota
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-50">
            {leads.map((lead) => (
              <tr
                key={lead.id}
                className="hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => onLeadClick(lead)}
              >
                <td className="px-3 py-4 whitespace-nowrap max-w-[180px]">
                  <div className="flex items-center">
                    <div className="truncate">
                      <div className="text-sm font-medium text-primary truncate">
                        {lead.fullName}
                      </div>
                      <div className="text-xs text-gray-400">
                        {lead.idNumber}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-4 whitespace-nowrap max-w-[160px]">
                  <div className="text-sm text-primary truncate">📱 {lead.phone}</div>
                  <div className="text-xs text-gray-400 truncate">📧 {lead.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-bold text-secondary">
                    {formatCurrency(lead.vehicleAmount || 0)}
                  </div>
                  {lead.vehiculoInteres && (
                    <div className="text-xs text-gray-400">
                      🚗 {lead.vehiculoInteres}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={lead.status}
                    onChange={(e) => {
                      e.stopPropagation();
                      onStatusChange(lead.id, e.target.value as LeadStatus);
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className={`px-3 py-1 rounded-full text-xs font-medium cursor-pointer border-0 ${getStatusColor(
                      lead.status
                    )}`}
                  >
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {lead.etiqueta ? (
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getEtiquetaColor(lead.etiqueta)}`}>
                      🏷️ {lead.etiqueta}
                    </span>
                  ) : (
                    <span className="text-gray-400 text-xs">—</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {lead.asesor ? (
                    <span className="flex items-center">
                      <span className="mr-1">👤</span>
                      {lead.asesor}
                    </span>
                  ) : (
                    <span className="text-gray-400">Sin asignar</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(lead.fechaCreacion)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 max-w-[200px]" onClick={(e) => e.stopPropagation()}>
                  {lead.ultimaNota ? (
                    <div>
                      <p className={`${expandedNotes[lead.id] ? '' : 'line-clamp-2'} text-gray-700`}>
                        {lead.ultimaNota}
                      </p>
                      {lead.ultimaNota.length > 60 && (
                        <button
                          onClick={() => setExpandedNotes(prev => ({ ...prev, [lead.id]: !prev[lead.id] }))}
                          className="text-blue-600 hover:text-blue-800 text-xs mt-1 font-medium"
                        >
                          {expandedNotes[lead.id] ? 'Ver menos' : 'Ver más'}
                        </button>
                      )}
                    </div>
                  ) : (
                    <span className="text-gray-400 text-xs">Sin notas</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
