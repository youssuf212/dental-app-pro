import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { LogOutIcon, ChevronDownIcon, MenuIcon } from '../icons/IconComponents';
import GlobalSearch from '../ui/GlobalSearch';
import NotificationBell from '../ui/NotificationBell';
import ThemeToggle from '../ui/ThemeToggle';
import { motion } from 'framer-motion';

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <motion.header 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 100, damping: 20, delay: 0.5 }}
      className="fixed top-5 left-0 sm:left-[124px] right-5 sm:right-8 h-[70px] z-30 bg-[rgba(10,10,11,0.7)] backdrop-blur-xl border border-border-color rounded-2xl"
    >
      <div className="px-4 sm:px-6 h-full flex items-center justify-between">
        <div className="flex items-center">
          <button onClick={onMenuClick} className="sm:hidden mr-4 text-text-tertiary">
              <MenuIcon className="w-6 h-6" />
          </button>
          <GlobalSearch />
        </div>
        <div className="flex items-center space-x-2 sm:space-x-4">
          <ThemeToggle />
          <NotificationBell />
          <div className="relative group hidden sm:flex items-center space-x-3 cursor-pointer p-2 rounded-lg transition-colors hover:bg-white/5">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-lg font-bold">
                {user?.name.charAt(0)}
              </div>
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-status-finished rounded-full border-2 border-surface-elevated" style={{boxShadow: '0 0 5px #00FF94'}}/>
            </div>
            <span className="text-sm text-text-secondary">{user?.name}</span>
            <ChevronDownIcon className="w-4 h-4 text-text-tertiary transition-transform group-hover:rotate-180" />
          </div>
          <button onClick={handleLogout} className="text-text-tertiary hover:text-text-primary p-2 rounded-full transition-colors hover:bg-white/10" title="Logout">
            <LogOutIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
