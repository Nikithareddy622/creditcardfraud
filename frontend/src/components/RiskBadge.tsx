import React from 'react';
import { RiskCategory } from '../types';

interface RiskBadgeProps {
  risk: RiskCategory;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ risk }) => {
  let badgeStyle = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
  let indicator = 'bg-emerald-400';

  if (risk === 'Critical Risk') {
    badgeStyle = 'bg-purple-500/10 text-purple-400 border-purple-500/30 animate-pulse';
    indicator = 'bg-purple-400';
  } else if (risk === 'High Risk') {
    badgeStyle = 'bg-red-500/10 text-red-400 border-red-500/30';
    indicator = 'bg-red-400';
  } else if (risk === 'Medium Risk') {
    badgeStyle = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    indicator = 'bg-amber-400';
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${badgeStyle}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${indicator}`}></span>
      {risk}
    </span>
  );
};
