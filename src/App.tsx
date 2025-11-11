import { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './pages/Dashboard';
import { LeadsPageKanban } from './pages/LeadsPageKanban';
import { ClientesPage } from './pages/ClientesPage';
import { Button } from './components/Button';
import { Lead, Cliente, Actividad } from './utils/types';
import { unifiedLeadsService } from './services/unifiedLeads';
import { clientesService } from './services/firestore/clientes';

// Datos de ejemplo para actividades (temporal)
const actividadesDemoData: Actividad[] = [
  {
    id: "1",
    leadId: "demo1",
    tipo: 'Llamada',
    titulo: 'Seguimiento a cliente',
    descripcion: 'Llamar para agendar test drive',
    fecha: '2025-11-07T14:00:00',
    completada: false,
  },
  {
    id: "2",
    leadId: "demo2", 
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar datos desde Firebase al iniciar
  useEffect(() => {
    loadLeads();
    loadClientes();
  }, []);

  const loadLeads = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Cargando leads desde Firebase...');
      const data = await unifiedLeadsService.getAllLeads();
      console.log('✅ Leads cargados:', data.length);
      setLeads(data);
    } catch (err) {
      console.error("❌ Error cargando leads:", err);
      setError("Error al cargar los leads. Verifica tu conexión a Firebase.");
      // En caso de error, usar datos vacíos para que la app no se rompa
      setLeads([]);
    } finally {
      setLoading(false);
    }
  };

  const loadClientes = async () => {
    try {
      console.log('🔄 Cargando clientes desde Firebase...');
      const data = await clientesService.getAll();
      console.log('✅ Clientes cargados:', data.length);
      setClientes(data);
    } catch (err) {
      console.error("❌ Error cargando clientes:", err);
      // En caso de error, usar datos vacíos
      setClientes([]);
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
          <div className="space-y-2">
            <Button onClick={loadLeads} variant="secondary">
              🔄 Reintentar
            </Button>
            <details className="text-xs text-red-600 mt-2">
              <summary className="cursor-pointer">Ver detalles técnicos</summary>
              <p className="mt-2">
                • Verifica que Firebase esté configurado<br/>
                • Revisa las variables de entorno (.env)<br/>
                • Comprueba la conexión a internet<br/>
                • Abre la consola del navegador (F12)
              </p>
            </details>
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return <Dashboard leads={leads} actividades={actividades} />;
      case 'leads':
        return (
          <LeadsPageKanban />
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
        />
      }
    >
      {renderContent()}
    </Layout>
  );
}

export default App;
