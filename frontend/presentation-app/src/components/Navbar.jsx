import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, LogOut } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import { motion } from 'framer-motion';

const Navbar = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isAuthPage = location.pathname === '/login' || location.pathname === '/logout';

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <motion.nav
      className="sticky top-0 z-40 bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 shadow-sm"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="container-padding h-16 flex items-center justify-between gap-4">
        {/* Left Side - Logo & Menu */}
        <div className="flex items-center gap-3">
          {/* Mobile Menu Button */}
          {!isAuthPage && (
            <button
              onClick={onMenuClick}
              className="md:hidden p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors"
              aria-label="Toggle menu"
            >
              <Menu className="w-6 h-6" />
            </button>
          )}

          {/* Logo */}
          <div
            onClick={() => navigate('/dashboard')}
            className="cursor-pointer flex items-center gap-2 group"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center text-white font-bold group-hover:shadow-md transition-shadow">
              B
            </div>
            <span className="hidden sm:inline font-bold text-lg text-neutral-900 dark:text-neutral-50 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
              BankSys
            </span>
          </div>
        </div>

        {/* Right Side - Theme Toggle & Logout */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {!isAuthPage && (
            <button
              onClick={handleLogout}
              className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg transition-colors"
              aria-label="Logout"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
