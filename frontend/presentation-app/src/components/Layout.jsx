import React, { useState } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import { motion } from 'framer-motion';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleCloseSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen-safe flex flex-col bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-50">
      {/* Navbar - Top */}
      <Navbar onMenuClick={handleSidebarToggle} />

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Hidden on mobile, visible on md and up */}
        <div className="hidden md:block">
          <Sidebar isOpen={true} onClose={handleCloseSidebar} />
        </div>

        {/* Mobile Sidebar Overlay - Visible on mobile only */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 md:hidden"
            onClick={handleCloseSidebar}
          />
        )}

        {/* Mobile Sidebar - Sliding from left on mobile */}
        <div
          className={`fixed left-0 top-16 bottom-20 w-64 md:hidden z-40 transform transition-transform duration-300 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <Sidebar isOpen={sidebarOpen} onClose={handleCloseSidebar} />
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
          <motion.div
            className="container-padding py-4 md:py-6 lg:py-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            {children}
          </motion.div>
        </main>
      </div>

      {/* Bottom Navigation - Mobile only */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40">
        <BottomNav onNavigate={handleCloseSidebar} />
      </div>
    </div>
  );
};

export default Layout;
