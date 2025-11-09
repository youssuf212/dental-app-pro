

import React, { useState, useEffect } from 'react';
import { useData } from '../../hooks/useData';
import { Technician, ServicePrice } from '../../types';
import { FIXED_SERVICES } from '../../constants';
import { SERVICE_PRICES } from '../../services';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import { PlusIcon, EditIcon, TrashIcon } from '../../components/icons/IconComponents';
import { Link } from 'react-router-dom';

const TechnicianForm: React.FC<{
  techData: Partial<Technician> & { password?: string };
  onTechChange: (field: keyof Technician | 'password', value: any) => void;
  isNew: boolean;
}> = ({ techData, onTechChange, isNew }) => {
  
  const handlePricingChange = (index: number, field: 'serviceName' | 'price', value: string | number) => {
    const newPricing = [...(techData.pricing || [])];
    const updatedService = { ...newPricing[index] };
    if (field === 'price') {
      updatedService.price = parseFloat(value as string) || 0;
    } else {
      updatedService.serviceName = value as string;
    }
    newPricing[index] = updatedService;
    onTechChange('pricing', newPricing);
  };

  const addService = () => {
    const newPricing = [...(techData.pricing || []), { serviceName: '', price: 0 }];
    onTechChange('pricing', newPricing);
  };

  const removeService = (index: number) => {
    const newPricing = (techData.pricing || []).filter((_, i) => i !== index);
    onTechChange('pricing', newPricing);
  };

  return (
    <div className="space-y-4">
      <Input label="Name" value={techData.name || ''} onChange={(e) => onTechChange('name', e.target.value)} required />
      <Input label="Email (for login)" value={techData.email || ''} onChange={(e) => onTechChange('email', e.target.value)} required type="email" />
      <Input label="Phone" value={techData.phone || ''} onChange={(e) => onTechChange('phone', e.target.value)} />
       {isNew && (
        <Input 
            label="Set Initial Password" 
            type="password"
            value={techData.password || ''} 
            onChange={(e) => onTechChange('password', e.target.value)} 
            required 
            autoComplete="new-password"
        />
      )}
      <div className="mt-6 pt-4 border-t border-border-color">
        <label className="block text-base font-medium text-text-primary mb-3">Services & Pricing</label>
        <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
          {(techData.pricing || []).map((service, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="flex-grow">
                <Input
                  placeholder="Service Name"
                  aria-label="Service Name"
                  value={service.serviceName}
                  onChange={(e) => handlePricingChange(index, 'serviceName', e.target.value)}
                />
              </div>
              <div className="w-32">
                <Input
                  placeholder="Price"
                  aria-label="Price"
                  type="number"
                  value={service.price}
                  onChange={(e) => handlePricingChange(index, 'price', e.target.value)}
                />
              </div>
              <button
                type="button"
                onClick={() => removeService(index)}
                className="p-2 text-danger hover:bg-danger/20 rounded-md transition-colors"
                aria-label="Remove service"
              >
                <TrashIcon className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
        <Button
          type="button"
          variant="secondary"
          onClick={addService}
          className="mt-4"
        >
          <PlusIcon className="w-4 h-4 mr-2" />
          Add Service
        </Button>
      </div>
    </div>
  );
};

const defaultPricing: ServicePrice[] = FIXED_SERVICES.map(serviceName => ({
    serviceName,
    price: SERVICE_PRICES[serviceName] || 0,
}));

const AdminTechnicians: React.FC = () => {
  const { technicians, addTechnician, updateTechnician } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTech, setEditingTech] = useState<Partial<Technician> & { password?: string } | null>(null);

  const openNewTechModal = () => {
    setEditingTech({name: '', email: '', phone: '', skills: [], password: '', pricing: defaultPricing});
    setIsModalOpen(true);
  };
  
  const openEditTechModal = (tech: Technician) => {
    setEditingTech(tech);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingTech(null);
    setIsModalOpen(false);
  };
  
  const handleTechChange = (field: keyof Technician | 'password', value: any) => {
    setEditingTech(prev => prev ? { ...prev, [field]: value } : null);
  };

  const handleSaveTech = () => {
    if (!editingTech || !editingTech.name || !editingTech.email) {
        alert("Name and Email are required.");
        return;
    }

    if (editingTech.id) {
      updateTechnician(editingTech as Technician);
    } else {
      if (!editingTech.password) {
          alert("Password is required for new technicians.");
          return;
      }
      addTechnician(editingTech as Omit<Technician, 'id'>, editingTech.password);
    }
    handleCloseModal();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-text-primary">Technician Management</h1>
        <Button onClick={openNewTechModal}>
          <PlusIcon className="w-5 h-5 mr-2"/>
          Add Technician
        </Button>
      </div>
      
      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-transparent">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">Phone</th>
                <th className="relative px-6 py-3"><span className="sr-only">Edit</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-color">
              {technicians.map((tech) => (
                <tr key={tech.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-primary">
                      <Link to={`/admin/technicians/${tech.id}`} className="hover:text-primary hover:underline">
                        {tech.name}
                      </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">{tech.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">{tech.phone}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => openEditTechModal(tech)} className="text-primary hover:text-primary-glow">
                        <EditIcon className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingTech?.id ? 'Edit Technician' : 'Add New Technician'}
        size="large"
        footer={
          editingTech && (
            <div className="flex justify-end space-x-4">
              <Button variant="secondary" onClick={handleCloseModal}>Cancel</Button>
              <Button onClick={handleSaveTech}>Save Technician</Button>
            </div>
          )
        }
      >
        {editingTech && (
          <TechnicianForm 
              techData={editingTech} 
              onTechChange={handleTechChange}
              isNew={!editingTech.id}
          />
        )}
      </Modal>
    </div>
  );
};

export default AdminTechnicians;
