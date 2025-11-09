import React, { useState, useMemo } from 'react';
import { Case } from '../../types';
import { useData } from '../../hooks/useData';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

interface MillingRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseItem: Case;
}

const MillingRequestModal: React.FC<MillingRequestModalProps> = ({ isOpen, onClose, caseItem }) => {
  const { millingCenters } = useData();
  const [selectedCenterId, setSelectedCenterId] = useState<string>('');

  const selectedCenter = useMemo(() => {
    return millingCenters.find(c => c.id === selectedCenterId);
  }, [selectedCenterId, millingCenters]);

  const requestMessage = useMemo(() => {
    if (!caseItem) return '';
    const ordersText = caseItem.orders.map(o => 
        o.teeth && o.teeth.length > 0 
        ? `- ${o.serviceName} for teeth: ${o.teeth.join(', ')}`
        : `- ${o.quantity}x ${o.serviceName}`
    ).join('\n');

    return `
New Milling/Printing Request
-----------------------------
Case Name: ${caseItem.caseName}
Doctor: ${caseItem.doctor}
Branch: ${caseItem.branch}
Color: ${caseItem.color || 'Not specified'}
-----------------------------
Order Details:
${ordersText}
-----------------------------
Thank you.
    `.trim();
  }, [caseItem]);
  
  const handleSendToWhatsApp = () => {
    if (!selectedCenter) {
      alert("Please select a milling center.");
      return;
    }
    const phoneNumber = selectedCenter.phoneNumber.replace(/[^0-9]/g, '');
    const encodedMessage = encodeURIComponent(requestMessage);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Send to Milling/Printing Center">
      <div className="space-y-4">
        <p>The case has been approved. Please select a center to send the milling/printing request.</p>
        <div>
          <label htmlFor="milling-center" className="block text-sm font-medium text-text-secondary mb-1">Milling Center</label>
          <select
            id="milling-center"
            value={selectedCenterId}
            onChange={(e) => setSelectedCenterId(e.target.value)}
            className="w-full px-3 py-2 border border-border-color rounded-xl bg-white/5 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
          >
            <option value="" disabled>Select a center</option>
            {millingCenters.map(center => (
              <option key={center.id} value={center.id}>{center.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">Generated Request</label>
          <textarea
            readOnly
            value={requestMessage}
            rows={10}
            className="w-full px-3 py-2 border border-border-color rounded-xl bg-white/5 text-sm"
          />
        </div>
        <div className="flex justify-end space-x-2 pt-2">
            <Button variant="secondary" onClick={onClose}>Close</Button>
            <Button onClick={handleSendToWhatsApp} disabled={!selectedCenterId}>
                Send on WhatsApp
            </Button>
        </div>
      </div>
    </Modal>
  );
};

export default MillingRequestModal;
