import React from 'react';

interface LayoutProps {
  sidebar: React.ReactNode;
  header: React.ReactNode;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ sidebar, header, children }) => {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar - Fixed overlay */}
      {sidebar}
      
      {/* Main Content - Con margen izquierdo para el sidebar colapsado */}
      <div className="flex-1 flex flex-col overflow-hidden ml-16">
        {/* Header */}
        {header}
        
        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};
