import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Target, 
  ChevronLeft,
  ChevronRight,
  LogOut,
  UserCog,
  FileBarChart
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
    { id: 'leads', label: 'Leads', icon: Target },
    { id: 'clientes', label: 'Clientes', icon: Users },
  ];

  // Agregar opciones solo para admins
  if (isAdmin) {
    menuItems.push({ id: 'informes', label: 'Informes', icon: FileBarChart } as any);
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
    <div className={`fixed left-0 top-0 z-50 bg-white border-r border-gray-200 h-screen transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-60'} flex flex-col`}>
      {/* Contenido */}
      <div className="flex flex-col h-full">
        {/* Header con Logo */}
        <div className="h-16 px-3 border-b border-gray-100 flex items-center justify-between">
          {!isCollapsed ? (
            <div className="flex items-center gap-2">
              <img 
                src="/Logos/Logo 2.png" 
                alt="Originarsa" 
                className="h-8 object-contain"
              />
            </div>
          ) : (
            <img 
              src="/Logos/Icono.png" 
              alt="Originarsa" 
              className="w-8 h-8 object-contain mx-auto"
            />
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 hover:bg-gray-100 rounded-md transition-colors text-gray-400 hover:text-primary"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 px-2 py-4">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <li key={item.id}>
                  <button
                    onClick={() => onTabChange(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium ${
                      isActive
                        ? 'bg-secondary/10 text-secondary'
                        : 'text-gray-500 hover:bg-gray-50 hover:text-primary'
                    }`}
                    title={isCollapsed ? item.label : ''}
                  >
                    <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-secondary' : ''}`} />
                    {!isCollapsed && (
                      <span className="flex-1 text-left">{item.label}</span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Bottom Section */}
        {!isCollapsed && (
          <div className="px-3 pb-2 border-t border-gray-100 pt-2">
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all duration-200 text-sm"
            >
              <LogOut className="w-5 h-5" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        )}

        {/* User Profile */}
        <div className="p-3 border-t border-gray-100">
          <div className={`flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer ${isCollapsed ? 'justify-center' : ''}`}>
            <div className="w-8 h-8 bg-secondary/15 rounded-full flex items-center justify-center text-secondary text-xs font-semibold">
              {getUserInitials()}
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-primary truncate">
                  {user?.displayName || 'Usuario'}
                </p>
                <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                {isAdmin && (
                  <span className="inline-block mt-1 px-2 py-0.5 bg-secondary/10 text-secondary text-xs rounded font-medium">
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
