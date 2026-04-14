import React from 'react';
import { Card } from './Card';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: string;
  change?: number;
  changeLabel?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, icon, change, changeLabel }) => {
  const isPositive = change !== undefined && change >= 0;
  
  return (
    <Card className="hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">{title}</p>
          <p className="text-2xl font-bold text-primary mt-2">{value}</p>
          {change !== undefined && (
            <div className="flex items-center mt-2 gap-1">
              <span className={`text-xs font-semibold ${isPositive ? 'text-secondary' : 'text-red-500'}`}>
                {isPositive ? '↑' : '↓'} {Math.abs(change)}%
              </span>
              {changeLabel && <span className="text-xs text-gray-400">{changeLabel}</span>}
            </div>
          )}
        </div>
        <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center text-xl">{icon}</div>
      </div>
    </Card>
  );
};
