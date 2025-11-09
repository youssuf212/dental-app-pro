

import React, { useState, useMemo } from 'react';
import { useData } from '../../hooks/useData';
import { Case, CaseStatus, Technician, CaseFile, CasePriority, Order } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import Card from '../../components/ui/Card';
import { EditIcon, PlusIcon, FileIcon, AlertTriangleIcon, KanbanIcon, ListIcon, FilterIcon, TrashIcon } from '../../components/icons/IconComponents';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import KanbanBoard from '../../components/ui/KanbanBoard';
import Tabs from '../../components/ui/Tabs';
import PalmerNotationSelector from '../../components/ui/PalmerNotationSelector';

const isPerToothService = (serviceName: string): boolean => {
    const name = serviceName.toLowerCase();
    return name.includes('crown') || name.includes('veneer') || name.includes('implant');
};

const TeethSelectorModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (serviceName: string, teeth: string[]) => void;
    serviceName: string;
    initialTeeth: string[];
}> = ({ isOpen, onClose, onSave, serviceName, initialTeeth }) => {
    const [selected, setSelected] = useState<string[]>(initialTeeth);

    React.useEffect(() => {
        if (isOpen) {
            setSelected(initialTeeth);
        }
    }, [isOpen, initialTeeth]);

    const handleToothClick = (tooth: string) => {
        setSelected(prev =>
            prev.includes(tooth)
                ? prev.filter(t => t !== tooth)
                : [...prev, tooth]
        );
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Select Teeth for ${serviceName}`}>
            <div className="space-y-4">
                <PalmerNotationSelector selectedTeeth={selected} onToothClick={handleToothClick} />
                <div className="flex justify-end space-x-2 pt-2">
                    <Button variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button onClick={() => onSave(serviceName, selected)}>Save</Button>
                </div>
            </div>
        </Modal>
    );
};

const CaseForm: React.FC<{
  caseData: Partial<Case>;
  onCaseChange: (field: keyof Case, value: any) => void;
  technicians: Technician[];
  currentUser: any;
}> = ({ caseData, onCaseChange, technicians, currentUser }) => {

  const [teethSelection, setTeethSelection] = useState<{ isOpen: boolean; serviceName: string; currentTeeth: string[] }>({ isOpen: false, serviceName: '', currentTeeth: [] });
  const selectedTechnician = technicians.find(t => t.id === caseData.technicianId);

  const safeFormatDateForInput = (isoDate?: string): string => {
    if (!isoDate) return '';
    try {
        const date = new Date(isoDate);
        if (isNaN(date.getTime())) return '';
        
        const year = date.getUTCFullYear();
        const month = String(date.getUTCMonth() + 1).padStart(2, '0');
        const day = String(date.getUTCDate()).padStart(2, '0');
        
        return `${year}-${month}-${day}`;
    } catch (error) {
        return '';
    }
  };

  const handleDueDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateString = e.target.value;
    if (dateString) {
        const date = new Date(`${dateString}T00:00:00Z`);
        if (!isNaN(date.getTime())) {
            onCaseChange('dueDate', date.toISOString());
        }
    } else {
        onCaseChange('dueDate', '');
    }
  };


  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const caseFiles: CaseFile[] = newFiles.map((f: File) => ({
          id: `file-${Date.now()}-${f.name}`,
          name: f.name,
          url: '#', 
          previewUrl: f.type.startsWith('image/') ? URL.createObjectURL(f) : undefined,
          uploadedById: currentUser.id,
          uploadedByName: currentUser.name,
      }));
      onCaseChange('files', [...(caseData.files || []), ...caseFiles]);
    }
  };
  
  const handleOrderChange = (serviceName: string, value: number | string[]) => {
      const existingOrders = caseData.orders || [];
      const servicePrice = selectedTechnician?.pricing.find(p => p.serviceName === serviceName)?.price || 0;
      
      const existingOrderIndex = existingOrders.findIndex(o => o.serviceName === serviceName);
      let newOrders: Order[];

      if (Array.isArray(value)) {
          const teeth = value;
          if (teeth.length > 0) {
              const newOrder: Order = { serviceName, price: servicePrice, quantity: teeth.length, teeth };
              if (existingOrderIndex > -1) {
                  newOrders = existingOrders.map((o, i) => (i === existingOrderIndex ? newOrder : o));
              } else {
                  newOrders = [...existingOrders, newOrder];
              }
          } else {
              newOrders = existingOrders.filter((_, i) => i !== existingOrderIndex);
          }
      } else {
          const quantity = value;
          if (quantity > 0) {
              const newOrder: Order = { serviceName, price: servicePrice, quantity, teeth: [] };
              if (existingOrderIndex > -1) {
                  newOrders = existingOrders.map((o, i) => (i === existingOrderIndex ? newOrder : o));
              } else {
                  newOrders = [...existingOrders, newOrder];
              }
          } else {
              newOrders = existingOrders.filter((_, i) => i !== existingOrderIndex);
          }
      }
      onCaseChange('orders', newOrders);
  };
  
  const totalCost = useMemo(() => {
    return (caseData.orders || []).reduce((sum, order) => sum + (order.price * order.quantity), 0);
  }, [caseData.orders]);

  const openTeethSelector = (serviceName: string) => {
    const currentOrder = caseData.orders?.find(o => o.serviceName === serviceName);
    setTeethSelection({
        isOpen: true,
        serviceName,
        currentTeeth: currentOrder?.teeth || []
    });
  };

  const handleTeethSelectionSave = (serviceName: string, teeth: string[]) => {
      handleOrderChange(serviceName, teeth);
      setTeethSelection({ isOpen: false, serviceName: '', currentTeeth: [] });
  };


  return (
    <>
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
            label="Case Name"
            value={caseData.caseName || ''}
            onChange={(e) => onCaseChange('caseName', e.target.value)}
            required
        />
         <Input
            label="Due Date"
            type="date"
            value={safeFormatDateForInput(caseData.dueDate)}
            onChange={handleDueDateChange}
            required
        />
      </div>
       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Doctor Name"
            value={caseData.doctor || ''}
            onChange={(e) => onCaseChange('doctor', e.target.value)}
          />
           <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Branch</label>
                <select
                    value={caseData.branch || ''}
                    onChange={(e) => onCaseChange('branch', e.target.value)}
                    className="w-full px-3 py-2 border border-border-color rounded-xl bg-white/5 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                    required
                >
                    <option value="Gamal">Gamal</option>
                    <option value="Faroqia">Faroqia</option>
                    <option value="M.Nasr">M.Nasr</option>
                </select>
            </div>
       </div>
       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <Input
            label="Color"
            value={caseData.color || ''}
            onChange={(e) => onCaseChange('color', e.target.value)}
            placeholder="e.g., A2, B1"
          />
           <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Priority</label>
            <select
              value={caseData.priority || 'Normal'}
              onChange={(e) => onCaseChange('priority', e.target.value)}
              className="w-full px-3 py-2 border border-border-color rounded-xl bg-white/5 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
            >
              <option value="Normal">Normal</option>
              <option value="Urgent">Urgent</option>
            </select>
          </div>
       </div>

       <div>
        <label className="block text-sm font-medium text-text-secondary mb-1">Technician</label>
        <select
          value={caseData.technicianId || ''}
          onChange={(e) => {
              onCaseChange('technicianId', e.target.value);
              onCaseChange('orders', []); 
          }}
          className="w-full px-3 py-2 border border-border-color rounded-xl bg-white/5 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
          required
        >
          <option value="" disabled>Select a technician first</option>
          {technicians.map(tech => (
            <option key={tech.id} value={tech.id}>{tech.name}</option>
          ))}
        </select>
      </div>

      {selectedTechnician && (
        <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Services & Orders</label>
            <div className="space-y-2 p-3 bg-white/5 rounded-xl">
                {selectedTechnician.pricing.map(service => {
                    const currentOrder = caseData.orders?.find(o => o.serviceName === service.serviceName);
                    const perTooth = isPerToothService(service.serviceName);
                    return (
                        <div key={service.serviceName} className="grid grid-cols-3 gap-2 items-center">
                            <span className="text-sm col-span-1">{service.serviceName} (${service.price})</span>
                            <div className="col-span-2">
                                {perTooth ? (
                                    <div>
                                        <Button variant="secondary" onClick={() => openTeethSelector(service.serviceName)} className="w-full text-sm py-1.5">
                                            Assign Teeth ({currentOrder?.teeth?.length || 0})
                                        </Button>
                                        {currentOrder?.teeth && currentOrder.teeth.length > 0 && (
                                            <p className="text-xs text-text-tertiary mt-1 truncate" title={currentOrder.teeth.join(', ')}>{currentOrder.teeth.join(', ')}</p>
                                        )}
                                    </div>
                                ) : (
                                    <Input 
                                        type="number" 
                                        placeholder="Quantity" 
                                        min="0"
                                        value={currentOrder?.quantity || ''}
                                        onChange={(e) => handleOrderChange(service.serviceName, parseInt(e.target.value, 10) || 0)}
                                    />
                                )}
                            </div>
                        </div>
                    )
                })}
                 <div className="text-right font-bold pt-2 border-t border-border-color">
                    Total: ${totalCost.toFixed(2)}
                 </div>
            </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1">Files</label>
        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-border-color border-dashed rounded-xl">
            <div className="space-y-1 text-center">
                <FileIcon className="mx-auto h-12 w-12 text-text-tertiary" />
                <div className="flex text-sm text-text-secondary">
                    <label htmlFor="file-upload" className="relative cursor-pointer bg-transparent rounded-md font-medium text-primary hover:text-primary-glow focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary">
                        <span>Upload files</span>
                        <input id="file-upload" name="file-upload" type="file" className="sr-only" multiple onChange={handleFileChange} />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                </div>
            </div>
        </div>
        <div className="mt-2 space-y-1">
          {caseData.files?.map(file => (
              <div key={file.id} className="text-sm text-text-secondary flex items-center">
                <FileIcon className="w-4 h-4 mr-2 flex-shrink-0" />
                <span className="truncate">{file.name}</span>
              </div>
          ))}
        </div>
      </div>
    </div>
    <TeethSelectorModal
        isOpen={teethSelection.isOpen}
        onClose={() => setTeethSelection({ ...teethSelection, isOpen: false })}
        onSave={handleTeethSelectionSave}
        serviceName={teethSelection.serviceName}
        initialTeeth={teethSelection.currentTeeth}
    />
    </>
  );
};

const AdminCases: React.FC = () => {
  const { cases, technicians, addCase, updateCase, getTechnicianById } = useData();
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCase, setEditingCase] = useState<Partial<Case> | null>(null);
  const [view, setView] = useState<'list' | 'kanban'>('kanban');
  
  const [filters, setFilters] = useState({ status: '', technicianId: '', startDate: '', endDate: '' });
  const [sortConfig, setSortConfig] = useState<{ key: keyof Case | 'cost', direction: 'ascending' | 'descending' } | null>(null);

  const getCaseCost = (c: Case) => (c.orders || []).reduce((sum, order) => sum + order.price * order.quantity, 0);

  const filteredCases = useMemo(() => {
    let filtered = cases.filter(c => {
        if (filters.status && c.status !== filters.status) return false;
        if (filters.technicianId && c.technicianId !== filters.technicianId) return false;
        if (filters.startDate && new Date(c.dueDate) < new Date(filters.startDate)) return false;
        if (filters.endDate && new Date(c.dueDate) > new Date(filters.endDate)) return false;
        return true;
    });

    if (sortConfig !== null) {
        filtered.sort((a, b) => {
            const valA = sortConfig.key === 'cost' ? getCaseCost(a) : a[sortConfig.key as keyof Case];
            const valB = sortConfig.key === 'cost' ? getCaseCost(b) : b[sortConfig.key as keyof Case];

            if (valA < valB) {
                return sortConfig.direction === 'ascending' ? -1 : 1;
            }
            if (valA > valB) {
                return sortConfig.direction === 'ascending' ? 1 : -1;
            }
            return 0;
        });
    }

    return filtered;
  }, [cases, filters, sortConfig]);

  const requestSort = (key: keyof Case | 'cost') => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
        direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };


  const openNewCaseModal = () => {
    setEditingCase({ 
        status: CaseStatus.NEW, 
        files: [], 
        priority: 'Normal', 
        orders: [], 
        notes: [],
        doctor: 'Dr Moustafa',
        branch: 'Gamal'
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingCase(null);
    setIsModalOpen(false);
  };

  const handleCaseChange = (field: keyof Case, value: any) => {
    setEditingCase(prev => prev ? { ...prev, [field]: value } : null);
  };

  const handleSaveCase = () => {
    if (!editingCase || !editingCase.caseName || !editingCase.dueDate || !editingCase.technicianId || !editingCase.orders || editingCase.orders.length === 0) {
        alert('Please fill all required fields and add at least one service order.');
        return;
    }

    if (editingCase.id) {
      updateCase(editingCase as Case, user!.name);
    } else {
      addCase(editingCase as Omit<Case, 'id' | 'createdAt' | 'activityLog'>);
    }
    handleCloseModal();
  };
  
  const handleStatusUpdateFromKanban = (caseId: string, newStatus: CaseStatus) => {
    const caseToUpdate = cases.find(c => c.id === caseId);
    if (caseToUpdate) {
        updateCase({ ...caseToUpdate, status: newStatus }, user!.name);
    }
  };

  const tabs = [
    { id: 'kanban', label: 'Kanban', icon: KanbanIcon },
    { id: 'list', label: 'List', icon: ListIcon },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-text-primary">Cases Management</h1>
        <Button onClick={openNewCaseModal}>
          <PlusIcon className="w-5 h-5 mr-2"/>
          New Case
        </Button>
      </div>

      <Card>
        <div className="flex justify-between items-center mb-4">
             <Tabs tabs={tabs} activeTab={view} setActiveTab={(tabId) => setView(tabId as 'list' | 'kanban')} />
        </div>
        
        {view === 'list' && (
        <>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4 p-4 bg-white/5 rounded-xl">
            {/* Filters */}
            <select name="status" value={filters.status} onChange={handleFilterChange} className="w-full px-3 py-2 border border-border-color rounded-xl bg-surface-elevated">
                <option value="">All Statuses</option>
                {Object.values(CaseStatus).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select name="technicianId" value={filters.technicianId} onChange={handleFilterChange} className="w-full px-3 py-2 border border-border-color rounded-xl bg-surface-elevated">
                <option value="">All Technicians</option>
                {technicians.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
             <input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} className="w-full px-3 py-2 border border-border-color rounded-xl bg-surface-elevated" />
             <input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} className="w-full px-3 py-2 border border-border-color rounded-xl bg-surface-elevated" />
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-transparent">
              <tr>
                <th onClick={() => requestSort('caseName')} className="cursor-pointer px-6 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">Case Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">Technician</th>
                <th onClick={() => requestSort('dueDate')} className="cursor-pointer px-6 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">Due Date</th>
                <th onClick={() => requestSort('status')} className="cursor-pointer px-6 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">Status</th>
                <th onClick={() => requestSort('cost')} className="cursor-pointer px-6 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">Cost</th>
                <th className="relative px-6 py-3"><span className="sr-only">View</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-color">
              {filteredCases.map((c) => (
                <tr key={c.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-primary">
                    <Link to={`/admin/cases/${c.id}`} className="hover:text-primary">
                        {c.priority === 'Urgent' && <span title="Urgent"><AlertTriangleIcon className="w-4 h-4 text-danger inline-block mr-2"/></span>}
                        {c.caseName}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">{getTechnicianById(c.technicianId)?.name || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">{format(new Date(c.dueDate), 'MMM dd, yyyy')}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary"><Badge status={c.status} /></td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">${getCaseCost(c).toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link to={`/admin/cases/${c.id}`} className="text-primary hover:text-primary-glow">
                        View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </>
        )}
        {view === 'kanban' && <KanbanBoard cases={filteredCases} onStatusUpdate={handleStatusUpdateFromKanban}/>}
      </Card>
      
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingCase?.id ? 'Edit Case' : 'Create New Case'}
        size="large"
        footer={
          editingCase && (
            <div className="flex justify-end space-x-4">
              <Button variant="secondary" onClick={handleCloseModal}>Cancel</Button>
              <Button onClick={handleSaveCase}>Save Case</Button>
            </div>
          )
        }
      >
        {editingCase && (
          <CaseForm caseData={editingCase} onCaseChange={handleCaseChange} technicians={technicians} currentUser={user} />
        )}
      </Modal>
    </div>
  );
};

export default AdminCases;