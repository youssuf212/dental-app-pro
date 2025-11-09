import React from 'react';
import { XIcon } from '../icons/IconComponents';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'default' | 'large';
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, footer, size = 'default' }) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const sizeClasses = {
    default: 'max-w-2xl w-full',
    large: 'max-w-6xl w-full h-full'
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={handleBackdropClick}
    >
      <div 
        className={`bg-surface-modal/80 backdrop-blur-xl border border-border-color rounded-2xl flex flex-col overflow-hidden ${sizeClasses[size]}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-border-color flex items-center justify-between flex-shrink-0">
          <h3 id="modal-title" className="text-lg font-medium leading-6 text-text-primary">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-text-tertiary hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label="Close modal"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>
        <div className={`p-6 ${size === 'large' ? 'overflow-y-auto flex-grow' : ''}`}>
          {children}
        </div>
        {footer && (
          <div className="px-6 py-4 border-t border-border-color flex-shrink-0 bg-black/20">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
