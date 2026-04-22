import React, { useState, useMemo } from 'react';
import { Lead } from '../utils/types';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { exportToCSV, exportToJSON, exportToExcel } from '../utils/export';
import { useAuth } from '../hooks/useAuth';

interface ClientesPageProps {
  leads: Lead[];
}

export const ClientesPage: React.FC<ClientesPageProps> = ({ leads }) => {
  const { user, isAdmin } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const normalize = (value: string) => value.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  const visibleLeads = useMemo(() => {
    if (isAdmin) return leads;

    const displayName = user?.displayName?.trim();
    if (!displayName) return [];

    const normalizedName = normalize(displayName);

    return leads.filter((lead) => {
      const asesor = (lead.asesor || '').trim();
      if (!asesor) return false;
      return normalize(asesor) === normalizedName;
    });
  }, [leads, isAdmin, user?.displayName]);

  // Derivar clientes desde leads facturados
  const clientes = useMemo(() => {
    return visibleLeads
      .filter(l => l.status === 'Facturado')
      .map(l => ({
        id: l.id,
        fullName: l.fullName,
        phone: l.phone,
        email: l.email,
        idNumber: l.idNumber || l.cedula || '',
        vehicleAmount: l.montoFinal || l.vehicleAmount || 0,
        vehiculoInteres: l.vehiculoInteres || '',
        asesor: l.asesor || '',
        fechaCreacion: l.fechaCreacion,
        fechaCierre: l.fechaCierre || l.fechaCreacion,
        origen: l.origen || l.fuente || '',
      }));
  }, [visibleLeads]);

  // Filtro por fechas
  const clientesFiltradosPorFecha = useMemo(() => {
    return clientes.filter(c => {
      const fecha = new Date(c.fechaCierre || c.fechaCreacion);
      if (dateFrom && fecha < new Date(dateFrom)) return false;
      if (dateTo) {
        const to = new Date(dateTo);
        to.setHours(23, 59, 59, 999);
        if (fecha > to) return false;
      }
      return true;
    });
  }, [clientes, dateFrom, dateTo]);

  // Filtro por búsqueda
  const filteredClientes = useMemo(() => {
    if (!searchTerm.trim()) return clientesFiltradosPorFecha;
    const q = searchTerm.toLowerCase();
    return clientesFiltradosPorFecha.filter(c =>
      c.fullName.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.idNumber.includes(q)
    );
  }, [clientesFiltradosPorFecha, searchTerm]);

  const totalValor = filteredClientes.reduce((sum, c) => sum + c.vehicleAmount, 0);

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
      return new Date(dateString).toLocaleDateString('es-EC', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const handleExport = (format: 'csv' | 'json' | 'excel') => {
    const dataToExport = filteredClientes.map(c => ({
      Nombre: c.fullName,
      Cédula: c.idNumber,
      Teléfono: c.phone,
      Email: c.email,
      Monto: c.vehicleAmount,
      Vehículo: c.vehiculoInteres,
      Asesor: c.asesor,
      Origen: c.origen,
      'Fecha Cierre': c.fechaCierre,
    }));
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `clientes_facturados_${timestamp}`;
    
    if (format === 'csv') exportToCSV(dataToExport as any, filename);
    else if (format === 'json') exportToJSON(dataToExport as any, filename);
    else exportToExcel(dataToExport as any, filename);
    
    setShowExportMenu(false);
  };

  return (
    <div className="space-y-6">
      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="text-center">
            <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center text-xl mx-auto mb-2">👥</div>
            <div className="text-3xl font-bold text-primary">{filteredClientes.length}</div>
            <div className="text-gray-400 text-sm mt-1">Clientes Facturados</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center text-xl mx-auto mb-2">🚗</div>
            <div className="text-3xl font-bold text-primary">
              {filteredClientes.length}
            </div>
            <div className="text-gray-400 text-sm mt-1">Vehículos Vendidos</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center text-xl mx-auto mb-2">💰</div>
            <div className="text-3xl font-bold text-secondary">
              {formatCurrency(totalValor)}
            </div>
            <div className="text-gray-400 text-sm mt-1">Valor Total</div>
          </div>
        </Card>
      </div>

      {/* Filtros: búsqueda + fechas + exportar */}
      <Card>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[200px]">
            <Input
              placeholder="🔍 Buscar por nombre, cédula, teléfono o email..."
              value={searchTerm}
              onChange={setSearchTerm}
            />
          </div>
          
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-400 whitespace-nowrap">Desde</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-400 whitespace-nowrap">Hasta</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary"
            />
          </div>

          {(dateFrom || dateTo) && (
            <button
              onClick={() => { setDateFrom(''); setDateTo(''); }}
              className="text-xs text-secondary hover:underline whitespace-nowrap"
            >
              Limpiar fechas
            </button>
          )}
          
          {/* Exportar */}
          <div className="relative">
            <Button 
              variant="secondary" 
              onClick={() => setShowExportMenu(!showExportMenu)}
            >
              📥 Exportar
            </Button>
            
            {showExportMenu && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setShowExportMenu(false)}
                ></div>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                  <button
                    onClick={() => handleExport('csv')}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <span>📄</span> Exportar como CSV
                  </button>
                  <button
                    onClick={() => handleExport('json')}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <span>🔧</span> Exportar como JSON
                  </button>
                  <button
                    onClick={() => handleExport('excel')}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <span>📊</span> Exportar como Excel
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </Card>

      {/* Tabla de Clientes */}
      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50/80 border-b border-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Contacto</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Monto</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Vehículo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Asesor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Fecha Cierre</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-50">
              {filteredClientes.length > 0 ? (
                filteredClientes.map((cliente) => (
                  <tr key={cliente.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-sm text-primary">{cliente.fullName}</div>
                      <div className="text-xs text-gray-400">CI: {cliente.idNumber || '—'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-primary">{cliente.phone}</div>
                      <div className="text-xs text-gray-400">{cliente.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-secondary">
                        {formatCurrency(cliente.vehicleAmount)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {cliente.vehiculoInteres || '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {cliente.asesor || 'Sin asignar'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(cliente.fechaCierre)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                    {clientes.length === 0 
                      ? 'No hay leads facturados todavía' 
                      : 'No se encontraron clientes con los filtros aplicados'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
