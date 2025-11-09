

import React from 'react';
import Modal from './Modal';
import Button from './Button';
import { HomeIcon, CaseIcon, BellIcon, SearchIcon } from '../icons/IconComponents';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Welcome to DentLab Pro!">
      <div className="space-y-4 text-text-secondary">
        <p>We're excited to have you! Here are a few tips to get you started:</p>
        <ul className="space-y-3">
          <li className="flex items-start">
            <HomeIcon className="w-5 h-5 mr-3 mt-1 text-primary flex-shrink-0" />
            <span><strong>Dashboard:</strong> Get a quick overview of all ongoing activity and case statuses right from your main dashboard.</span>
          </li>
          <li className="flex items-start">
            <CaseIcon className="w-5 h-5 mr-3 mt-1 text-primary flex-shrink-0" />
            <span><strong>Manage Cases:</strong> Use the "Cases" page to create, view, and manage all your dental cases. Try the new Kanban board for a visual workflow!</span>
          </li>
          <li className="flex items-start">
            <SearchIcon className="w-5 h-5 mr-3 mt-1 text-primary flex-shrink-0" />
            <span><strong>Global Search:</strong> Use the search bar in the header to instantly find any case or technician in the system.</span>
          </li>
          <li className="flex items-start">
            <BellIcon className="w-5 h-5 mr-3 mt-1 text-primary flex-shrink-0" />
            <span><strong>Notifications:</strong> Keep an eye on the bell icon for important updates and status changes.</span>
          </li>
        </ul>
        <div className="pt-4 flex justify-end">
          <Button onClick={onClose}>Get Started</Button>
        </div>
      </div>
    </Modal>
  );
};

export default OnboardingModal;
