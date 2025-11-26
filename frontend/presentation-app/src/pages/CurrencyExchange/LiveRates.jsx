import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getExchangeRates, getPopularCurrencies } from '../../services/exchangeRateService';

const LiveRates = () => {
  const [baseCurrency, setBaseCurrency] = useState('USD');
  const [rates, setRates] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);
  const popularCurrencies = getPopularCurrencies();

  const loadRates = async (base) => {
    setLoading(true);
    try {
      const data = await getExchangeRates(base);
      setRates(data.conversion_rates);
      setLastUpdate(data.time_last_update_utc);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to load exchange rates');
      console.error(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRates(baseCurrency);
  }, [baseCurrency]);

  const handleRefresh = () => {
    loadRates(baseCurrency);
    toast.info('Refreshing rates...');
  };

  if (loading && !rates) {
    return (
      <div className="p-4 text-center">
        <div className="animate-pulse">Loading exchange rates...</div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-blue-600 dark:text-blue-400">Live Exchange Rates</h1>
        <Link to="/currency-exchange" className="text-blue-600 dark:text-blue-400 hover:underline">
          &larr; Back to Currency Exchange
        </Link>
      </div>

      {/* Base Currency Selector */}
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Base Currency
            </label>
            <select
              value={baseCurrency}
              onChange={(e) => setBaseCurrency(e.target.value)}
              className="w-full md:w-64 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {popularCurrencies.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} - {c.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleRefresh}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
          >
            {loading ? '🔄 Refreshing...' : '🔄 Refresh'}
          </button>
        </div>

        {lastUpdate && (
          <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            Last updated: {new Date(lastUpdate).toLocaleString()}
          </div>
        )}
      </div>

      {/* Exchange Rates Grid */}
      {rates && (
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100">
            1 {baseCurrency} equals:
          </h2>

          {/* Popular Currencies */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {popularCurrencies
              .filter((c) => c.code !== baseCurrency)
              .map((currency) => (
                <div
                  key={currency.code}
                  className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-600 rounded-lg border border-blue-200 dark:border-blue-500"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">
                        {currency.code}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {currency.name}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                        {currency.symbol} {rates[currency.code]?.toFixed(4)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>

          {/* All Rates Table */}
          <details className="mt-6">
            <summary className="cursor-pointer text-blue-600 dark:text-blue-400 font-medium hover:underline mb-4">
              View all exchange rates
            </summary>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Currency Code
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Exchange Rate
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {Object.entries(rates)
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([code, rate]) => (
                      <tr key={code} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                          {code}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500 dark:text-gray-300">
                          {rate.toFixed(6)}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </details>
        </div>
      )}

      {/* Info Footer */}
      <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
        <p>
          Exchange rates provided by{' '}
          <a
            href="https://www.exchangerate-api.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            ExchangeRate-API
          </a>
        </p>
        <p className="mt-1">Rates are updated daily</p>
      </div>
    </div>
  );
};

export default LiveRates;
