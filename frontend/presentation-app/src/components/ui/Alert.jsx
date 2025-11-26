import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle, CheckCircle, AlertTriangle, Info } from 'lucide-react';

/**
 * Alert Component
 * Status messages with icons
 * Types: success, error, warning, info
 */
const Alert = ({
  children,
  type = 'info',
  title,
  closeable = false,
  onClose,
  icon: CustomIcon,
  className = '',
  ...props
}) => {
  const [isOpen, setIsOpen] = React.useState(true);

  const typeStyles = {
    success: 'border-green-300 dark:border-green-800 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300',
    error: 'border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300',
    warning: 'border-yellow-300 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300',
    info: 'border-blue-300 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300',
  };

  const iconMap = {
    success: <CheckCircle className="w-5 h-5 flex-shrink-0" />,
    error: <AlertCircle className="w-5 h-5 flex-shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 flex-shrink-0" />,
    info: <Info className="w-5 h-5 flex-shrink-0" />,
  };

  const handleClose = () => {
    setIsOpen(false);
    onClose?.();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className={`flex gap-3 p-4 rounded-lg border ${typeStyles[type]} ${className}`}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
        {...props}
      >
        <div className="flex-shrink-0">
          {CustomIcon ? <CustomIcon /> : iconMap[type]}
        </div>
        <div className="flex-1">
          {title && <div className="font-semibold mb-1">{title}</div>}
          <div className="text-sm">{children}</div>
        </div>
        {closeable && (
          <button
            onClick={handleClose}
            className="flex-shrink-0 ml-2 opacity-70 hover:opacity-100 transition-opacity"
            aria-label="Close alert"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default Alert;
