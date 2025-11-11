import React, { useState, useEffect } from 'react';
import { Lead, LeadStatus, Actividad } from '../utils/types';
import { KanbanBoard } from '../components/KanbanBoard';
import { LeadsTableView } from '../components/LeadsTableView';
import { ActivityTimeline } from '../components/ActivityTimeline';
import { Modal } from '../components/Modal';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Header } from '../components/HeaderNew';
import { unifiedLeadsService } from '../services/unifiedLeads';
import { leadsService } from '../services/firestore/leads';
import { getActivitiesByLead, createNoteActivity } from '../services/firestore/activities';
import { LayoutGrid, List } from 'lucide-react';

export const LeadsPageKanban: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [leadActivities, setLeadActivities] = useState<Actividad[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(false);
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  
  // Estado para agregar nota rápida
  const [noteTitle, setNoteTitle] = useState('');
  const [noteDescription, setNoteDescription] = useState('');

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
  };

  // Cerrar modal
  const handleCloseModal = () => {
    setSelectedLead(null);
    setNoteTitle('');
    setNoteDescription('');
  };

  // Agregar nota rápida
  const handleAddNote = async () => {
    if (!selectedLead || !noteTitle.trim()) {
      alert('Por favor ingresa un título para la nota');
      return;
    }

    try {
      await createNoteActivity(
        selectedLead.id,
        noteTitle,
        noteDescription,
        'Usuario Actual'
      );

      // Recargar actividades
      loadActivities(selectedLead.id);
      
      // Limpiar form
      setNoteTitle('');
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando leads...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header Estilo Bitrix24 */}
      <Header 
        title="Leads"
        onCreateNew={() => alert('Crear nuevo lead')}
        createButtonText="Crear"
      />

      {/* Tabs y Filtros - Estilo Bitrix24 */}
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Tabs */}
          <div className="flex gap-6">
            <button className="pb-3 border-b-2 border-blue-600 text-blue-600 font-medium text-sm">
              General
            </button>
            <button className="pb-3 border-b-2 border-transparent text-gray-600 hover:text-gray-900 font-medium text-sm">
              En progreso
            </button>
            <button className="pb-3 border-b-2 border-transparent text-gray-600 hover:text-gray-900 font-medium text-sm">
              Ganados
            </button>
            <button className="pb-3 border-b-2 border-transparent text-gray-600 hover:text-gray-900 font-medium text-sm">
              Perdidos
            </button>
          </div>

          {/* Botones de vista */}
          <div className="flex gap-2 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors ${
                viewMode === 'kanban'
                  ? 'bg-white shadow-sm text-gray-900'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              Kanban
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors ${
                viewMode === 'list'
                  ? 'bg-white shadow-sm text-gray-900'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <List className="w-4 h-4" />
              Lista
            </button>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="flex-1 overflow-auto bg-gray-50 p-6">
        {/* Vista Kanban */}
        {viewMode === 'kanban' && (
          <KanbanBoard
            leads={leads}
            onLeadClick={handleLeadClick}
            onStatusChange={handleStatusChange}
          />
        )}

        {/* Vista Lista */}
        {viewMode === 'list' && (
          <LeadsTableView
            leads={leads}
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
            {/* Información del lead */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Nombre Completo</label>
                <p className="text-gray-900">{selectedLead.fullName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Estado</label>
                <p className="text-gray-900">
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    {selectedLead.status}
                  </span>
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Teléfono</label>
                <p className="text-gray-900">{selectedLead.phone}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Email</label>
                <p className="text-gray-900">{selectedLead.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Monto Vehículo</label>
                <p className="text-green-600 font-bold">
                  {formatCurrency(selectedLead.vehicleAmount || 0)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Fuente</label>
                <p className="text-gray-900">🔥 {selectedLead.fuente}</p>
              </div>
              {selectedLead.asignadoA && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Asignado a</label>
                  <p className="text-gray-900">👤 {selectedLead.asignadoA}</p>
                </div>
              )}
              {selectedLead.vehiculoInteres && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Vehículo de Interés</label>
                  <p className="text-gray-900">🚗 {selectedLead.vehiculoInteres}</p>
                </div>
              )}
            </div>

            {/* Agregar nota rápida */}
            <div className="border-t pt-4">
              <h3 className="font-semibold text-gray-900 mb-3">📝 Agregar Nota Rápida</h3>
              <div className="space-y-3">
                <Input
                  label="Título"
                  value={noteTitle}
                  onChange={setNoteTitle}
                  placeholder="Ej: Llamada de seguimiento"
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción
                  </label>
                  <textarea
                    value={noteDescription}
                    onChange={(e) => setNoteDescription(e.target.value)}
                    placeholder="Detalles de la interacción..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
    </div>
  );
};
