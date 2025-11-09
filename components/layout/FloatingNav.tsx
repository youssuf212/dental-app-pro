import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { UserRole } from '../../types';
import { HomeIcon, CaseIcon, UsersIcon, CalendarIcon, DollarSignIcon, SettingsIcon } from '../icons/IconComponents';
import { motion } from 'framer-motion';

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

const navVariants = {
  collapsed: { width: 80 },
  expanded: { 
    width: 280,
    transition: { type: 'spring', stiffness: 100, damping: 15 }
  },
};

const textVariants = {
  collapsed: { opacity: 0, x: -20, transition: { duration: 0.2 } },
  expanded: { opacity: 1, x: 0, transition: { delay: 0.15, duration: 0.3 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.05,
      type: 'spring',
      stiffness: 120,
    },
  }),
};

const FloatingNav: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navLinks = user?.role === UserRole.ADMIN ? adminNavLinks : techNavLinks;

  const NavItem: React.FC<{ to: string, text: string, icon: React.ElementType, index: number }> = ({ to, text, icon: Icon, index }) => {
    const isActive = location.pathname.startsWith(to);
    return (
      <motion.div variants={itemVariants} custom={index}>
        <NavLink
            to={to}
            className={`flex items-center h-16 px-6 text-lg font-medium rounded-2xl transition-colors duration-300 relative overflow-hidden group
              ${isActive ? 'text-text-primary' : 'text-text-tertiary hover:text-text-primary'}
            `}
        >
          {isActive && (
            <motion.div
              layoutId="active-nav-glow"
              className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-2xl"
              style={{
                boxShadow: '0 0 20px rgba(0, 255, 245, 0.4), inset 0 0 10px rgba(0, 255, 245, 0.2)'
              }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            />
          )}
           <div className={`absolute left-0 top-0 h-full w-1 bg-primary-glow transition-all duration-300 ${isActive ? 'opacity-100' : 'opacity-0'}`} style={{ boxShadow: '0 0 10px #00FFF5' }} />
          <Icon className={`w-7 h-7 mr-6 flex-shrink-0 z-10 transition-all duration-300 ${isActive ? 'text-primary-glow animate-pulse' : 'text-text-tertiary group-hover:text-text-secondary'}`} />
          <motion.span variants={textVariants} className="z-10">{text}</motion.span>
        </NavLink>
      </motion.div>
    );
  };

  return (
    <motion.nav
      initial="collapsed"
      whileHover="expanded"
      variants={navVariants}
      className="fixed left-6 top-1/2 -translate-y-1/2 z-40 bg-[rgba(18,18,20,0.6)] backdrop-blur-xl border border-border-color rounded-2xl p-3 flex-col hidden sm:flex"
    >
       <div className="h-16 flex items-center px-6 overflow-hidden">
        <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-glow to-accent-glow" style={{ animation: 'gradient-text 5s ease infinite' }}>DL</span>
        <motion.h1 variants={textVariants} className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-glow to-accent-glow" style={{ animation: 'gradient-text 5s ease infinite' }}>
          entLab Pro
        </motion.h1>
      </div>
      <div className="flex-1 space-y-2 mt-4">
        {navLinks.map((link, index) => (
          <NavItem key={link.to} {...link} index={index} />
        ))}
      </div>
    </motion.nav>
  );
};

export default FloatingNav;
