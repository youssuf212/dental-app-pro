import React, { useState } from 'react';
import { Case, CaseStatus } from '../../types';
import { useData } from '../../hooks/useData';
import { format } from 'date-fns';
import { AlertTriangleIcon } from '../icons/IconComponents';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

interface KanbanCardProps {
  caseItem: Case;
}

const KanbanCard: React.FC<KanbanCardProps> = ({ caseItem }) => {
  const { getTechnicianById } = useData();
  const technician = getTechnicianById(caseItem.technicianId);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData('caseId', caseItem.id);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      draggable
      onDragStart={handleDragStart}
      className="bg-surface-elevated p-4 rounded-xl shadow-sm border border-border-color cursor-grab active:cursor-grabbing mb-4 hover:border-primary-glow hover:shadow-glow-primary transition-all duration-300"
    >
      <Link to={`/admin/cases/${caseItem.id}`}>
        <h4 className="font-semibold text-sm text-text-primary mb-2 flex items-center">
            {caseItem.priority === 'Urgent' && <span title="Urgent"><AlertTriangleIcon className="w-4 h-4 text-danger inline-block mr-2 flex-shrink-0"/></span>}
            {caseItem.caseName}
        </h4>
        <p className="text-xs text-text-tertiary mb-1">Due: {format(new Date(caseItem.dueDate), 'MMM dd, yyyy')}</p>
        <p className="text-xs text-text-tertiary">Tech: {technician?.name || 'N/A'}</p>
      </Link>
    </motion.div>
  );
};

interface KanbanColumnProps {
  status: CaseStatus;
  cases: Case[];
  onDrop: (caseId: string, status: CaseStatus) => void;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({ status, cases, onDrop }) => {
    const [isOver, setIsOver] = useState(false);

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsOver(true);
    };

    const handleDragLeave = () => {
        setIsOver(false);
    }

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const caseId = e.dataTransfer.getData('caseId');
        onDrop(caseId, status);
        setIsOver(false);
    };
  
    const statusColorMap: Record<CaseStatus, string> = {
      [CaseStatus.NEW]: 'border-status-new',
      [CaseStatus.IN_PROGRESS]: 'border-status-progress',
      [CaseStatus.READY_FOR_REVIEW]: 'border-status-review',
      [CaseStatus.FINISHED]: 'border-status-finished',
      [CaseStatus.NEEDS_EDIT]: 'border-status-edit',
      [CaseStatus.MILLED]: 'border-status-milled',
      [CaseStatus.DELIVERED]: 'border-status-delivered',
    };
    
    const statusGlowMap: Record<CaseStatus, string> = {
      [CaseStatus.NEW]: 'shadow-[0_-5px_15px_rgba(0,217,255,0.3)]',
      [CaseStatus.IN_PROGRESS]: 'shadow-[0_-5px_15px_rgba(255,184,0,0.3)]',
      [CaseStatus.READY_FOR_REVIEW]: 'shadow-[0_-5px_15px_rgba(183,148,255,0.3)]',
      [CaseStatus.FINISHED]: 'shadow-[0_-5px_15px_rgba(0,255,148,0.3)]',
      [CaseStatus.NEEDS_EDIT]: 'shadow-[0_-5px_15px_rgba(255,0,144,0.3)]',
      [CaseStatus.MILLED]: 'shadow-[0_-5px_15px_rgba(240,117,255,0.3)]',
      [CaseStatus.DELIVERED]: 'shadow-[0_-5px_15px_rgba(139,146,160,0.3)]',
    };


  return (
    <div className="w-[320px] flex-shrink-0">
        <div className="flex flex-col h-full bg-surface-base/50 backdrop-blur-sm rounded-2xl">
            <h3 className={`font-semibold text-md p-4 border-t-4 ${statusColorMap[status]} ${statusGlowMap[status]} rounded-t-2xl text-text-primary`}>
                {status} <span className="text-sm text-text-tertiary">({cases.length})</span>
            </h3>
            <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`flex-grow p-2 min-h-[200px] transition-colors rounded-b-2xl ${isOver ? 'bg-primary/10' : ''}`}
            >
                {cases.map(caseItem => (
                <KanbanCard key={caseItem.id} caseItem={caseItem} />
                ))}
            </div>
        </div>
    </div>
  );
};

interface KanbanBoardProps {
  cases: Case[];
  onStatusUpdate: (caseId: string, newStatus: CaseStatus) => void;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({ cases, onStatusUpdate }) => {
  const columns: CaseStatus[] = Object.values(CaseStatus);

  const casesByStatus = (status: CaseStatus) => {
    return cases.filter(c => c.status === status);
  };

  return (
    <div className="flex space-x-6 overflow-x-auto p-2 scrollbar-thin scrollbar-thumb-primary-medium/50 scrollbar-track-transparent">
      {columns.map(status => (
        <KanbanColumn
          key={status}
          status={status}
          cases={casesByStatus(status)}
          onDrop={onStatusUpdate}
        />
      ))}
    </div>
  );
};

export default KanbanBoard;
