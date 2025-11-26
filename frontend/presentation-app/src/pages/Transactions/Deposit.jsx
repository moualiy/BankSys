import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import useApi from '../../hooks/useApi';
import { toast } from 'react-toastify';

const Deposit = () => {
  const [clientId, setClientId] = useState('');
  const [amount, setAmount] = useState('');
  const { loading, error, request: deposit } = useApi();

  const handleDeposit = async (e) => {
    e.preventDefault();
    try {
      // validate and parse inputs
      const parsedClientId = parseInt(clientId, 10);
      const parsedAmount = parseFloat(amount);

      if (Number.isNaN(parsedClientId) || parsedClientId <= 0) {
        toast.error('Please enter a valid numeric Client ID.');
        return;
      }
      if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
        toast.error('Please enter a valid amount greater than 0.');
        return;
      }

      // send numeric values to API
      await deposit('post', '/transactions/deposit', { clientId: parsedClientId, amount: parsedAmount });
      toast.success('Deposit successful.');
      setClientId('');
      setAmount('');
    } catch (error) {
      toast.error('Deposit failed.');
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold text-blue-600 dark:text-blue-400">Deposit</h1>
        <Link to="/transactions" className="text-blue-600 dark:text-blue-400 hover:underline">
          &larr; Back to Transactions
        </Link>
      </div>
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-md p-6">
        <form onSubmit={handleDeposit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Client ID</label>
            <input type="text" value={clientId} onChange={(e) => setClientId(e.target.value)} placeholder="Enter numeric client id" className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" required />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Amount</label>
            <input type="text" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Enter amount (e.g. 100.50)" className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" required />
          </div>
          <div className="flex justify-end">
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700" disabled={loading}>
              {loading ? 'Processing...' : 'Deposit'}
            </button>
          </div>
          {error && <div className="p-4 text-red-500">Error: {error.message}</div>}
        </form>
      </div>
    </div>
  );
};

export default Deposit;