import React from 'react';

interface LayoutProps {
  sidebar: React.ReactNode;
  header: React.ReactNode;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ sidebar, header, children }) => {
  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      {sidebar}
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden ml-16">
        {/* Header */}
        {header}
        
        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
          {children}
        </main>
      </div>
    </div>
  );
};
