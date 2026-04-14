import React from 'react';
import { Bell, Search } from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle, actions }) => {
  return (
    <div className="bg-white border-b border-gray-100 px-8 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-primary">{title}</h1>
          {subtitle && <p className="text-sm text-gray-400 mt-0.5">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-3">
          {actions && <div className="flex gap-2">{actions}</div>}
          <button className="p-2 rounded-lg hover:bg-gray-50 text-gray-400 transition-colors">
            <Search className="w-4 h-4" />
          </button>
          <button className="p-2 rounded-lg hover:bg-gray-50 text-gray-400 transition-colors relative">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-secondary rounded-full"></span>
          </button>
        </div>
      </div>
    </div>
  );
};
