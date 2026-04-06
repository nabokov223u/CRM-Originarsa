import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { Dashboard } from './DashboardNew';
import { LeadsPageKanban } from './LeadsPageKanban';
import { ClientesPage } from './ClientesPage';
import { UserManagementPage } from './UserManagementPage';
import { Button } from '../components/Button';
import { Lead, Cliente } from '../utils/types';
import { unifiedLeadsService } from '../services/unifiedLeads';
import { clientesService } from '../services/firestore/clientes';
import { useAuth } from '../hooks/useAuth';

export function CrmMain() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  // Cargar datos desde Firebase al iniciar
  useEffect(() => {
    loadLeads();
    loadClientes();
  }, []);

  // Sincronizar activeTab con la ruta actual
  useEffect(() => {
    const path = window.location.pathname.replace('/', '') || 'dashboard';
    setActiveTab(path);
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
      setClientes([]);
    }
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    navigate(`/${tab}`);
  };

  // Renderizar contenido según la ruta
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

    return (
      <Routes>
        <Route path="/dashboard" element={<Dashboard leads={leads} />} />
        <Route path="/leads" element={<LeadsPageKanban />} />
        <Route path="/clientes" element={<ClientesPage clientes={clientes} />} />
        
        {/* Ruta solo para admins */}
        {isAdmin && (
          <Route path="/usuarios" element={<UserManagementPage />} />
        )}
        
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    );
  };

  // Título del header según la pestaña
  const getHeaderTitle = () => {
    const titles: Record<string, { title: string; subtitle: string }> = {
      dashboard: { title: 'Dashboard', subtitle: 'Resumen general de tu CRM' },
      leads: { title: 'Gestión de Leads', subtitle: 'Administra tus prospectos de venta' },
      clientes: { title: 'Clientes', subtitle: 'Base de datos de clientes' },
      usuarios: { title: 'Gestión de Usuarios', subtitle: 'Administra accesos al sistema' },
    };
    return titles[activeTab] || titles.dashboard;
  };

  const headerInfo = getHeaderTitle();

  return (
    <Layout
      sidebar={<Sidebar activeTab={activeTab} onTabChange={handleTabChange} />}
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
