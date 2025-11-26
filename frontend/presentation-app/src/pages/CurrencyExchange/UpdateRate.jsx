import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useApi from '../../hooks/useApi';
import { toast } from 'react-toastify';

const UpdateRate = () => {
  const [currencyCode, setCurrencyCode] = useState('');
  const [newRate, setNewRate] = useState('');
  const { data: currency, loading, error, request } = useApi();
  const navigate = useNavigate();

  const fetchCurrency = useCallback(async () => {
    if (!currencyCode) return;
    try {
      const response = await request('get', `/currencies/${currencyCode}`);
      setNewRate(response.rate);
    } catch (error) {
      setNewRate('');
      toast.error('Failed to fetch currency.');
    }
  }, [currencyCode, request]);

  useEffect(() => {
    fetchCurrency();
  }, [fetchCurrency]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await request('put', `/currencies/${currencyCode}`, { rate: parseFloat(newRate) });
      toast.success('Currency rate updated successfully.');
      navigate('/currency-exchange/list');
    } catch (error) {
      toast.error('Failed to update currency rate.');
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold text-blue-600 dark:text-blue-400">Update Currency Rate</h1>
        <Link to="/currency-exchange" className="text-blue-600 dark:text-blue-400 hover:underline">
          &larr; Back to Currency Exchange
        </Link>
      </div>
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-md p-6">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Currency Code</label>
            <input type="text" value={currencyCode} onChange={(e) => setCurrencyCode(e.target.value.toUpperCase())} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder="e.g., USD" required />
          </div>
          {loading && <div className="p-4">Loading...</div>}
          {error && <div className="p-4 text-red-500">Error: {error.message}</div>}
          {currency && (
            <div className="mb-4">
              <p><strong>Current Rate for {currency.name} ({currency.code}):</strong> {currency.rate}</p>
            </div>
          )}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">New Rate (vs USD)</label>
            <input type="number" step="0.0001" value={newRate} onChange={(e) => setNewRate(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" required />
          </div>
          <div className="flex justify-end">
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700" disabled={loading}>
              {loading ? 'Updating...' : 'Update Rate'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateRate;