import React from 'react';
import { TransactionStatus } from '../types';

interface StatusBadgeProps {
  status: TransactionStatus;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  let badgeStyle = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';

  if (status === 'BLOCKED') {
    badgeStyle = 'bg-red-500/15 text-red-400 border-red-500/30';
  } else if (status === 'FLAGGED') {
    badgeStyle = 'bg-amber-500/15 text-amber-400 border-amber-500/30';
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold uppercase tracking-wider border ${badgeStyle}`}>
      {status}
    </span>
  );
};
