import { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './pages/Dashboard';
import { LeadsPage } from './pages/LeadsPage';
import { ClientesPage } from './pages/ClientesPage';
import { Button } from './components/Button';
import { Lead, Cliente, Actividad } from './utils/types';
import { leadsService } from './services/firestore/leads';
import { clientesService } from './services/firestore/clientes';

// Datos de ejemplo para actividades (temporal)
const actividadesDemoData: Actividad[] = [
  {
    id: 1,
    tipo: 'Llamada',
    titulo: 'Seguimiento a cliente',
    descripcion: 'Llamar para agendar test drive',
    fecha: '2025-11-07T14:00:00',
    completada: false,
  },
  {
    id: 2,
    tipo: 'Reunión',
    titulo: 'Presentación de modelos',
    descripcion: 'Mostrar opciones disponibles',
    fecha: '2025-11-07T16:00:00',
    completada: false,
  },
];

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [actividades] = useState<Actividad[]>(actividadesDemoData);
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar leads desde Firebase al iniciar
  useEffect(() => {
    loadLeads();
  }, []);

  // Cargar clientes desde Firebase al iniciar
  useEffect(() => {
    loadClientes();
  }, []);

  const loadLeads = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await leadsService.getAll();
      setLeads(data);
    } catch (err) {
      console.error("Error cargando leads:", err);
      setError("Error al cargar los leads. Verifica tu conexión a Firebase.");
    } finally {
      setLoading(false);
    }
  };

  const loadClientes = async () => {
    try {
      const data = await clientesService.getAll();
      setClientes(data);
    } catch (err) {
      console.error("Error cargando clientes:", err);
    }
  };

  // CRUD para leads con Firebase
  const handleAddLead = async (newLead: Omit<Lead, 'id'>) => {
    try {
      await leadsService.create(newLead);
      await loadLeads(); // Recargar lista
      setShowLeadModal(false);
    } catch (err) {
      console.error("Error agregando lead:", err);
      alert("Error al agregar el lead. Por favor, intenta de nuevo.");
    }
  };

  const handleUpdateLead = async (id: string, updatedData: Partial<Lead>) => {
    try {
      await leadsService.update(id, updatedData);
      await loadLeads(); // Recargar lista
    } catch (err) {
      console.error("Error actualizando lead:", err);
      alert("Error al actualizar el lead. Por favor, intenta de nuevo.");
    }
  };

  const handleDeleteLead = async (id: string) => {
    if (!window.confirm("¿Estás seguro de que quieres eliminar este lead?")) {
      return;
    }
    try {
      await leadsService.delete(id);
      await loadLeads(); // Recargar lista
    } catch (err) {
      console.error("Error eliminando lead:", err);
      alert("Error al eliminar el lead. Por favor, intenta de nuevo.");
    }
  };

  // Renderizar contenido según la pestaña activa
  const renderContent = () => {
    // Mostrar loading solo en dashboard y leads
    if (loading && (activeTab === 'dashboard' || activeTab === 'leads')) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando datos desde Firebase...</p>
          </div>
        </div>
      );
    }

    // Mostrar error si existe
    if (error && (activeTab === 'dashboard' || activeTab === 'leads')) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto mt-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="text-2xl">⚠️</div>
            <h3 className="text-lg font-semibold text-red-900">Error de Conexión</h3>
          </div>
          <p className="text-red-700 mb-4">{error}</p>
          <Button onClick={loadLeads} variant="secondary">
            🔄 Reintentar
          </Button>
        </div>
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return <Dashboard leads={leads} actividades={actividades} />;
      case 'leads':
        return (
          <LeadsPage
            leads={leads}
            onAddLead={handleAddLead}
            onUpdateLead={handleUpdateLead}
            onDeleteLead={handleDeleteLead}
            showModal={showLeadModal}
            setShowModal={setShowLeadModal}
          />
        );
      case 'clientes':
        return <ClientesPage clientes={clientes} />;
      case 'vehiculos':
        return (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🚗</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Vehículos</h2>
            <p className="text-gray-600">Módulo en desarrollo</p>
          </div>
        );
      case 'actividades':
        return (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📅</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Actividades</h2>
            <p className="text-gray-600">Módulo en desarrollo</p>
          </div>
        );
      case 'reportes':
        return (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📈</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Reportes</h2>
            <p className="text-gray-600">Módulo en desarrollo</p>
          </div>
        );
      default:
        return <Dashboard leads={leads} actividades={actividades} />;
    }
  };

  // Título del header según la pestaña
  const getHeaderTitle = () => {
    const titles: Record<string, { title: string; subtitle: string }> = {
      dashboard: { title: 'Dashboard', subtitle: 'Resumen general de tu CRM' },
      leads: { title: 'Gestión de Leads', subtitle: 'Administra tus prospectos de venta' },
      clientes: { title: 'Clientes', subtitle: 'Base de datos de clientes' },
      vehiculos: { title: 'Vehículos', subtitle: 'Inventario y catálogo' },
      actividades: { title: 'Actividades', subtitle: 'Tareas y seguimientos' },
      reportes: { title: 'Reportes', subtitle: 'Análisis y estadísticas' },
    };
    return titles[activeTab] || titles.dashboard;
  };

  const headerInfo = getHeaderTitle();

  return (
    <Layout
      sidebar={<Sidebar activeTab={activeTab} onTabChange={setActiveTab} />}
      header={
        <Header
          title={headerInfo.title}
          subtitle={headerInfo.subtitle}
          actions={
            activeTab === 'leads' ? (
              <Button onClick={() => setShowLeadModal(true)}>+ Nuevo Lead</Button>
            ) : null
          }
        />
      }
    >
      {renderContent()}
    </Layout>
  );
}

export default App;
