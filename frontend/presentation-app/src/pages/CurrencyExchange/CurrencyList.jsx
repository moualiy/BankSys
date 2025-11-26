import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getSupportedCurrencies, getExchangeRates } from '../../services/exchangeRateService';
import { toast } from 'react-toastify';

const CurrencyList = () => {
  const [currencies, setCurrencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadCurrencies = async () => {
      try {
        setLoading(true);
        // Get supported currencies list
        const currencyList = await getSupportedCurrencies();
        
        // Get exchange rates (USD as base)
        const exchangeData = await getExchangeRates('USD');
        const rates = exchangeData.conversion_rates || {};
        
        // Transform to match table format with actual rates
        const formatted = currencyList.map((c, idx) => ({
          id: idx + 1,
          code: c.code,
          name: c.name,
          country: c.code, // Use code as country placeholder
          rate: rates[c.code] || 1.0
        }));
        setCurrencies(formatted);
        setError(null);
      } catch (err) {
        console.error('Failed to load currencies:', err);
        toast.error('Failed to load currencies');
        setError('Failed to load currencies');
      } finally {
        setLoading(false);
      }
    };
    loadCurrencies();
  }, []);

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) {
    toast.error('Failed to fetch currencies.');
    return <div className="p-4 text-red-500">Error: Failed to fetch currencies.</div>;
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold text-blue-600 dark:text-blue-400">Currencies List</h1>
        <Link to="/currency-exchange" className="text-blue-600 dark:text-blue-400 hover:underline">
          &larr; Back to Currency Exchange
        </Link>
      </div>
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-md overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Country</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Code</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Rate (vs USD)</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {currencies && currencies.map((currency) => (
              <tr key={currency.code}>
                <td className="px-6 py-4 whitespace-nowrap">{currency.country}</td>
                <td className="px-6 py-4 whitespace-nowrap">{currency.code}</td>
                <td className="px-6 py-4 whitespace-nowrap">{currency.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{currency.rate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CurrencyList;