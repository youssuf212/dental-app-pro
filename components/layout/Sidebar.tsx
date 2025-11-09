
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { UserRole } from '../../types';
import { HomeIcon, CaseIcon, UsersIcon, CalendarIcon, DollarSignIcon, SettingsIcon } from '../icons/IconComponents';

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

const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navLinks = user?.role === UserRole.ADMIN ? adminNavLinks : techNavLinks;

  const NavItem: React.FC<{ to: string, text: string, icon: React.ElementType }> = ({ to, text, icon: Icon }) => {
    const isActive = location.pathname.startsWith(to);
    return (
        <NavLink
            to={to}
            className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-md transition-colors duration-200 ${
                isActive ? 'bg-primary/20 text-primary' : 'text-text-secondary hover:bg-white/10'
            }`}
        >
            <Icon className="w-5 h-5 mr-3" />
            <span>{text}</span>
        </NavLink>
    );
  };

  return (
    <aside className="w-64 bg-surface-base border-r border-border-color flex-col hidden sm:flex">
      <div className="h-16 flex items-center px-6 border-b border-border-color">
        <h1 className="text-xl font-bold text-text-primary">DentLab Pro</h1>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navLinks.map((link) => (
          <NavItem key={link.to} {...link} />
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;