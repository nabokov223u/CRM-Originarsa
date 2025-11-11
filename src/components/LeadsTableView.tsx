import React from 'react';
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
      case 'Nuevo':
        return 'bg-blue-100 text-blue-800';
      case 'Contactado':
        return 'bg-yellow-100 text-yellow-800';
      case 'Calificado':
        return 'bg-orange-100 text-orange-800';
      case 'Negociación':
        return 'bg-purple-100 text-purple-800';
      case 'Documentación':
        return 'bg-indigo-100 text-indigo-800';
      case 'Ganado':
        return 'bg-green-100 text-green-800';
      case 'Nutrición':
        return 'bg-gray-100 text-gray-800';
      case 'Perdido':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityBadge = (priority?: string) => {
    switch (priority) {
      case 'Alta':
        return <span className="px-2 py-0.5 rounded-full text-xs bg-red-100 text-red-700">Alta</span>;
      case 'Media':
        return <span className="px-2 py-0.5 rounded-full text-xs bg-yellow-100 text-yellow-700">Media</span>;
      case 'Baja':
        return <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-700">Baja</span>;
      default:
        return null;
    }
  };

  const statusOptions: LeadStatus[] = [
    'Nuevo',
    'Contactado',
    'Calificado',
    'Negociación',
    'Documentación',
    'Ganado',
    'Nutrición',
    'Perdido',
  ];

  if (leads.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <div className="text-6xl mb-4">📭</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No hay leads</h3>
        <p className="text-gray-600">Los leads aparecerán aquí cuando lleguen desde CrediExpress</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cliente
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contacto
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Monto
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Prioridad
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Asignado a
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fuente
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {leads.map((lead) => (
              <tr
                key={lead.id}
                className="hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => onLeadClick(lead)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {lead.fullName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {lead.idNumber}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">📱 {lead.phone}</div>
                  <div className="text-sm text-gray-500">📧 {lead.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-bold text-green-600">
                    {formatCurrency(lead.vehicleAmount || 0)}
                  </div>
                  {lead.vehiculoInteres && (
                    <div className="text-xs text-gray-500">
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
                  {getPriorityBadge(lead.prioridad)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {lead.asignadoA ? (
                    <span className="flex items-center">
                      <span className="mr-1">👤</span>
                      {lead.asignadoA}
                    </span>
                  ) : (
                    <span className="text-gray-400">Sin asignar</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(lead.fechaCreacion)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                    🔥 {lead.fuente}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
