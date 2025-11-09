import React from 'react';
import { CaseStatus } from '../../types';

interface BadgeProps {
  status: CaseStatus;
}

const statusStyles: Record<CaseStatus, { base: string, shadow: string }> = {
  [CaseStatus.NEW]: { base: 'bg-status-new/20 text-status-new', shadow: 'shadow-[0_0_10px_rgba(0,217,255,0.5)]' },
  [CaseStatus.IN_PROGRESS]: { base: 'bg-status-progress/20 text-status-progress', shadow: 'shadow-[0_0_10px_rgba(255,184,0,0.5)]' },
  [CaseStatus.READY_FOR_REVIEW]: { base: 'bg-status-review/20 text-status-review', shadow: 'shadow-[0_0_10px_rgba(183,148,255,0.5)]' },
  [CaseStatus.FINISHED]: { base: 'bg-status-finished/20 text-status-finished', shadow: 'shadow-[0_0_10px_rgba(0,255,148,0.5)]' },
  [CaseStatus.NEEDS_EDIT]: { base: 'bg-status-edit/20 text-status-edit', shadow: 'shadow-[0_0_10px_rgba(255,0,144,0.5)]' },
  [CaseStatus.MILLED]: { base: 'bg-status-milled/20 text-status-milled', shadow: 'shadow-[0_0_10px_rgba(240,117,255,0.5)]' },
  [CaseStatus.DELIVERED]: { base: 'bg-status-delivered/20 text-status-delivered', shadow: 'shadow-[0_0_10px_rgba(139,146,160,0.5)]' },
};

const Badge: React.FC<BadgeProps> = ({ status }) => {
  const styles = statusStyles[status] || { base: 'bg-gray-700 text-gray-200', shadow: '' };
  return (
    <span className={`px-3 py-1 text-xs font-bold rounded-full inline-block ${styles.base} ${styles.shadow}`}>
      {status}
    </span>
  );
};

export default Badge;
