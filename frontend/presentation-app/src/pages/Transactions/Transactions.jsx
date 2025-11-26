import React from 'react';
import { useTheme } from '../../hooks/useTheme';
import ThemeToggle from '../../components/ThemeToggle';
import MenuCard from '../../components/MenuCard';
import { DollarSign, Landmark, Clock, ArrowRightLeft, Wallet } from 'lucide-react';
import { Link } from 'react-router-dom';

const Transactions = () => {
  useTheme();

  const menuItems = [
    { name: 'Deposit', path: '/transactions/deposit', icon: DollarSign },
    { name: 'Withdraw', path: '/transactions/withdraw', icon: Landmark },
    { name: 'Transfer', path: '/transactions/transfer', icon: ArrowRightLeft },
    { name: 'History', path: '/transactions/history', icon: Clock },
    { name: 'Total Balances', path: '/transactions/total-balances', icon: Wallet },
  ];

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      <div className="flex justify-between items-center mb-4">
        <Link to="/dashboard" className="text-blue-600 dark:text-blue-400 hover:underline">
          &larr; Back to Dashboard
        </Link>
        <ThemeToggle />
      </div>
      <h1 className="text-3xl font-bold text-center text-blue-600 dark:text-blue-400 mb-8">Transactions Menu</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
        {menuItems.map((item) => (
          <MenuCard
            key={item.name}
            title={item.name}
            icon={item.icon}
            path={item.path}
          />
        ))}
      </div>
    </div>
  );
};

export default Transactions;
