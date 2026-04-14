import React from 'react';
import { Plus } from 'lucide-react';

interface HeaderProps {
  title: string;
  onCreateNew?: () => void;
  createButtonText?: string;
}

export const Header: React.FC<HeaderProps> = ({ 
  title, 
  onCreateNew,
  createButtonText = 'Crear' 
}) => {
  return (
    <header className="bg-white border-b border-gray-100 h-14 flex items-center justify-between px-6">
      {/* Title */}
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-semibold text-primary">{title}</h1>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        {/* Create Button */}
        {onCreateNew && (
          <button
            onClick={onCreateNew}
            className="flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary-hover text-white rounded-lg text-sm font-medium transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>{createButtonText}</span>
          </button>
        )}
      </div>
    </header>
  );
};
