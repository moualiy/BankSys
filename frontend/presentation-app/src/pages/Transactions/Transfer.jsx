import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import useApi from '../../hooks/useApi';
import { toast } from 'react-toastify';

const Transfer = () => {
  const [fromClientId, setFromClientId] = useState('');
  const [toClientId, setToClientId] = useState('');
  const [amount, setAmount] = useState('');
  const { loading, error, request: transfer } = useApi();

  const handleTransfer = async (e) => {
    e.preventDefault();
    try {
      const parsedFrom = parseInt(fromClientId, 10);
      const parsedTo = parseInt(toClientId, 10);
      const parsedAmount = parseFloat(amount);

      if (Number.isNaN(parsedFrom) || parsedFrom <= 0) {
        toast.error('Please enter a valid numeric From Client ID.');
        return;
      }
      if (Number.isNaN(parsedTo) || parsedTo <= 0) {
        toast.error('Please enter a valid numeric To Client ID.');
        return;
      }
      if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
        toast.error('Please enter a valid amount greater than 0.');
        return;
      }

      // Attach authorizedByUserId from localStorage if available (set after login)
      const storedUserId = localStorage.getItem('userId');
      const authorizedByUserId = storedUserId ? parseInt(storedUserId, 10) : 0;

      try {
        await transfer('post', '/transactions/transfer', { fromClientId: parsedFrom, toClientId: parsedTo, amount: parsedAmount, authorizedByUserId });
        toast.success('Transfer successful.');
      } catch (err) {
        // If the API returned 401 Unauthorized, inform the user to login
        if (err.response && err.response.status === 401) {
          toast.error('You must be logged in to perform transfers. Please login and try again.');
          return;
        }
        throw err;
      }
      setFromClientId('');
      setToClientId('');
      setAmount('');
    } catch (error) {
      toast.error('Transfer failed.');
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold text-blue-600 dark:text-blue-400">Transfer</h1>
        <Link to="/transactions" className="text-blue-600 dark:text-blue-400 hover:underline">
          &larr; Back to Transactions
        </Link>
      </div>
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-md p-6">
        <form onSubmit={handleTransfer}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">From Client ID</label>
            <input type="text" value={fromClientId} onChange={(e) => setFromClientId(e.target.value)} placeholder="Enter numeric client id" className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" required />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">To Client ID</label>
            <input type="text" value={toClientId} onChange={(e) => setToClientId(e.target.value)} placeholder="Enter numeric client id" className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" required />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Amount</label>
            <input type="text" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Enter amount (e.g. 50.00)" className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" required />
          </div>
          <div className="flex justify-end">
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700" disabled={loading}>
              {loading ? 'Processing...' : 'Transfer'}
            </button>
          </div>
          {error && <div className="p-4 text-red-500">Error: {error.message}</div>}
        </form>
      </div>
    </div>
  );
};

export default Transfer;