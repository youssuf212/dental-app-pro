import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import OnboardingModal from '../ui/OnboardingModal';
import MobileNav from './MobileNav';
import FloatingNav from './FloatingNav';
import AnimatedBackground from '../ui/AnimatedBackground';
import { motion, AnimatePresence } from 'framer-motion';

const DashboardLayout: React.FC = () => {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const hasBeenOnboarded = localStorage.getItem('onboardingComplete');
    if (!hasBeenOnboarded) {
      setShowOnboarding(true);
    }
  }, []);
  
  useEffect(() => {
    setIsMobileNavOpen(false);
  }, [location.pathname]);

  const handleCloseOnboarding = () => {
    localStorage.setItem('onboardingComplete', 'true');
    setShowOnboarding(false);
  };

  const pageVariants = {
    initial: { opacity: 0, scale: 0.98, filter: 'blur(10px)' },
    in: { opacity: 1, scale: 1, filter: 'blur(0px)' },
    out: { opacity: 0, scale: 1.02, filter: 'blur(10px)' },
  };

  const pageTransition = {
    type: 'tween',
    ease: 'anticipate',
    duration: 0.8,
  };

  return (
    <div className="flex h-screen bg-background text-text-primary overflow-hidden">
      <AnimatedBackground />
      <FloatingNav />
      <MobileNav isOpen={isMobileNavOpen} onClose={() => setIsMobileNavOpen(false)} />
      
      <div className="flex-1 flex flex-col overflow-hidden pl-0 sm:pl-[124px]">
        <Header onMenuClick={() => setIsMobileNavOpen(true)} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto pt-[90px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial="initial"
              animate="in"
              exit="out"
              variants={pageVariants}
              transition={pageTransition}
              className="p-6 sm:p-8"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
      <OnboardingModal isOpen={showOnboarding} onClose={handleCloseOnboarding} />
    </div>
  );
};

export default DashboardLayout;
