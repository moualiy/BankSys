import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import useApi from '../../hooks/useApi';
import { toast } from 'react-toastify';

const History = () => {
  const { data: transactions, loading, error, request: fetchTransactions } = useApi();

  useEffect(() => {
    fetchTransactions('get', '/transactions/history');
  }, [fetchTransactions]);

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) {
    toast.error('Failed to fetch transaction history.');
    return <div className="p-4 text-red-500">Error: Failed to fetch transaction history.</div>;
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold text-blue-600 dark:text-blue-400">Transaction History</h1>
        <Link to="/transactions" className="text-blue-600 dark:text-blue-400 hover:underline">
          &larr; Back to Transactions
        </Link>
      </div>
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-md overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">From Client</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">To Client</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {transactions && transactions.map((transaction) => (
              <tr key={transaction.id}>
                {/* Support both front-end expected names and backend model names (sender/receiver) */}
                <td className="px-6 py-4 whitespace-nowrap">{transaction.fromClientId ?? transaction.senderClientId ?? '—'}</td>
                <td className="px-6 py-4 whitespace-nowrap">{transaction.toClientId ?? transaction.receiverClientId ?? '—'}</td>
                <td className="px-6 py-4 whitespace-nowrap">{transaction.amount ?? '—'}</td>
                <td className="px-6 py-4 whitespace-nowrap">{
                  (() => {
                    // Try multiple possible date fields and defend against invalid values
                    const raw = transaction.date ?? transaction.transferTimestamp ?? transaction.TransferTimestamp ?? transaction.TransferTime ?? null;
                    if (!raw) return '—';
                    const d = new Date(raw);
                    return isNaN(d.getTime()) ? String(raw) : d.toLocaleString();
                  })()
                }</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default History;