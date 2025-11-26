import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import useApi from '../../hooks/useApi';
import { toast } from 'react-toastify';

const TotalBalances = () => {
  const { data: totalBalance, loading, error, request: fetchTotalBalance } = useApi();

  useEffect(() => {
    fetchTotalBalance('get', '/transactions/total-balances');
  }, [fetchTotalBalance]);

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) {
    toast.error('Failed to fetch total balance.');
    return <div className="p-4 text-red-500">Error: Failed to fetch total balance.</div>;
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold text-blue-600 dark:text-blue-400">Total Balances</h1>
        <Link to="/transactions" className="text-blue-600 dark:text-blue-400 hover:underline">
          &larr; Back to Transactions
        </Link>
      </div>
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-md p-6 text-center">
        <h2 className="text-2xl font-bold mb-4">Total Balance of All Clients</h2>
        <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">${totalBalance ? totalBalance.toLocaleString() : 0}</p>
      </div>
    </div>
  );
};

export default TotalBalances;