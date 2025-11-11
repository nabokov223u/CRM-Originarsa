import React, { useState } from 'react';
import { Lead } from '../utils/types';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Modal } from '../components/Modal';
import { exportToCSV, exportToJSON, exportToExcel } from '../utils/export';
import { unifiedLeadsService } from '../services/unifiedLeads';

interface LeadsPageProps {
  leads: Lead[];
  onAddLead: (lead: Omit<Lead, 'id'>) => void;
  onUpdateLead: (id: string, lead: Partial<Lead>) => void;
  onDeleteLead: (id: string) => void;
  showModal?: boolean;
  setShowModal?: (show: boolean) => void;
}

export const LeadsPage: React.FC<LeadsPageProps> = ({ 
  leads, 
  onAddLead, 
  onUpdateLead, 
  onDeleteLead,
  showModal: externalShowModal,
  setShowModal: externalSetShowModal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('Todos');
  const [internalIsModalOpen, setInternalIsModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [showExportMenu, setShowExportMenu] = useState(false);
  
  // Usar el estado externo si está disponible, sino usar el interno
  const isModalOpen = externalShowModal !== undefined ? externalShowModal : internalIsModalOpen;
  const setIsModalOpen = externalSetShowModal || setInternalIsModalOpen;
  
  // Form state
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    idNumber: '',
    maritalStatus: '',
    modelo: '',
    status: 'Nuevo' as Lead['status'],
    fuente: 'Web' as Lead['fuente'],
    vehicleAmount: '',
    downPaymentPct: '',
    termMonths: '',
    notas: '',
    asignadoA: '',
    // Campos deprecated para compatibilidad
    nombres: '',
    apellidos: '',
    telefono: '',
    cedula: '',
    presupuesto: '',
  });

  const resetForm = () => {
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      idNumber: '',
      maritalStatus: '',
      modelo: '',
      status: 'Nuevo',
      fuente: 'Web',
      vehicleAmount: '',
      downPaymentPct: '',
      termMonths: '',
      notas: '',
      asignadoA: '',
      // Campos deprecated
      nombres: '',
      apellidos: '',
      telefono: '',
      cedula: '',
      presupuesto: '',
    });
    setEditingLead(null);
  };

  const handleOpenModal = (lead?: Lead) => {
    if (lead) {
      setEditingLead(lead);
      setFormData({
        fullName: lead.fullName || `${lead.nombres || ''} ${lead.apellidos || ''}`.trim(),
        email: lead.email || '',
        phone: lead.phone || lead.telefono || '',
        idNumber: lead.idNumber || lead.cedula || '',
        maritalStatus: lead.maritalStatus || '',
        modelo: lead.modelo || '',
        status: lead.status,
        fuente: lead.fuente,
        vehicleAmount: (lead.vehicleAmount || lead.presupuesto)?.toString() || '',
        downPaymentPct: (lead.downPaymentPct ? (lead.downPaymentPct * 100).toString() : ''),
        termMonths: lead.termMonths?.toString() || '',
        notas: lead.notas || '',
        asignadoA: lead.asignadoA || '',
        // Campos deprecated
        nombres: lead.nombres || '',
        apellidos: lead.apellidos || '',
        telefono: lead.telefono || lead.phone || '',
        cedula: lead.cedula || lead.idNumber || '',
        presupuesto: (lead.presupuesto || lead.vehicleAmount)?.toString() || '',
      });
    } else {
      resetForm();
    }
    setIsModalOpen(true);
  };

  const handleSubmit = () => {
    const leadData = {
      // Campos principales
      fullName: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      idNumber: formData.idNumber,
      maritalStatus: formData.maritalStatus || undefined,
      status: formData.status,
      fuente: formData.fuente,
      fechaCreacion: new Date().toISOString().split('T')[0],
      ultimaInteraccion: new Date().toISOString().split('T')[0],
      // Información del vehículo/préstamo
      vehicleAmount: formData.vehicleAmount ? parseFloat(formData.vehicleAmount) : undefined,
      downPaymentPct: formData.downPaymentPct ? parseFloat(formData.downPaymentPct) / 100 : undefined,
      termMonths: formData.termMonths ? parseInt(formData.termMonths) : undefined,
      modelo: formData.modelo || undefined,
      notas: formData.notas || undefined,
      asignadoA: formData.asignadoA || undefined,
      // Campos deprecated para compatibilidad
      nombres: formData.nombres || formData.fullName.split(' ').slice(0, 2).join(' '),
      apellidos: formData.apellidos || formData.fullName.split(' ').slice(2).join(' '),
      telefono: formData.telefono || formData.phone,
      cedula: formData.cedula || formData.idNumber,
      presupuesto: formData.presupuesto ? parseFloat(formData.presupuesto) : (formData.vehicleAmount ? parseFloat(formData.vehicleAmount) : undefined),
    };

    if (editingLead) {
      onUpdateLead(editingLead.id, leadData);
    } else {
      onAddLead(leadData);
    }
    
    setIsModalOpen(false);
    resetForm();
  };

  // Filtrar leads
  const filteredLeads = leads.filter(lead => {
    const matchesSearch = 
      (lead.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lead.nombres || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lead.apellidos || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lead.phone || lead.telefono || '').includes(searchTerm) ||
      (lead.idNumber || lead.cedula || '').includes(searchTerm) ||
      (lead.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'Todos' || lead.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const handleExport = (format: 'csv' | 'json' | 'excel') => {
    const dataToExport = filteredLeads.length > 0 ? filteredLeads : leads;
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `leads_originarsa_${timestamp}`;
    
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
    <div className="space-y-4">
      {/* Filtros y búsqueda */}
      <Card>
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1">
            <Input
              placeholder="🔍 Buscar por nombre, teléfono o cédula..."
              value={searchTerm}
              onChange={setSearchTerm}
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm bg-white"
            >
              <option>Todos</option>
              <option>Nuevo</option>
              <option>Contactado</option>
              <option>Negociación</option>
              <option>Aprobado</option>
              <option>Perdido</option>
            </select>
            
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
            
            <Button onClick={() => handleOpenModal()}>
              + Nuevo Lead
            </Button>
          </div>
        </div>
      </Card>

      {/* Tabla de Leads */}
      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Nombre</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Contacto</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Modelo</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Fuente</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Presupuesto</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {filteredLeads.length > 0 ? (
                filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="font-semibold text-sm text-gray-900">
                          {lead.fullName || `${lead.nombres || ''} ${lead.apellidos || ''}`.trim()}
                        </div>
                        {unifiedLeadsService.isFromCrediExpress(lead.id) && (
                          <span className="px-1.5 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-700 border border-purple-200">
                            🔥 CrediExpress
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">
                        CI: {lead.idNumber || lead.cedula}
                        {lead.maritalStatus && <span className="ml-2">• {lead.maritalStatus}</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{lead.phone || lead.telefono}</div>
                      <div className="text-xs text-gray-500">{lead.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {lead.modelo || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${
                        lead.status === 'Nuevo' ? 'bg-blue-50 text-blue-700' :
                        lead.status === 'Contactado' ? 'bg-yellow-50 text-yellow-700' :
                        lead.status === 'Negociación' ? 'bg-orange-50 text-orange-700' :
                        lead.status === 'Aprobado' ? 'bg-green-50 text-green-700' :
                        'bg-red-50 text-red-700'
                      }`}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {lead.fuente}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {(() => {
                        const amount = lead.vehicleAmount || lead.presupuesto;
                        return amount ? `$${amount.toLocaleString()}` : '-';
                      })()}
                      {lead.downPaymentPct && (
                        <div className="text-xs text-gray-500">
                          Inicial: {(lead.downPaymentPct * 100).toFixed(1)}%
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                      {unifiedLeadsService.isFromCrediExpress(lead.id) ? (
                        // Botones deshabilitados para leads de CrediExpress
                        <div className="space-x-3">
                          <span className="text-gray-400 cursor-not-allowed" title="No se puede editar desde el CRM">
                            Editar
                          </span>
                          <span className="text-gray-400 cursor-not-allowed" title="No se puede eliminar desde el CRM">
                            Eliminar
                          </span>
                        </div>
                      ) : (
                        // Botones habilitados para leads del CRM
                        <div className="space-x-3">
                          <button
                            onClick={() => handleOpenModal(lead)}
                            className="text-purple-600 hover:text-purple-900"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('¿Estás seguro de eliminar este lead?')) {
                                onDeleteLead(lead.id);
                              }
                            }}
                            className="text-red-600 hover:text-red-900"
                          >
                            Eliminar
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-400 text-sm">
                    No se encontraron leads
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal para crear/editar lead */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        title={editingLead ? 'Editar Lead' : 'Nuevo Lead'}
        footer={
          <>
            <Button variant="secondary" onClick={() => {
              setIsModalOpen(false);
              resetForm();
            }}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit}>
              {editingLead ? 'Actualizar' : 'Crear'}
            </Button>
          </>
        }
      >
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <Input
              label="Nombre Completo"
              value={formData.fullName}
              onChange={(value) => setFormData({ ...formData, fullName: value })}
              required
            />
          </div>
          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(value) => setFormData({ ...formData, email: value })}
            required
          />
          <Input
            label="Teléfono"
            value={formData.phone}
            onChange={(value) => setFormData({ ...formData, phone: value })}
            required
          />
          <Input
            label="Número de Cédula"
            value={formData.idNumber}
            onChange={(value) => setFormData({ ...formData, idNumber: value })}
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estado Civil</label>
            <select
              value={formData.maritalStatus}
              onChange={(e) => setFormData({ ...formData, maritalStatus: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">Seleccionar...</option>
              <option value="single">Soltero/a</option>
              <option value="married">Casado/a</option>
              <option value="divorced">Divorciado/a</option>
              <option value="widowed">Viudo/a</option>
            </select>
          </div>
          <Input
            label="Modelo de Interés"
            value={formData.modelo}
            onChange={(value) => setFormData({ ...formData, modelo: value })}
          />
          <Input
            label="Monto del Vehículo"
            type="number"
            value={formData.vehicleAmount}
            onChange={(value) => setFormData({ ...formData, vehicleAmount: value })}
            placeholder="15000"
          />
          <Input
            label="% Cuota Inicial"
            type="number"
            value={formData.downPaymentPct}
            onChange={(value) => setFormData({ ...formData, downPaymentPct: value })}
            placeholder="20"
          />
          <Input
            label="Plazo (meses)"
            type="number"
            value={formData.termMonths}
            onChange={(value) => setFormData({ ...formData, termMonths: value })}
            placeholder="48"
          />
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Estado *</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as Lead['status'] })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
            >
              <option>Nuevo</option>
              <option>Contactado</option>
              <option>Negociación</option>
              <option>Aprobado</option>
              <option>Perdido</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Fuente *</label>
            <select
              value={formData.fuente}
              onChange={(e) => setFormData({ ...formData, fuente: e.target.value as Lead['fuente'] })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
            >
              <option>Web</option>
              <option>Referido</option>
              <option>Redes Sociales</option>
              <option>Llamada</option>
              <option>CrediExpress</option>
            </select>
          </div>
          <Input
            label="Asignado a"
            value={formData.asignadoA}
            onChange={(value) => setFormData({ ...formData, asignadoA: value })}
          />
          <div className="col-span-2">
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Notas</label>
            <textarea
              value={formData.notas}
              onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};
