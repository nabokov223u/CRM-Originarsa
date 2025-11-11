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
  ChevronRight
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  const [isCollapsed, setIsCollapsed] = useState(true); // Colapsado por defecto

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'leads', label: 'Leads', icon: Target, badge: 'Nuevo' },
    { id: 'clientes', label: 'Clientes', icon: Users },
    { id: 'reportes', label: 'Analítica', icon: TrendingUp },
    { id: 'actividades', label: 'Calendario', icon: Calendar },
  ];

  return (
    <div className={`fixed left-0 top-0 z-50 bg-slate-800/80 backdrop-blur-lg border-r border-slate-700/50 h-screen transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'} flex flex-col shadow-2xl`}>
      {/* Overlay de gradiente sutil para profundidad */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-700/10 via-transparent to-slate-900/10 pointer-events-none"></div>
      
      {/* Contenido con z-index superior */}
      <div className="relative z-10 flex flex-col h-full">
        {/* Header */}
        <div className="h-16 px-4 border-b border-slate-700 flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/50">
                <Target className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-base font-bold text-white">CRM</h1>
                <p className="text-xs text-slate-400">Originarsa</p>
              </div>
            </div>
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
          </div>
        )}

        {/* User Profile */}
        <div className="p-3 border-t border-slate-700">
          <div className={`flex items-center gap-3 p-2 rounded-lg hover:bg-slate-700 transition-colors ${isCollapsed ? 'justify-center' : ''}`}>
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-semibold shadow-lg">
              A
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-white truncate">Admin</p>
                <p className="text-xs text-slate-400 truncate">admin@originarsa.com</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
