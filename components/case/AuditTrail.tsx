

import React from 'react';
import { AuditLog } from '../../types';
import { format } from 'date-fns';
import { ClockIcon } from '../icons/IconComponents';

interface AuditTrailProps {
  logs: AuditLog[];
}

const AuditTrail: React.FC<AuditTrailProps> = ({ logs }) => {
  const sortedLogs = [...logs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <div>
      <h3 className="text-lg font-semibold text-text-primary mb-4">Activity Log</h3>
      <ul className="space-y-4">
        {sortedLogs.map(log => (
          <li key={log.id} className="flex items-start">
            <div className="bg-white/5 p-2 rounded-full mr-4">
                <ClockIcon className="w-5 h-5 text-text-tertiary" />
            </div>
            <div>
              <p className="text-sm text-text-secondary">
                <span className="font-semibold text-text-primary">{log.authorName}</span> {log.activity.toLowerCase()}
              </p>
              <p className="text-xs text-text-tertiary">
                {format(new Date(log.timestamp), 'MMM dd, yyyy @ h:mm a')}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AuditTrail;
