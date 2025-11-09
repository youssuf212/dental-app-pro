import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { UserRole } from '../../types';
import { HomeIcon, CaseIcon, UsersIcon, CalendarIcon, DollarSignIcon, SettingsIcon, XIcon } from '../icons/IconComponents';

const adminNavLinks = [
  { to: '/admin/dashboard', text: 'Dashboard', icon: HomeIcon },
  { to: '/admin/cases', text: 'Cases', icon: CaseIcon },
  { to: '/admin/technicians', text: 'Technicians', icon: UsersIcon },
  { to: '/admin/calendar', text: 'Calendar', icon: CalendarIcon },
  { to: '/admin/payments', text: 'Payments', icon: DollarSignIcon },
  { to: '/admin/settings', text: 'Settings', icon: SettingsIcon },
];

const techNavLinks = [
  { to: '/technician/dashboard', text: 'Dashboard', icon: HomeIcon },
  { to: '/technician/all-cases', text: 'All Cases', icon: CaseIcon },
  { to: '/technician/settings', text: 'Settings', icon: SettingsIcon },
];


interface MobileNavProps {
    isOpen: boolean;
    onClose: () => void;
}

const MobileNav: React.FC<MobileNavProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const location = useLocation();
  const navLinks = user?.role === UserRole.ADMIN ? adminNavLinks : techNavLinks;

  const NavItem: React.FC<{ to: string, text: string, icon: React.ElementType }> = ({ to, text, icon: Icon }) => {
    const isActive = location.pathname.startsWith(to);
    return (
        <NavLink
            to={to}
            onClick={onClose}
            className={`flex items-center px-4 py-3 text-base font-medium rounded-xl transition-colors duration-200 ${
                isActive ? 'bg-primary/20 text-primary' : 'text-text-secondary hover:bg-white/5'
            }`}
        >
            <Icon className="w-6 h-6 mr-4" />
            <span>{text}</span>
        </NavLink>
    );
  };

  return (
    <>
        <div className={`fixed inset-0 z-30 bg-black bg-opacity-70 backdrop-blur-sm transition-opacity sm:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={onClose}></div>
        <div className={`fixed inset-y-0 left-0 z-40 w-64 bg-surface-base border-r border-border-color flex flex-col transform transition-transform sm:hidden ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className="h-16 flex items-center justify-between px-6 border-b border-border-color">
                <h1 className="text-xl font-bold text-text-primary">DentLab Pro</h1>
                <button onClick={onClose} className="text-text-secondary">
                    <XIcon className="w-6 h-6" />
                </button>
            </div>
            <nav className="flex-1 px-4 py-6 space-y-2">
                {navLinks.map((link) => (
                <NavItem key={link.to} {...link} />
                ))}
            </nav>
        </div>
    </>
  );
};

export default MobileNav;
