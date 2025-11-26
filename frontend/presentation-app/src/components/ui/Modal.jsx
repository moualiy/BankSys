import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

/**
 * Modal Component
 * Dialog/Modal overlay with animations
 */
const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  closeButton = true,
  className = '',
  ...props
}) => {
  const sizeStyles = {
    sm: 'w-full max-w-sm',
    md: 'w-full max-w-md',
    lg: 'w-full max-w-lg',
    xl: 'w-full max-w-2xl',
    full: 'w-full h-full',
  };

  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 dark:bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleBackdropClick}
            transition={{ duration: 0.2 }}
          />

          {/* Modal Content */}
          <motion.div
            className={`relative bg-white dark:bg-neutral-800 rounded-t-lg md:rounded-lg shadow-xl ${sizeStyles[size]} ${className}`}
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            {...props}
          >
            {/* Header */}
            {(title || closeButton) && (
              <div className="flex items-center justify-between p-4 md:p-6 border-b border-neutral-200 dark:border-neutral-700">
                {title && <h2 className="text-lg md:text-xl font-bold text-neutral-900 dark:text-neutral-50">{title}</h2>}
                <div className="flex-1" />
                {closeButton && (
                  <button
                    onClick={onClose}
                    className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors"
                    aria-label="Close modal"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            )}

            {/* Body */}
            <div className="p-4 md:p-6 overflow-y-auto max-h-[60vh]">
              {children}
            </div>

            {/* Footer */}
            {footer && (
              <div className="p-4 md:p-6 border-t border-neutral-200 dark:border-neutral-700 flex gap-3 justify-end">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
