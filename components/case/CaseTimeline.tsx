import React from 'react';
import { AuditLog, AuditLogType } from '../../types';
import { format } from 'date-fns';
import { ClockIcon, MessageSquareIcon, FileIcon, CheckCircleIcon, PlusIcon } from '../icons/IconComponents';

interface CaseTimelineProps {
  logs: AuditLog[];
}

const getIconForType = (type: AuditLogType) => {
    const props = { className: "w-5 h-5 text-black" };
    switch (type) {
        case 'creation':
            return { icon: <PlusIcon {...props} />, color: 'bg-status-new' };
        case 'status_change':
            return { icon: <CheckCircleIcon {...props} />, color: 'bg-status-finished' };
        case 'note':
            return { icon: <MessageSquareIcon {...props} />, color: 'bg-status-progress' };
        case 'file_change':
            return { icon: <FileIcon {...props} />, color: 'bg-status-review' };
        default:
            return { icon: <ClockIcon {...props} />, color: 'bg-status-delivered' };
    }
};

const CaseTimeline: React.FC<CaseTimelineProps> = ({ logs }) => {
  const sortedLogs = [...(logs || [])]
    .filter(log => log && log.timestamp && !isNaN(new Date(log.timestamp).getTime()))
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <div>
      <h3 className="text-lg font-semibold text-text-primary mb-4">Case History</h3>
      <div className="flow-root">
        <ul className="-mb-8">
          {sortedLogs.map((log, logIdx) => (
            <li key={log.id}>
              <div className="relative pb-8">
                {logIdx !== sortedLogs.length - 1 ? (
                  <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-border-color" aria-hidden="true" />
                ) : null}
                <div className="relative flex space-x-3">
                  <div>
                    <span className={`h-8 w-8 rounded-full flex items-center justify-center ${getIconForType(log.type).color}`}>
                      {getIconForType(log.type).icon}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1 pt-1.5">
                    <p className="text-sm text-text-secondary">
                      {log.activity}
                    </p>
                    <p className="text-xs text-text-tertiary mt-1">
                      <span className="font-medium">{log.authorName}</span> &middot; {format(new Date(log.timestamp), 'MMM d, h:mm a')}
                    </p>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default CaseTimeline;
