import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Users, 
  ArrowRightLeft, 
  Users as ManageUsersIcon, 
  DollarSign,
  Home,
  ChevronDown,
  X
} from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * Sidebar Component
 * Responsive navigation menu
 * Mobile: Sliding drawer
 * Desktop: Fixed sidebar
 */
const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const [expandedMenu, setExpandedMenu] = useState(null);

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: Home },
    {
      name: 'Clients',
      icon: Users,
      submenu: [
        { name: 'List', path: '/clients/list' },
        { name: 'Add', path: '/clients/add' },
        { name: 'Find', path: '/clients/find' },
      ],
    },
    {
      name: 'Transactions',
      icon: ArrowRightLeft,
      submenu: [
        { name: 'View All', path: '/transactions' },
        { name: 'Deposit', path: '/transactions/deposit' },
        { name: 'Withdraw', path: '/transactions/withdraw' },
        { name: 'Transfer', path: '/transactions/transfer' },
        { name: 'History', path: '/transactions/history' },
        { name: 'Balances', path: '/transactions/total-balances' },
      ],
    },
    {
      name: 'Users Management',
      icon: ManageUsersIcon,
      submenu: [
        { name: 'List', path: '/users/list' },
        { name: 'Add', path: '/users/add' },
        { name: 'Find', path: '/users/find' },
      ],
    },
    {
      name: 'Currency Exchange',
      icon: DollarSign,
      submenu: [
        { name: 'List', path: '/currency-exchange/list' },
        { name: 'Converter', path: '/currency-exchange/converter' },
      ],
    },
  ];

  const isMenuItemActive = (path) => {
    return location.pathname === path;
  };

  const isMenuSectionActive = (submenu) => {
    return submenu?.some(item => location.pathname === item.path);
  };

  const toggleMenu = (index) => {
    setExpandedMenu(expandedMenu === index ? null : index);
  };

  return (
    <>
      {/* Mobile Close Button - Visible only on mobile */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-700">
        <h2 className="font-bold text-lg text-neutral-900 dark:text-neutral-50">Menu</h2>
        <button
          onClick={onClose}
          className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors"
          aria-label="Close menu"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="w-full h-full overflow-y-auto scrollbar-hide bg-white dark:bg-neutral-800 md:border-r md:border-neutral-200 md:dark:border-neutral-700">
        <ul className="p-4 space-y-1 md:space-y-2">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = isMenuItemActive(item.path) || isMenuSectionActive(item.submenu);
            const isExpanded = expandedMenu === index;

            return (
              <li key={item.name}>
                {/* Main Menu Item */}
                {item.submenu ? (
                  <motion.button
                    onClick={() => toggleMenu(index)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg font-medium transition-all duration-250 ${
                      isActive
                        ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
                        : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700'
                    }`}
                    whileHover={{ x: 4 }}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5" />
                      <span className="text-sm md:text-base">{item.name}</span>
                    </div>
                    <motion.div
                      animate={{ rotate: isExpanded ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </motion.div>
                  </motion.button>
                ) : (
                  <Link
                    to={item.path}
                    onClick={() => onClose?.()}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-250 ${
                      isActive
                        ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
                        : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-sm md:text-base">{item.name}</span>
                  </Link>
                )}

                {/* Submenu Items */}
                {item.submenu && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{
                      height: isExpanded ? 'auto' : 0,
                      opacity: isExpanded ? 1 : 0,
                    }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <ul className="mt-1 ml-4 space-y-1 border-l-2 border-neutral-200 dark:border-neutral-700 pl-3">
                      {item.submenu.map((subitem) => (
                        <li key={subitem.name}>
                          <Link
                            to={subitem.path}
                            onClick={() => onClose?.()}
                            className={`block px-3 py-2 rounded-lg text-sm font-medium transition-all duration-250 ${
                              isMenuItemActive(subitem.path)
                                ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
                                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-700/50'
                            }`}
                          >
                            {subitem.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
};

export default Sidebar;
