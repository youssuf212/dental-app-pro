import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useData } from '../../hooks/useData';
import { useAuth } from '../../hooks/useAuth';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import { format } from 'date-fns';
import { AlertTriangleIcon, FileIcon, XIcon } from '../../components/icons/IconComponents';
import NotesThread from '../../components/case/NotesThread';
import CaseTimeline from '../../components/case/CaseTimeline';
import { CaseStatus, CaseFile } from '../../types';
import MillingRequestModal from '../../components/case/MillingRequestModal';

const CaseDetailPage: React.FC = () => {
  const { caseId } = useParams<{ caseId: string }>();
  const { getCaseById, getTechnicianById, updateCase, addNoteToCase } = useData();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [isRevisionModalOpen, setIsRevisionModalOpen] = useState(false);
  const [revisionNotes, setRevisionNotes] = useState('');
  const [revisionFiles, setRevisionFiles] = useState<File[]>([]);
  
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [filesToUpload, setFilesToUpload] = useState<File[]>([]);
  const [isMillingModalOpen, setIsMillingModalOpen] = useState(false);
  
  const caseItem = getCaseById(caseId!);
  const technician = caseItem ? getTechnicianById(caseItem.technicianId) : null;

  const safeFormatDate = (dateString?: string): string => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
        const utcDate = new Date(`${dateString}T00:00:00Z`);
        if (!isNaN(utcDate.getTime())) {
            return format(utcDate, 'MMM dd, yyyy');
        }
        return 'Invalid Date';
    }
    return format(date, 'MMM dd, yyyy');
  };


  if (!caseItem) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-text-primary mb-6">Case Not Found</h1>
        <Card><p>The requested case could not be found. <Link to="/admin/cases" className="text-primary underline">Return to cases</Link>.</p></Card>
      </div>
    );
  }

  const isOwner = user?.role === 'admin';
  const isTechnician = user?.role === 'technician';
  const totalCost = (caseItem.orders || []).reduce((sum, order) => sum + order.price * order.quantity, 0);

  const removeFile = (fileId: string) => {
    if(!isOwner || !user) return;
    const updatedFiles = caseItem.files.filter(f => f.id !== fileId);
    updateCase({ ...caseItem, files: updatedFiles }, user.name);
  };
  
  const handleApprove = () => {
    if(isOwner && user) {
        updateCase({ ...caseItem, status: CaseStatus.FINISHED, completedAt: new Date().toISOString() }, user.name);
        setIsMillingModalOpen(true);
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      isRevisionModalOpen ? setRevisionFiles(Array.from(e.target.files)) : setFilesToUpload(Array.from(e.target.files));
    }
  };
  
  const handleAccept = () => {
      if(isTechnician && user) {
          updateCase({ ...caseItem, status: CaseStatus.IN_PROGRESS }, user.name);
      }
  };

  const handleSubmitForReview = () => {
    if (!caseItem || filesToUpload.length === 0 || !user) {
        alert("You must upload at least one file to submit for review.");
        return;
    }
    
    const newFiles: CaseFile[] = filesToUpload.map(f => ({
        id: `file-${Date.now()}-${f.name}`,
        name: f.name,
        url: '#', // In a real app, this would be an upload handler
        previewUrl: f.type.startsWith('image/') ? URL.createObjectURL(f) : undefined,
        uploadedById: user.id,
        uploadedByName: user.name,
    }));
    
    updateCase({ 
        ...caseItem, 
        status: CaseStatus.READY_FOR_REVIEW, 
        files: [...caseItem.files, ...newFiles] 
    }, user.name);
    
    setIsUploadModalOpen(false);
    setFilesToUpload([]);
  };

  const handleConfirmRevision = () => {
      if(isOwner && user && revisionNotes.trim()) {
        const newFiles: CaseFile[] = revisionFiles.map(f => ({
            id: `file-${Date.now()}-${f.name}`,
            name: f.name,
            url: '#',
            previewUrl: f.type.startsWith('image/') ? URL.createObjectURL(f) : undefined,
            uploadedById: user.id,
            uploadedByName: user.name,
        }));
        
        addNoteToCase(caseItem.id, {
            authorId: user.id,
            authorName: user.name,
            content: `Revision Request: ${revisionNotes}`
        });

        updateCase({ 
            ...caseItem, 
            status: CaseStatus.NEEDS_EDIT,
            files: [...caseItem.files, ...newFiles],
        }, user.name);

        setIsRevisionModalOpen(false);
        setRevisionNotes('');
        setRevisionFiles([]);
    } else {
        alert("Please provide notes for the revision request.");
    }
  };
  
  const renderTechnicianActions = () => {
      if (!isTechnician) return null;
      
      switch (caseItem.status) {
          case CaseStatus.NEW:
              return <Button onClick={handleAccept}>Accept Case</Button>;
          case CaseStatus.IN_PROGRESS:
          case CaseStatus.NEEDS_EDIT:
              return <Button onClick={() => setIsUploadModalOpen(true)}>Submit for Review</Button>;
          default:
              return null;
      }
  };

  return (
    <div>
      <div className="flex justify-between items-start mb-6">
        <div>
          <button onClick={() => navigate(-1)} className="text-primary hover:underline mb-2 block">&larr; Back</button>
          <h1 className="text-3xl font-bold text-text-primary flex items-center">
             {caseItem.priority === 'Urgent' && <span title="Urgent"><AlertTriangleIcon className="w-7 h-7 text-danger inline-block mr-3"/></span>}
             {caseItem.caseName}
          </h1>
        </div>
        <div className="text-right space-y-2">
            <div>
                <p className="text-sm text-text-tertiary">Status</p>
                <Badge status={caseItem.status} />
            </div>
            {renderTechnicianActions()}
        </div>
      </div>
      
       {isOwner && caseItem.status === CaseStatus.READY_FOR_REVIEW && (
        <Card className="mb-6 bg-status-review/10 border-l-4 border-status-review">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="font-semibold text-text-primary">Action Required</h3>
                    <p className="text-sm">The technician has submitted their work for review.</p>
                </div>
                <div className="flex gap-4">
                    <Button variant="secondary" onClick={() => setIsRevisionModalOpen(true)}>Request Revisions</Button>
                    <Button onClick={handleApprove}>Approve & Finish</Button>
                </div>
            </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
            <Card>
                <h3 className="text-lg font-semibold text-text-primary mb-4">Case Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <p><strong className="text-text-tertiary block">Doctor:</strong> {caseItem.doctor}</p>
                    <p><strong className="text-text-tertiary block">Branch:</strong> {caseItem.branch}</p>
                    <p><strong className="text-text-tertiary block">Due Date:</strong> {safeFormatDate(caseItem.dueDate)}</p>
                    <p><strong className="text-text-tertiary block">Technician:</strong> {technician?.name || 'Unassigned'}</p>
                    <p><strong className="text-text-tertiary block">Color:</strong> {caseItem.color || 'N/A'}</p>
                    <p><strong className="text-text-tertiary block">Priority:</strong> {caseItem.priority}</p>
                    <p><strong className="text-text-tertiary block">Created At:</strong> {safeFormatDate(caseItem.createdAt)}</p>
                    <p><strong className="text-text-tertiary block">Total Cost:</strong> ${totalCost.toFixed(2)}</p>
                </div>
                <div className="mt-4 pt-4 border-t border-border-color">
                    <strong className="text-text-tertiary block mb-2">Orders:</strong>
                    <ul className="list-disc list-inside space-y-1">
                        {caseItem.orders.map((order, index) => (
                            <li key={index} className="text-sm">
                                {order.teeth && order.teeth.length > 0
                                    ? <><span className="font-semibold">{order.serviceName}</span> on teeth: <span className="text-primary font-medium">{order.teeth.join(', ')}</span></>
                                    : <><span className="font-semibold">{order.quantity}x {order.serviceName}</span></>
                                }
                                <span className="text-text-tertiary"> @ ${order.price.toFixed(2)} each</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </Card>
            <Card>
                <NotesThread caseId={caseItem.id} notes={caseItem.notes} />
            </Card>
        </div>
        <div className="space-y-8">
            <Card>
                <h3 className="text-lg font-semibold text-text-primary mb-4">Files</h3>
                <div className="space-y-2">
                    {caseItem.files.map(file => (
                        <div key={file.id} className="flex items-center justify-between p-2 rounded-xl bg-white/5 group">
                           <div className="flex items-center truncate">
                               {file.previewUrl ? (
                                   <img src={file.previewUrl} alt="preview" className="w-8 h-8 rounded-md mr-3 object-cover"/>
                               ) : (
                                   <FileIcon className="w-6 h-6 mr-3 text-text-tertiary flex-shrink-0"/>
                               )}
                               <div>
                                  <a href={file.url} target="_blank" rel="noopener noreferrer" className="text-sm truncate hover:underline">{file.name}</a>
                                  <p className="text-xs text-text-tertiary">by {file.uploadedByName}</p>
                               </div>
                           </div>
                           {isOwner && (
                                <button onClick={() => removeFile(file.id)} className="p-1 text-text-tertiary hover:text-danger opacity-0 group-hover:opacity-100 transition-opacity">
                                    <XIcon className="w-4 h-4" />
                                </button>
                           )}
                        </div>
                    ))}
                    {caseItem.files.length === 0 && <p className="text-sm text-center text-text-tertiary py-4">No files uploaded.</p>}
                </div>
            </Card>
             <Card>
                <CaseTimeline logs={caseItem.activityLog} />
            </Card>
        </div>
      </div>
      
      {/* Admin Revision Modal */}
      <Modal isOpen={isRevisionModalOpen} onClose={() => setIsRevisionModalOpen(false)} title="Request Revisions">
        <div className="space-y-4">
            <p>Add notes and any additional files for the technician.</p>
            <div>
                <label htmlFor="revision-notes" className="block text-sm font-medium text-text-secondary mb-1">Notes</label>
                <textarea
                    id="revision-notes"
                    value={revisionNotes}
                    onChange={(e) => setRevisionNotes(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-border-color rounded-xl bg-white/5 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                    required
                />
            </div>
             <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Attach Files</label>
                <Input type="file" onChange={handleFileChange} multiple />
            </div>
            <div className="flex justify-end space-x-2 pt-4">
                <Button variant="secondary" onClick={() => setIsRevisionModalOpen(false)}>Cancel</Button>
                <Button onClick={handleConfirmRevision}>Submit Request</Button>
            </div>
        </div>
      </Modal>

       {/* Technician Upload Modal */}
       <Modal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} title={`Submit: ${caseItem?.caseName}`}>
        <div className="space-y-4">
            <p>Please upload the final design file(s) before submitting. This action will change the status to "Ready for Review".</p>
            <Input type="file" onChange={handleFileChange} multiple required />
             <div className="text-sm">
                {filesToUpload.map(f => <p key={f.name}>{f.name}</p>)}
            </div>
            <div className="flex justify-end space-x-2">
                <Button variant="secondary" onClick={() => setIsUploadModalOpen(false)}>Cancel</Button>
                <Button onClick={handleSubmitForReview} disabled={filesToUpload.length === 0}>Submit</Button>
            </div>
        </div>
      </Modal>
      
       {isOwner && caseItem && (
        <MillingRequestModal 
            isOpen={isMillingModalOpen} 
            onClose={() => setIsMillingModalOpen(false)} 
            caseItem={caseItem} 
        />
       )}
    </div>
  );
};

export default CaseDetailPage;
