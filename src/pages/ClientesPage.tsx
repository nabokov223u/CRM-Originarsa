import React, { useState } from 'react';
import { Cliente } from '../utils/types';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { exportToCSV, exportToJSON, exportToExcel } from '../utils/export';

interface ClientesPageProps {
  clientes: Cliente[];
}

export const ClientesPage: React.FC<ClientesPageProps> = ({ clientes }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showExportMenu, setShowExportMenu] = useState(false);

  const filteredClientes = clientes.filter(cliente =>
    cliente.nombres.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.apellidos.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.telefono.includes(searchTerm) ||
    cliente.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExport = (format: 'csv' | 'json' | 'excel') => {
    const dataToExport = filteredClientes.length > 0 ? filteredClientes : clientes;
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `clientes_originarsa_${timestamp}`;
    
    switch (format) {
      case 'csv':
        exportToCSV(dataToExport, filename);
        break;
      case 'json':
        exportToJSON(dataToExport, filename);
        break;
      case 'excel':
        exportToExcel(dataToExport, filename);
        break;
    }
    
    setShowExportMenu(false);
  };

  return (
    <div className="space-y-6">
      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="text-center">
            <div className="text-4xl mb-2">👥</div>
            <div className="text-3xl font-bold text-gray-900">{clientes.length}</div>
            <div className="text-gray-600 mt-1">Total Clientes</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-4xl mb-2">🚗</div>
            <div className="text-3xl font-bold text-gray-900">
              {clientes.reduce((sum, c) => sum + c.vehiculosComprados, 0)}
            </div>
            <div className="text-gray-600 mt-1">Vehículos Vendidos</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-4xl mb-2">💰</div>
            <div className="text-3xl font-bold text-gray-900">
              ${clientes.reduce((sum, c) => sum + c.valorTotal, 0).toLocaleString()}
            </div>
            <div className="text-gray-600 mt-1">Valor Total</div>
          </div>
        </Card>
      </div>

      {/* Búsqueda */}
      <Card>
        <div className="flex gap-3">
          <div className="flex-1">
            <Input
              placeholder="🔍 Buscar por nombre, teléfono o email..."
              value={searchTerm}
              onChange={setSearchTerm}
            />
          </div>
          
          {/* Botón de Exportar con menú dropdown */}
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
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contacto</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehículos</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Última Compra</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredClientes.length > 0 ? (
                filteredClientes.map((cliente) => (
                  <tr key={cliente.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-semibold text-gray-900">{cliente.nombres} {cliente.apellidos}</div>
                      <div className="text-sm text-gray-500">CI: {cliente.cedula}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{cliente.telefono}</div>
                      <div className="text-sm text-gray-500">{cliente.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-blue-600">{cliente.vehiculosComprados}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-green-600">
                        ${cliente.valorTotal.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {cliente.ultimaCompra ? new Date(cliente.ultimaCompra).toLocaleDateString('es-ES') : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-blue-600 hover:text-blue-900">
                        Ver Detalles
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No se encontraron clientes
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
