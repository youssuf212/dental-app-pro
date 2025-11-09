import React, { useState, useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useData } from '../../hooks/useData';
import { Case, CaseStatus, CaseFile } from '../../types';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

const TechAllCases: React.FC = () => {
  const { user } = useAuth();
  const { cases, updateCase, technicians } = useData();

  const [filter, setFilter] = useState<CaseStatus | 'All'>('All');
  const [sortConfig, setSortConfig] = useState<{ key: keyof Case, direction: 'ascending' | 'descending' } | null>({ key: 'dueDate', direction: 'ascending' });
  
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [currentCase, setCurrentCase] = useState<Case | null>(null);
  const [filesToUpload, setFilesToUpload] = useState<File[]>([]);
  
  const techProfile = useMemo(() => {
    if (!user) return null;
    return technicians.find(t => t.userId === user.id);
  }, [technicians, user]);

  const myCases = useMemo(() => {
    if (!techProfile) return [];
    
    let filteredCases = cases.filter(c => c.technicianId === techProfile.id);
    
    if (filter !== 'All') {
        filteredCases = filteredCases.filter(c => c.status === filter);
    }

    if (sortConfig !== null) {
        filteredCases.sort((a, b) => {
            if (a[sortConfig.key] < b[sortConfig.key]) {
                return sortConfig.direction === 'ascending' ? -1 : 1;
            }
            if (a[sortConfig.key] > b[sortConfig.key]) {
                return sortConfig.direction === 'ascending' ? 1 : -1;
            }
            return 0;
        });
    }

    return filteredCases;
  }, [cases, techProfile, filter, sortConfig]);

  const requestSort = (key: keyof Case) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
        direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const handleAccept = (caseToUpdate: Case) => {
    if (user) {
        updateCase({ ...caseToUpdate, status: CaseStatus.IN_PROGRESS }, user.name);
    }
  };

  const openUploadModal = (caseItem: Case) => {
    setCurrentCase(caseItem);
    setIsUploadModalOpen(true);
  };
  
  const closeUploadModal = () => {
    setCurrentCase(null);
    setFilesToUpload([]);
    setIsUploadModalOpen(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFilesToUpload(Array.from(e.target.files));
    }
  };

  const handleSubmitForReview = () => {
    if (!currentCase || filesToUpload.length === 0 || !user) {
        alert("You must upload at least one file to submit for review.");
        return;
    }
    
    const newFiles: CaseFile[] = filesToUpload.map(f => ({
        id: `file-${Date.now()}-${f.name}`,
        name: f.name,
        url: '#',
        uploadedById: user.id,
        uploadedByName: user.name,
    }));
    
    const updatedCase: Case = {
        ...currentCase,
        status: CaseStatus.READY_FOR_REVIEW,
        files: [...currentCase.files, ...newFiles],
    };

    updateCase(updatedCase, user.name);
    closeUploadModal();
  };


  const renderActions = (caseItem: Case) => {
    switch (caseItem.status) {
        case CaseStatus.NEW:
            return <Button onClick={() => handleAccept(caseItem)} className="py-1 px-3 text-xs">Accept</Button>;
        case CaseStatus.IN_PROGRESS:
        case CaseStatus.NEEDS_EDIT:
            return <Button onClick={() => openUploadModal(caseItem)} className="py-1 px-3 text-xs">Submit for Review</Button>;
        default:
            return <Link to={`/technician/cases/${caseItem.id}`} className="text-primary hover:underline text-xs">View Details</Link>;
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-text-primary mb-6">All My Cases</h1>
      <Card>
        <div className="mb-4">
            <label htmlFor="status-filter" className="sr-only">Filter by status</label>
            <select
                id="status-filter"
                value={filter}
                onChange={(e) => setFilter(e.target.value as CaseStatus | 'All')}
                className="w-full md:w-1/3 px-3 py-2 border border-border-color rounded-xl bg-surface-elevated"
            >
                <option value="All">All Statuses</option>
                {Object.values(CaseStatus).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-transparent">
              <tr>
                <th onClick={() => requestSort('caseName')} className="cursor-pointer px-6 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">Case Name</th>
                <th onClick={() => requestSort('dueDate')} className="cursor-pointer px-6 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">Due Date</th>
                <th onClick={() => requestSort('status')} className="cursor-pointer px-6 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-color">
              {myCases.map(c => (
                <tr key={c.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-primary">
                     <Link to={`/technician/cases/${c.id}`} className="hover:text-primary hover:underline">
                        {c.caseName}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">{format(new Date(c.dueDate), 'MMM dd, yyyy')}</td>
                  <td className="px-6 py-4 whitespace-nowrap"><Badge status={c.status} /></td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{renderActions(c)}</td>
                </tr>
              ))}
              {myCases.length === 0 && (
                <tr>
                    <td colSpan={4} className="text-center py-10 text-text-tertiary">No cases found with the selected filter.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
      
      <Modal isOpen={isUploadModalOpen} onClose={closeUploadModal} title={`Submit: ${currentCase?.caseName}`}>
        <div className="space-y-4">
            <p>Please upload the final design file(s) before submitting. This action will change the status to "Ready for Review".</p>
            <Input type="file" onChange={handleFileChange} multiple required />
             <div className="text-sm">
                {filesToUpload.map(f => <p key={f.name}>{f.name}</p>)}
            </div>
            <div className="flex justify-end space-x-2">
                <Button variant="secondary" onClick={closeUploadModal}>Cancel</Button>
                <Button onClick={handleSubmitForReview} disabled={filesToUpload.length === 0}>Submit</Button>
            </div>
        </div>
      </Modal>
    </div>
  );
};

export default TechAllCases;
