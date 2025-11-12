import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Target, 
  Settings,
  TrendingUp,
  Calendar,
  Bell,
  ChevronLeft,
  ChevronRight,
  LogOut,
  UserCog
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const { user, isAdmin, logout } = useAuth();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'leads', label: 'Leads', icon: Target, badge: 'Nuevo' },
    { id: 'clientes', label: 'Clientes', icon: Users },
    { id: 'reportes', label: 'Analítica', icon: TrendingUp },
    { id: 'actividades', label: 'Calendario', icon: Calendar },
  ];

  // Agregar "Usuarios" solo si es admin
  if (isAdmin) {
    menuItems.push({ id: 'usuarios', label: 'Usuarios', icon: UserCog } as any);
  }

  const handleLogout = async () => {
    if (confirm('¿Seguro que deseas cerrar sesión?')) {
      await logout();
    }
  };

  // Obtener iniciales del usuario
  const getUserInitials = () => {
    if (user?.displayName) {
      return user.displayName
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
    }
    return user?.email?.[0].toUpperCase() || 'U';
  };

  return (
    <div className={`fixed left-0 top-0 z-50 bg-slate-800/80 backdrop-blur-lg border-r border-slate-700/50 h-screen transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'} flex flex-col shadow-2xl`}>
      {/* Overlay de gradiente sutil para profundidad */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-700/10 via-transparent to-slate-900/10 pointer-events-none"></div>
      
      {/* Contenido con z-index superior */}
      <div className="relative z-10 flex flex-col h-full">
        {/* Header */}
        <div className="h-16 px-4 border-b border-slate-700 flex items-center justify-between">
          {!isCollapsed ? (
            <div className="flex items-center gap-3">
              <img 
                src="/logo_graphic.png" 
                alt="Originarsa" 
                className="w-8 h-8 object-contain"
              />
              <div>
                <h1 className="text-base font-bold text-white">CRM</h1>
                <p className="text-xs text-slate-400">Originarsa</p>
              </div>
            </div>
          ) : (
            <img 
              src="/logo_graphic.png" 
              alt="Originarsa" 
              className="w-8 h-8 object-contain mx-auto"
            />
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 hover:bg-slate-700 rounded-md transition-colors text-slate-300 hover:text-white"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 px-3 py-4">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <li key={item.id}>
                  <button
                    onClick={() => onTabChange(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 font-medium text-sm ${
                      isActive
                        ? 'bg-slate-700 text-white'
                        : 'text-slate-300 hover:bg-slate-700/70 hover:text-white'
                    }`}
                    title={isCollapsed ? item.label : ''}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {!isCollapsed && (
                      <>
                        <span className="flex-1 text-left">{item.label}</span>
                        {item.badge && (
                          <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full shadow-lg">
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Bottom Section */}
        {!isCollapsed && (
          <div className="p-4 border-t border-slate-700 space-y-2">
            <button className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-slate-300 hover:bg-slate-700 hover:text-white transition-all duration-200 text-sm">
              <Bell className="w-5 h-5" />
              <span>Notificaciones</span>
              <span className="ml-auto bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">3</span>
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-slate-300 hover:bg-slate-700 hover:text-white transition-all duration-200 text-sm">
              <Settings className="w-5 h-5" />
              <span>Configuración</span>
            </button>
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-200 text-sm"
            >
              <LogOut className="w-5 h-5" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        )}

        {/* User Profile */}
        <div className="p-3 border-t border-slate-700">
          <div className={`flex items-center gap-3 p-2 rounded-lg hover:bg-slate-700 transition-colors cursor-pointer ${isCollapsed ? 'justify-center' : ''}`}>
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-semibold shadow-lg">
              {getUserInitials()}
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-white truncate">
                  {user?.displayName || 'Usuario'}
                </p>
                <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                {isAdmin && (
                  <span className="inline-block mt-1 px-2 py-0.5 bg-purple-500/20 text-purple-400 text-xs rounded">
                    Admin
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
