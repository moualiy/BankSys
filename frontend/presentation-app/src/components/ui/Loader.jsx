import React from 'react';
import { motion } from 'framer-motion';

/**
 * Loader Component
 * Spinner for loading states
 */
const Loader = ({
  size = 'md',
  variant = 'primary',
  className = '',
}) => {
  const sizeStyles = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const colorStyles = {
    primary: 'text-primary-500',
    white: 'text-white',
    neutral: 'text-neutral-500',
  };

  return (
    <motion.div
      className={`${sizeStyles[size]} ${colorStyles[variant]} ${className}`}
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
    >
      <svg className="w-full h-full" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" opacity="0.2" />
        <path
          d="M12 2a10 10 0 0 1 10 10"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
    </motion.div>
  );
};

export default Loader;
