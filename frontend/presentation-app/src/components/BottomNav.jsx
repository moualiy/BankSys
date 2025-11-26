import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Wallet, Send, Users, DollarSign, Settings } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * BottomNav Component
 * Mobile navigation bar that appears at the bottom
 * Shows quick navigation to main sections
 */
const BottomNav = ({ onNavigate }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { label: 'Dashboard', icon: Wallet, path: '/dashboard' },
    { label: 'Clients', icon: Users, path: '/clients/list' },
    { label: 'Transactions', icon: Send, path: '/transactions' },
    { label: 'Currency', icon: DollarSign, path: '/currency-exchange' },
    { label: 'Settings', icon: Settings, path: '/users' },
  ];

  const isActive = (path) => location.pathname.startsWith(path.split('/')[1]);

  const handleNavigation = (path) => {
    navigate(path);
    onNavigate?.();
  };

  return (
    <motion.div
      className="bg-white dark:bg-neutral-800 border-t border-neutral-200 dark:border-neutral-700 shadow-lg"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <motion.button
              key={item.path}
              onClick={() => handleNavigation(item.path)}
              className={`flex flex-col items-center justify-center flex-1 py-3 px-2 transition-all duration-250 ${
                active
                  ? 'text-primary-600 dark:text-primary-400'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
              }`}
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.05 }}
            >
              <Icon className="w-6 h-6" />
              <span className="text-xs font-medium mt-1">{item.label}</span>
              {active && (
                <motion.div
                  className="absolute bottom-0 h-1 bg-primary-600 dark:bg-primary-400"
                  layoutId="activeIndicator"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  style={{ width: `${100 / navItems.length}%` }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
};

export default BottomNav;
