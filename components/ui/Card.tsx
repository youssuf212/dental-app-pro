import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  noFloat?: boolean;
}

const Card: React.FC<CardProps> = ({ children, className = '', noFloat = false }) => {
  return (
    <motion.div
      whileHover={{ y: -12, scale: 1.02, transition: { type: 'spring', stiffness: 300 } }}
      className={`bg-[rgba(10,10,11,0.7)] backdrop-blur-xl border border-border-color rounded-2xl p-6 ${!noFloat ? 'card-float' : ''} ${className}`}
    >
      {children}
    </motion.div>
  );
};

export default Card;
