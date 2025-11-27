import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users,
  UserPlus,
  DollarSign,
  TrendingUp,
  Activity,
} from 'lucide-react';
import { Card, Button } from '../components/ui';

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL ||
  process.env.REACT_APP_API_URL ||
  '/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalClients: 0,
    activeUsers: 0,
    totalBalance: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all clients
        const clientsResponse = await fetch(`${API_BASE_URL}/clients`);
        if (!clientsResponse.ok) {
          throw new Error(`Clients API error: ${clientsResponse.status}`);
        }
        const clientsData = await clientsResponse.json();
        const totalClients = Array.isArray(clientsData) ? clientsData.length : 0;

        // Fetch total balances
        const balancesResponse = await fetch(`${API_BASE_URL}/transactions/total-balances`);
        if (!balancesResponse.ok) {
          throw new Error(`Balances API error: ${balancesResponse.status}`);
        }
        const totalBalance = await balancesResponse.json();

        // Fetch all users
        const usersResponse = await fetch(`${API_BASE_URL}/users`);
        if (!usersResponse.ok) {
          throw new Error(`Users API error: ${usersResponse.status}`);
        }
        const usersData = await usersResponse.json();
        const activeUsers = Array.isArray(usersData) ? usersData.length : 0;

        setStats({
          totalClients,
          activeUsers,
          totalBalance,
        });
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        console.error('Error details:', err.message);
        
        // Check if it's a server error (500) which usually means database issue
        const isServerError = err.message.includes('500') || err.message.includes('Internal Server Error');
        const isDatabaseError = err.message.includes('SqlException') || err.message.includes('database');
        
        if (isServerError || isDatabaseError) {
          setError(`⚠️ Database connection error. The server cannot connect to SQL Server.\n\nPlease ensure the BANKSYSTEM_DB_CONNECTION environment variable is set correctly on Railway.\n\nError: ${err.message}`);
        } else if (err.message === 'Failed to fetch') {
          setError(`⚠️ Cannot connect to API. The server might be starting up or there's a network issue.\n\nTry refreshing the page in a few seconds.`);
        } else {
          setError(`⚠️ API Error: ${err.message}`);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const quickActions = [
    {
      title: 'Add Client',
      icon: UserPlus,
      description: 'Register a new client',
      path: '/clients/add',
      color: 'primary',
    },
    {
      title: 'View Clients',
      icon: Users,
      description: 'Manage clients',
      path: '/clients/list',
      color: 'info',
    },
    {
      title: 'Exchange Rates',
      icon: DollarSign,
      description: 'Currency exchange',
      path: '/currency-exchange',
      color: 'warning',
    },
  ];

  const StatCard = ({ title, value, icon: Icon, color, trend }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="relative overflow-hidden">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-2">
              {title}
            </p>
            <p className="text-2xl md:text-3xl font-bold text-neutral-900 dark:text-neutral-50">
              {value}
            </p>
            {trend && (
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-xs font-medium text-green-600 dark:text-green-400">
                  {trend}
                </span>
              </div>
            )}
          </div>
          <div className={`p-3 rounded-lg bg-gradient-to-br ${
            color === 'primary' ? 'from-primary-500 to-primary-600' :
            color === 'success' ? 'from-green-500 to-green-600' :
            color === 'warning' ? 'from-yellow-500 to-yellow-600' :
            'from-blue-500 to-blue-600'
          }`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </Card>
    </motion.div>
  );

  const ActionCard = ({ title, description, icon: Icon, path, color }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.02 }}
    >
      <Card
        hover
        className="cursor-pointer relative overflow-hidden group"
        onClick={() => navigate(path)}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h3 className="font-semibold text-neutral-900 dark:text-neutral-50 mb-1">
              {title}
            </h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              {description}
            </p>
          </div>
          <div className={`p-3 rounded-lg bg-gradient-to-br flex-shrink-0 ${
            color === 'primary' ? 'from-primary-100 dark:from-primary-900/30 to-primary-200 dark:to-primary-800/30' :
            color === 'success' ? 'from-green-100 dark:from-green-900/30 to-green-200 dark:to-green-800/30' :
            color === 'warning' ? 'from-yellow-100 dark:from-yellow-900/30 to-yellow-200 dark:to-yellow-800/30' :
            'from-blue-100 dark:from-blue-900/30 to-blue-200 dark:to-blue-800/30'
          }`}>
            <Icon className={`w-6 h-6 ${
              color === 'primary' ? 'text-primary-600 dark:text-primary-400' :
              color === 'success' ? 'text-green-600 dark:text-green-400' :
              color === 'warning' ? 'text-yellow-600 dark:text-yellow-400' :
              'text-blue-600 dark:text-blue-400'
            }`} />
          </div>
        </div>
      </Card>
    </motion.div>
  );

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-neutral-50">
          Welcome back! 👋
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-2">
          Here's what's happening in your bank today
        </p>
      </motion.div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-700 dark:text-red-400 whitespace-pre-line text-sm">{error}</p>
        </div>
      )}

      {/* Statistics Grid - Responsive */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          title="Total Clients"
          value={loading ? '...' : stats.totalClients.toLocaleString()}
          icon={Users}
          color="primary"
        />
        <StatCard
          title="Active Users"
          value={loading ? '...' : stats.activeUsers}
          icon={Activity}
          color="warning"
        />
        <StatCard
          title="Total Balance"
          value={loading ? '...' : `$${stats.totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={DollarSign}
          color="info"
        />
      </div>

      {/* Quick Actions Section */}
      <div>
        <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50 mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <ActionCard {...action} />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Additional Actions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="bg-gradient-to-r from-primary-500/10 to-primary-600/10 dark:from-primary-900/20 dark:to-primary-800/20 border border-primary-200 dark:border-primary-800/50">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50 mb-1">
                Manage Users & Settings
              </h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Access user management, system settings, and more advanced features
              </p>
            </div>
            <Button
              variant="primary"
              onClick={() => navigate('/users')}
              className="whitespace-nowrap"
            >
              Go to Settings →
            </Button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default Dashboard;
