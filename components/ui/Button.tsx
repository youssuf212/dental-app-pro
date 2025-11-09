import React from 'react';
import { motion } from 'framer-motion';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', className = '', ...props }) => {
  const baseClasses = "relative inline-flex items-center justify-center px-6 py-2.5 text-sm font-bold rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background transition-all duration-300 overflow-hidden";
  
  const variantClasses = {
    primary: 'text-black bg-gradient-to-r from-primary-glow to-primary-medium hover:shadow-glow-primary',
    secondary: 'text-text-primary bg-white/5 hover:bg-white/10 focus:ring-text-secondary',
    danger: 'text-white bg-danger/80 hover:bg-danger focus:ring-danger',
  };

  return (
    <motion.button
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.95 }}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {variant === 'primary' && <div className="absolute inset-0 shimmer-bg opacity-50"/>}
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
};

export default Button;
