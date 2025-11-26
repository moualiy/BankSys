import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const MenuCard = ({ title, icon: Icon, path }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="flex items-center justify-center p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-lg transition duration-300 transform"
    >
      <Link to={path} className="flex flex-col items-center text-center">
        {Icon && <Icon size={48} className="text-blue-500 dark:text-blue-400 mb-3" />}
        <span className="text-xl font-semibold text-gray-800 dark:text-gray-200">{title}</span>
      </Link>
    </motion.div>
  );
};

export default MenuCard;
