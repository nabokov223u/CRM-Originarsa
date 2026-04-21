import React, { useState, useEffect, useMemo } from 'react';
import { Lead, LeadStatus, Actividad, ETIQUETAS_POR_ESTADO } from '../utils/types';
import { KanbanBoard } from '../components/KanbanBoard';
import { LeadsTableView } from '../components/LeadsTableView';
import { ActivityTimeline } from '../components/ActivityTimeline';
import { Modal } from '../components/Modal';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Header } from '../components/HeaderNew';
import { unifiedLeadsService } from '../services/unifiedLeads';
import { leadsService } from '../services/firestore/leads';
import { applicationsService } from '../services/firestore/applications';
import { getActivitiesByLead, createNoteActivity } from '../services/firestore/activities';
import { exportToCSV, exportToJSON, exportToExcel } from '../utils/export';
import { useAuth } from '../hooks/useAuth';
import { LayoutGrid, List, Search, Download, ChevronDown } from 'lucide-react';

export const LeadsPageKanban: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [leadActivities, setLeadActivities] = useState<Actividad[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(false);
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  
  // Estado para búsqueda
  const [searchQuery, setSearchQuery] = useState('');
  const [showExportMenu, setShowExportMenu] = useState(false);
  
  // Estado para editar lead
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Lead>>({});
  
  // Estado para agregar nota rápida
  const [noteDescription, setNoteDescription] = useState('');

  // Estado para filtro de asesor (admin)
  const [selectedAsesor, setSelectedAsesor] = useState<string>('todos');

  // Estado para crear nuevo lead
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    idNumber: '',
    vehicleAmount: '',
    status: 'Por Facturar' as LeadStatus,
    etiqueta: '',
    origen: '',
    asesor: '',
    observaciones: '',
  });

  // Cargar leads con suscripción en tiempo real
  useEffect(() => {
    setLoading(true);
    console.log('🔄 Suscribiéndose a cambios en tiempo real...');
    
    // Suscribirse a cambios en tiempo real
    const unsubscribe = unifiedLeadsService.subscribeToAllLeads((data) => {
      console.log('✅ Leads actualizados en tiempo real:', data.length);
      setLeads(data);
      setLoading(false);
    });

    // Cleanup: cancelar suscripción al desmontar
    return () => {
      console.log('🔌 Desconectando suscripción en tiempo real');
      unsubscribe();
    };
  }, []);

  // Cargar actividades del lead seleccionado
  useEffect(() => {
    if (selectedLead) {
      loadActivities(selectedLead.id);
    }
  }, [selectedLead]);

  const loadActivities = async (leadId: string) => {
    try {
      setLoadingActivities(true);
      const activities = await getActivitiesByLead(leadId);
      setLeadActivities(activities);
    } catch (error) {
      console.error('Error cargando actividades:', error);
    } finally {
      setLoadingActivities(false);
    }
  };

  // Manejar cambio de estado
  const handleStatusChange = async (leadId: string, newStatus: LeadStatus) => {
    try {
      // Verificar si el lead viene de CrediExpress
      const isCrediExpress = leadId.startsWith('crediexpress_');
      
      if (isCrediExpress) {
        // Para leads de CrediExpress, actualizar usando unifiedLeadsService
        const realId = leadId.replace('crediexpress_', '');
        await unifiedLeadsService.updateApplicationStatus(realId, newStatus);
      } else {
        // Para leads normales del CRM
        await leadsService.updateStatus(leadId, newStatus, 'Usuario Actual');
      }
      
      // ✅ Ya no necesitamos actualizar localmente - la suscripción en tiempo real lo hace automáticamente

      // Si es el lead seleccionado, recargar actividades
      if (selectedLead?.id === leadId) {
        if (!isCrediExpress) {
          loadActivities(leadId);
        }
        setSelectedLead(prev => prev ? { ...prev, status: newStatus } : null);
      }

      console.log('✅ Estado actualizado correctamente');
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      alert('Error al actualizar el estado del lead. ' + (error as Error).message);
    }
  };

  // Manejar clic en lead (abrir modal con detalle)
  const handleLeadClick = (lead: Lead) => {
    setSelectedLead(lead);
    setIsEditing(false);
    setEditForm({});
  };

  // Cerrar modal
  const handleCloseModal = () => {
    setSelectedLead(null);
    setIsEditing(false);
    setEditForm({});
    setNoteDescription('');
  };

  // Iniciar edición del lead
  const handleStartEdit = () => {
    if (selectedLead) {
      setEditForm({
        fullName: selectedLead.fullName,
        phone: selectedLead.phone,
        email: selectedLead.email,
        origen: selectedLead.origen || '',
        asesor: selectedLead.asesor || '',
        vehiculoInteres: selectedLead.vehiculoInteres || '',
        observaciones: selectedLead.observaciones || '',
      });
      setIsEditing(true);
    }
  };

  // Guardar edición del lead
  const handleSaveEdit = async () => {
    if (!selectedLead) return;
    const isCrediExpress = selectedLead.id.startsWith('crediexpress_');
    if (isCrediExpress) {
      alert('Los leads de CrediExpress no se pueden editar directamente');
      return;
    }
    try {
      await leadsService.update(selectedLead.id, editForm);
      setSelectedLead(prev => prev ? { ...prev, ...editForm } : null);
      setIsEditing(false);
      console.log('✅ Lead actualizado correctamente');
    } catch (error) {
      console.error('Error actualizando lead:', error);
      alert('Error al guardar los cambios');
    }
  };

  // Normalizar texto removiendo acentos para comparación
  const normalize = (str: string) => str.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  // Lista de asesores únicos para el filtro admin
  const asesoresUnicos = useMemo(() => {
    const set = new Set<string>();
    leads.forEach(l => { if (l.asesor?.trim()) set.add(l.asesor.trim()); });
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'es'));
  }, [leads]);

  // Filtrar leads por asesor (no-admin solo ve sus leads, admin puede filtrar)
  const userLeads = useMemo(() => {
    if (isAdmin) {
      if (selectedAsesor === 'todos') return leads;
      return leads.filter(lead => {
        const asesor = (lead.asesor || '').trim();
        return normalize(asesor) === normalize(selectedAsesor);
      });
    }
    const name = user?.displayName?.trim();
    if (!name) return [];
    const normalizedName = normalize(name);
    return leads.filter(lead => {
      const asesor = (lead.asesor || '').trim();
      if (!asesor) return false;
      return normalize(asesor) === normalizedName;
    });
  }, [leads, isAdmin, user?.displayName, selectedAsesor]);

  // Filtrar leads por búsqueda
  const filteredLeads = useMemo(() => {
    if (!searchQuery.trim()) return userLeads;
    const q = searchQuery.toLowerCase();
    const safe = (val: unknown) => (val != null ? String(val).toLowerCase() : '');
    return userLeads.filter(lead => 
      safe(lead.fullName).includes(q) ||
      safe(lead.phone).includes(q) ||
      safe(lead.email).includes(q) ||
      safe(lead.asesor).includes(q) ||
      safe(lead.origen).includes(q) ||
      safe(lead.idNumber).includes(q)
    );
  }, [userLeads, searchQuery]);

  // Exportar leads
  const handleExport = (format: 'csv' | 'json' | 'excel') => {
    const dataToExport = filteredLeads.map(l => ({
      Nombre: l.fullName,
      Teléfono: l.phone,
      Email: l.email,
      Cédula: l.idNumber,
      Estado: l.status,
      Etiqueta: l.etiqueta || '',
      Origen: l.origen || '',
      Asesor: l.asesor || '',
      'Monto Vehículo': l.vehicleAmount || 0,
      'Vehículo Interés': l.vehiculoInteres || '',
      'Fecha Creación': l.fechaCreacion,
      Observaciones: l.observaciones || '',
    }));
    const filename = `leads_${new Date().toISOString().split('T')[0]}`;
    if (format === 'csv') exportToCSV(dataToExport as any, filename);
    else if (format === 'json') exportToJSON(dataToExport as any, filename);
    else exportToExcel(dataToExport as any, filename);
    setShowExportMenu(false);
  };

  // Crear nuevo lead
  const handleCreateLead = async () => {
    if (!createForm.fullName.trim() || !createForm.phone.trim()) {
      alert('Por favor ingresa al menos nombre y teléfono');
      return;
    }

    try {
      const newLead: Omit<Lead, 'id'> = {
        fullName: createForm.fullName.trim(),
        phone: createForm.phone.trim(),
        email: createForm.email.trim(),
        idNumber: createForm.idNumber.trim(),
        vehicleAmount: createForm.vehicleAmount ? parseFloat(createForm.vehicleAmount) : 0,
        status: createForm.status,
        etiqueta: createForm.etiqueta || undefined,
        origen: createForm.origen.trim() || undefined,
        asesor: createForm.asesor.trim() || undefined,
        prioridad: 'Media',
        fuente: 'Web',
        fechaCreacion: new Date().toISOString().split('T')[0],
        observaciones: createForm.observaciones.trim() || undefined,
        nombres: createForm.fullName.trim().split(' ').slice(0, 2).join(' '),
        apellidos: createForm.fullName.trim().split(' ').slice(2).join(' '),
        telefono: createForm.phone.trim(),
        cedula: createForm.idNumber.trim(),
        presupuesto: createForm.vehicleAmount ? parseFloat(createForm.vehicleAmount) : 0,
      };

      await leadsService.create(newLead);
      console.log('✅ Lead creado correctamente');
      
      // Reset form
      setCreateForm({
        fullName: '',
        phone: '',
        email: '',
        idNumber: '',
        vehicleAmount: '',
        status: 'Por Facturar',
        etiqueta: '',
        origen: '',
        asesor: '',
        observaciones: '',
      });
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error creando lead:', error);
      alert('Error al crear el lead: ' + (error as Error).message);
    }
  };

  // Agregar nota rápida
  const handleAddNote = async () => {
    if (!selectedLead || !noteDescription.trim()) {
      alert('Por favor ingresa una nota');
      return;
    }

    const userName = user?.displayName || 'Usuario';

    try {
      await createNoteActivity(
        selectedLead.id,
        `Nota de ${userName}`,
        noteDescription,
        userName
      );

      // Guardar última nota en el lead
      const isCrediExpress = selectedLead.id.startsWith('crediexpress_');
      if (isCrediExpress) {
        const realId = selectedLead.id.replace('crediexpress_', '');
        await applicationsService.updateFields(realId, { ultimaNota: noteDescription });
      } else {
        await leadsService.update(selectedLead.id, { ultimaNota: noteDescription });
      }
      setSelectedLead(prev => prev ? { ...prev, ultimaNota: noteDescription } : null);

      // Recargar actividades
      loadActivities(selectedLead.id);
      
      // Limpiar form
      setNoteDescription('');
      
      console.log('✅ Nota agregada correctamente');
    } catch (error) {
      console.error('Error agregando nota:', error);
      alert('Error al agregar la nota');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-EC', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando leads...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Banner de diagnóstico cuando el filtro no encuentra leads */}
      {!isAdmin && leads.length > 0 && userLeads.length === 0 && (
        <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mx-6 mt-4 rounded">
          <p className="text-amber-800 text-sm">
            <strong>⚠️ No se encontraron leads asignados a tu cuenta.</strong><br />
            Tu nombre en el sistema: <strong>"{user?.displayName || '(sin nombre)'}"</strong><br />
            Tu email: <strong>{user?.email}</strong><br />
            Hay {leads.length} leads totales. Contacta al administrador para verificar que tu nombre coincida con el campo "Asesor" de los leads.
          </p>
        </div>
      )}

      {/* Header Estilo Bitrix24 */}
      <Header 
        title="Leads"
        onCreateNew={() => setShowCreateModal(true)}
        createButtonText="Crear"
      />

      {/* Barra de búsqueda, exportar y vista */}
      <div className="bg-white border-b border-gray-100 px-6 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Filtro asesor (admin) + Búsqueda */}
          <div className="flex items-center gap-3 flex-1">
          {isAdmin && (
            <select
              value={selectedAsesor}
              onChange={(e) => setSelectedAsesor(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary min-w-[180px]"
            >
              <option value="todos">Todos los asesores</option>
              {asesoresUnicos.map(a => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          )}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por nombre, cédula, teléfono, asesor, origen..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary text-sm"
            />
          </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Exportar */}
            <div className="relative">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-500 hover:bg-gray-50 transition-colors"
              >
                <Download className="w-4 h-4" />
                Exportar
                <ChevronDown className="w-3 h-3" />
              </button>
              {showExportMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowExportMenu(false)} />
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-20">
                    <button onClick={() => handleExport('csv')} className="w-full text-left px-4 py-2 text-sm text-gray-500 hover:bg-gray-50">
                      📄 Exportar CSV
                    </button>
                    <button onClick={() => handleExport('json')} className="w-full text-left px-4 py-2 text-sm text-gray-500 hover:bg-gray-50">
                      🔧 Exportar JSON
                    </button>
                    <button onClick={() => handleExport('excel')} className="w-full text-left px-4 py-2 text-sm text-gray-500 hover:bg-gray-50">
                      📊 Exportar Excel
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Botones de vista */}
            <div className="flex gap-1 bg-gray-50 rounded-lg p-1">
              <button
                onClick={() => setViewMode('kanban')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors text-sm ${
                  viewMode === 'kanban'
                    ? 'bg-white shadow-sm text-primary'
                    : 'text-gray-400 hover:text-primary'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
                Kanban
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors text-sm ${
                  viewMode === 'list'
                    ? 'bg-white shadow-sm text-primary'
                    : 'text-gray-400 hover:text-primary'
                }`}
              >
                <List className="w-4 h-4" />
                Lista
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="flex-1 overflow-auto bg-white p-6">
        {/* Vista Kanban */}
        {viewMode === 'kanban' && (
          <KanbanBoard
            leads={filteredLeads}
            onLeadClick={handleLeadClick}
            onStatusChange={handleStatusChange}
            isTelemarketing={user?.displayName?.trim() === 'Telemarketing' || (isAdmin && selectedAsesor === 'Telemarketing')}
          />
        )}

        {/* Vista Lista */}
        {viewMode === 'list' && (
          <LeadsTableView
            leads={filteredLeads}
            onLeadClick={handleLeadClick}
            onStatusChange={handleStatusChange}
          />
        )}
      </div>

      {/* Modal de detalle del lead */}
      {selectedLead && (
        <Modal
          isOpen={true}
          onClose={handleCloseModal}
          title={`Lead: ${selectedLead.fullName}`}
        >
          <div className="space-y-6">
            {/* Botón editar / guardar */}
            <div className="flex justify-end gap-2">
              {!selectedLead.id.startsWith('crediexpress_') && (
                isEditing ? (
                  <>
                    <Button onClick={handleSaveEdit} variant="primary">
                      💾 Guardar
                    </Button>
                    <Button variant="secondary" onClick={() => setIsEditing(false)}>
                      Cancelar
                    </Button>
                  </>
                ) : (
                  <Button onClick={handleStartEdit} variant="secondary">
                    ✏️ Editar
                  </Button>
                )
              )}
              {/* WhatsApp */}
              {selectedLead.phone && (
                <a
                  href={`https://wa.me/${String(selectedLead.phone).replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-secondary hover:bg-secondary-hover text-white rounded-lg text-sm font-medium transition-colors"
                >
                  💬 WhatsApp
                </a>
              )}
            </div>

            {/* Información del lead */}
            {isEditing ? (
              <div className="space-y-4">
                <Input
                  label="Nombre Completo"
                  value={editForm.fullName || ''}
                  onChange={(val) => setEditForm({...editForm, fullName: val})}
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Teléfono"
                    value={editForm.phone || ''}
                    onChange={(val) => setEditForm({...editForm, phone: val})}
                  />
                  <Input
                    label="Email"
                    value={editForm.email || ''}
                    onChange={(val) => setEditForm({...editForm, email: val})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Origen"
                    value={editForm.origen || ''}
                    onChange={(val) => setEditForm({...editForm, origen: val})}
                    placeholder="Ej: Facebook Ads, Google, n8n"
                  />
                  <Input
                    label="Asesor a Cargo"
                    value={editForm.asesor || ''}
                    onChange={(val) => setEditForm({...editForm, asesor: val})}
                    placeholder="Nombre del asesor"
                  />
                </div>
                <Input
                  label="Vehículo de Interés"
                  value={editForm.vehiculoInteres || ''}
                  onChange={(val) => setEditForm({...editForm, vehiculoInteres: val})}
                  placeholder="Modelo del vehículo"
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
                  <textarea
                    value={editForm.observaciones || ''}
                    onChange={(e) => setEditForm({...editForm, observaciones: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-secondary/30 focus:border-secondary text-sm"
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Nombre Completo</label>
                  <p className="text-primary text-sm mt-0.5">{selectedLead.fullName}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Cédula</label>
                  <p className="text-primary text-sm mt-0.5">{selectedLead.idNumber || selectedLead.cedula || '—'}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Estado</label>
                  <p className="text-primary text-sm mt-0.5">
                    <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs">
                      {selectedLead.status}
                    </span>
                    {selectedLead.etiqueta && (
                      <span className="ml-2 px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full text-xs">
                        🏷️ {selectedLead.etiqueta}
                      </span>
                    )}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Fecha de Inicio</label>
                  <p className="text-primary text-sm mt-0.5">📅 {selectedLead.fechaCreacion ? new Date(selectedLead.fechaCreacion).toLocaleDateString('es-EC', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Teléfono</label>
                  <p className="text-primary text-sm mt-0.5">{selectedLead.phone}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Email</label>
                  <p className="text-primary text-sm mt-0.5">{selectedLead.email}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Monto Vehículo</label>
                  <p className="text-secondary font-bold text-sm mt-0.5">
                    {formatCurrency(selectedLead.vehicleAmount || 0)}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Origen</label>
                  <p className="text-primary text-sm mt-0.5">📡 {selectedLead.origen || 'Sin definir'}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Asesor a Cargo</label>
                  <p className="text-primary text-sm mt-0.5">👤 {selectedLead.asesor || 'Sin asignar'}</p>
                </div>
                {selectedLead.vehiculoInteres && (
                  <div>
                    <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Vehículo de Interés</label>
                    <p className="text-primary text-sm mt-0.5">🚗 {selectedLead.vehiculoInteres}</p>
                  </div>
                )}
                {selectedLead.observaciones && (
                  <div className="col-span-2">
                    <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Observaciones</label>
                    <p className="text-gray-500 text-sm mt-0.5 whitespace-pre-line">{selectedLead.observaciones}</p>
                  </div>
                )}
              </div>
            )}

            {/* Selector de etiqueta */}
            {ETIQUETAS_POR_ESTADO[selectedLead.status] && (
              <div className="border-t border-gray-100 pt-4">
                <h3 className="font-semibold text-primary text-sm mb-3">🏷️ Etiqueta</h3>
                <div className="flex flex-wrap gap-2">
                  {ETIQUETAS_POR_ESTADO[selectedLead.status].map(tag => (
                    <button
                      key={tag}
                      onClick={async () => {
                        try {
                          const isCrediExpress = selectedLead.id.startsWith('crediexpress_');
                          if (isCrediExpress) {
                            const realId = selectedLead.id.replace('crediexpress_', '');
                            await applicationsService.updateFields(realId, { etiqueta: tag });
                          } else {
                            await leadsService.update(selectedLead.id, { etiqueta: tag });
                          }
                          setSelectedLead(prev => prev ? { ...prev, etiqueta: tag } : null);
                        } catch (error) {
                          console.error('Error actualizando etiqueta:', error);
                          alert('Error al guardar la etiqueta');
                        }
                      }}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                        selectedLead.etiqueta === tag
                          ? 'bg-amber-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-amber-100 hover:text-amber-800'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                  {selectedLead.etiqueta && (
                    <button
                      onClick={async () => {
                        try {
                          const isCrediExpress = selectedLead.id.startsWith('crediexpress_');
                          if (isCrediExpress) {
                            const realId = selectedLead.id.replace('crediexpress_', '');
                            await applicationsService.updateFields(realId, { etiqueta: '' });
                          } else {
                            await leadsService.update(selectedLead.id, { etiqueta: '' });
                          }
                          setSelectedLead(prev => prev ? { ...prev, etiqueta: undefined } : null);
                        } catch (error) {
                          console.error('Error quitando etiqueta:', error);
                          alert('Error al quitar la etiqueta');
                        }
                      }}
                      className="px-3 py-1.5 rounded-full text-sm font-medium bg-red-50 text-red-600 hover:bg-red-100"
                    >
                      ✕ Quitar
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Agregar nota rápida */}
            <div className="border-t border-gray-100 pt-4">
              <h3 className="font-semibold text-primary text-sm mb-3">📝 Agregar Nota Rápida</h3>
              <div className="space-y-3">
                <div>
                  <textarea
                    value={noteDescription}
                    onChange={(e) => setNoteDescription(e.target.value)}
                    placeholder="Escribe una nota sobre este lead..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-secondary/30 focus:border-secondary text-sm"
                  />
                </div>
                <Button onClick={handleAddNote} variant="primary">
                  Agregar Nota
                </Button>
              </div>
            </div>

            {/* Timeline de actividades */}
            <div className="border-t pt-4">
              <h3 className="font-semibold text-gray-900 mb-4">📋 Historial de Actividades</h3>
              <div className="max-h-96 overflow-y-auto">
                <ActivityTimeline
                  activities={leadActivities}
                  loading={loadingActivities}
                />
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal de Crear Nuevo Lead */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Crear Nuevo Lead"
        footer={
          <>
            <Button onClick={handleCreateLead} variant="primary">
              Crear Lead
            </Button>
            <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
              Cancelar
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Nombre Completo *"
            value={createForm.fullName}
            onChange={(val) => setCreateForm({...createForm, fullName: val})}
            placeholder="Ej: Juan Pérez García"
          />
          
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Teléfono *"
              value={createForm.phone}
              onChange={(val) => setCreateForm({...createForm, phone: val})}
              placeholder="Ej: 0991234567"
            />
            <Input
              label="Email"
              value={createForm.email}
              onChange={(val) => setCreateForm({...createForm, email: val})}
              placeholder="correo@ejemplo.com"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Cédula / ID"
              value={createForm.idNumber}
              onChange={(val) => setCreateForm({...createForm, idNumber: val})}
              placeholder="0912345678"
            />
            <Input
              label="Monto Vehículo ($)"
              value={createForm.vehicleAmount}
              onChange={(val) => setCreateForm({...createForm, vehicleAmount: val})}
              placeholder="25000"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                value={createForm.status}
                onChange={(e) => setCreateForm({...createForm, status: e.target.value as LeadStatus, etiqueta: ''})}
              >
                <option value="Por Facturar">Por Facturar</option>
                <option value="Seguimiento">Seguimiento</option>
                <option value="Cita Agendada">Cita Agendada</option>
                <option value="Facturado">Facturado</option>
                <option value="Caido">Caído</option>
                <option value="No Contactado">No Contactado</option>
              </select>
            </div>

            {ETIQUETAS_POR_ESTADO[createForm.status] && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Etiqueta</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  value={createForm.etiqueta}
                  onChange={(e) => setCreateForm({...createForm, etiqueta: e.target.value})}
                >
                  <option value="">Sin etiqueta</option>
                  {ETIQUETAS_POR_ESTADO[createForm.status].map(tag => (
                    <option key={tag} value={tag}>{tag}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Origen"
              value={createForm.origen}
              onChange={(val) => setCreateForm({...createForm, origen: val})}
              placeholder="Ej: Facebook Ads, Google, n8n"
            />
            <Input
              label="Asesor a Cargo"
              value={createForm.asesor}
              onChange={(val) => setCreateForm({...createForm, asesor: val})}
              placeholder="Nombre del asesor"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
            <textarea
              value={createForm.observaciones}
              onChange={(e) => setCreateForm({...createForm, observaciones: e.target.value})}
              placeholder="Notas adicionales..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent text-sm"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};
