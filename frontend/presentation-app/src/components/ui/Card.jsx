import React from 'react';
import { motion } from 'framer-motion';

/**
 * Card Component
 * Base container for content with shadow and rounded corners
 */
const Card = React.forwardRef(({
  children,
  className = '',
  hover = false,
  padding = 'md',
  ...props
}, ref) => {
  const paddingStyles = {
    sm: 'p-3',
    md: 'p-4 md:p-6',
    lg: 'p-6 md:p-8',
    none: 'p-0',
  };

  const baseStyles = 'bg-white dark:bg-neutral-800 rounded-lg shadow-sm transition-all duration-250';
  const hoverStyles = hover ? 'hover:shadow-md hover:scale-105' : '';

  return (
    <motion.div
      ref={ref}
      className={`${baseStyles} ${paddingStyles[padding]} ${hoverStyles} ${className}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      {...props}
    >
      {children}
    </motion.div>
  );
});

Card.displayName = 'Card';

export default Card;
