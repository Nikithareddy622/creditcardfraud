import React from 'react';
import { LucideIcon } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: string | number;
  change?: string;
  isNegative?: boolean;
  icon: LucideIcon;
  color: 'blue' | 'red' | 'emerald' | 'amber' | 'purple';
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  change,
  isNegative,
  icon: Icon,
  color
}) => {
  const colorMap = {
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    red: 'bg-red-500/10 text-red-400 border-red-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20'
  };

  return (
    <div className="glass-panel p-5 rounded-2xl relative overflow-hidden transition-all duration-300 hover:border-gray-700 hover:shadow-lg hover:shadow-blue-500/5 group">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">{title}</p>
          <p className="text-2xl font-bold text-white mt-1 tracking-tight">{value}</p>
        </div>
        <div className={`p-3 rounded-xl border ${colorMap[color]} transition-transform duration-300 group-hover:scale-110`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      {change && (
        <div className="mt-3 flex items-center gap-1.5 text-xs font-medium">
          <span className={isNegative ? 'text-red-400' : 'text-emerald-400'}>
            {change}
          </span>
          <span className="text-gray-500">vs last period</span>
        </div>
      )}
    </div>
  );
};
