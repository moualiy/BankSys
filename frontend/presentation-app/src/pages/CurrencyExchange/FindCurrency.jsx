import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { findCurrency as findCurrencyAPI } from '../../services/exchangeRateService';
import { toast } from 'react-toastify';

const FindCurrency = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('code'); // 'code' or 'country'
  const [currency, setCurrency] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setCurrency(null);
    
    try {
      const result = await findCurrencyAPI(searchQuery, searchType);
      setCurrency(result);
      toast.success('Currency found.');
    } catch (err) {
      setError(err.message);
      toast.error('Currency not found.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold text-blue-600 dark:text-blue-400">Find Currency</h1>
        <Link to="/currency-exchange" className="text-blue-600 dark:text-blue-400 hover:underline">
          &larr; Back to Currency Exchange
        </Link>
      </div>
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-md p-6 mb-6">
        <form onSubmit={handleSearch}>
          <div className="flex items-center mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mr-2">Search by:</label>
            <select value={searchType} onChange={(e) => setSearchType(e.target.value)} className="mt-1 block px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
              <option value="code">Code</option>
              <option value="country">Country</option>
            </select>
          </div>
          <div className="flex items-center">
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder={`Enter ${searchType}`} className="flex-grow px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-l-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" required />
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-r-md hover:bg-blue-700" disabled={loading}>
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </form>
      </div>
      {loading && <div className="p-4">Loading...</div>}
      {error && <div className="p-4 text-red-500">Currency not found</div>}
      {currency && (
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-md p-6">
          <h2 className="text-2xl font-bold mb-4">Currency Details</h2>
          <p><strong>Country:</strong> {currency.country}</p>
          <p><strong>Code:</strong> {currency.code}</p>
          <p><strong>Name:</strong> {currency.name}</p>
          <p><strong>Rate (vs USD):</strong> {currency.rate}</p>
        </div>
      )}
    </div>
  );
};

export default FindCurrency;