import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { convertCurrency, getSupportedCurrencies, getPopularCurrencies, formatCurrency } from '../../services/exchangeRateService';

const Converter = () => {
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('EUR');
  const [amount, setAmount] = useState('100');
  const [conversionResult, setConversionResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currencies, setCurrencies] = useState([]);
  const [currenciesLoading, setCurrenciesLoading] = useState(true);
  const [showAllCurrencies, setShowAllCurrencies] = useState(false);

  useEffect(() => {
    const loadCurrencies = async () => {
      try {
        const allCurrencies = await getSupportedCurrencies();
        setCurrencies(allCurrencies);
        setCurrenciesLoading(false);
      } catch (error) {
        toast.error('Failed to load currencies');
        console.error(error);
        setCurrenciesLoading(false);
      }
    };
    loadCurrencies();
  }, []);

  const handleConvert = async (e) => {
    e.preventDefault();
    if (!fromCurrency || !toCurrency || !amount) {
      toast.error('Please fill in all fields.');
      return;
    }

    if (parseFloat(amount) <= 0) {
      toast.error('Amount must be greater than 0.');
      return;
    }

    setLoading(true);
    try {
      const result = await convertCurrency(fromCurrency, toCurrency, parseFloat(amount));
      setConversionResult(result);
      toast.success('Conversion successful!');
    } catch (error) {
      toast.error('Conversion failed. Please try again.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSwapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
    setConversionResult(null);
  };

  const popularCurrencies = getPopularCurrencies();
  const displayCurrencies = showAllCurrencies ? currencies : popularCurrencies;

  if (currenciesLoading) return <div className="p-4">Loading currencies...</div>;

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-blue-600 dark:text-blue-400">Currency Converter</h1>
        <Link to="/currency-exchange" className="text-blue-600 dark:text-blue-400 hover:underline">
          &larr; Back to Currency Exchange
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 md:p-8">
        <form onSubmit={handleConvert} className="space-y-6">
          {/* Amount Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Amount
            </label>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-4 py-3 text-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* From Currency */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              From Currency
            </label>
            <select
              value={fromCurrency}
              onChange={(e) => setFromCurrency(e.target.value)}
              className="w-full px-4 py-3 text-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              {displayCurrencies.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} - {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Swap Button */}
          <div className="flex justify-center">
            <button
              type="button"
              onClick={handleSwapCurrencies}
              className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-6 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center gap-2"
            >
              <span>⇅</span> Swap
            </button>
          </div>

          {/* To Currency */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              To Currency
            </label>
            <select
              value={toCurrency}
              onChange={(e) => setToCurrency(e.target.value)}
              className="w-full px-4 py-3 text-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              {displayCurrencies.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} - {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Show All Currencies Toggle */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="showAll"
              checked={showAllCurrencies}
              onChange={(e) => setShowAllCurrencies(e.target.checked)}
              className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="showAll" className="text-sm text-gray-700 dark:text-gray-300">
              Show all currencies ({currencies.length} available)
            </label>
          </div>

          {/* Convert Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium text-lg"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin">⏳</span> Converting...
                </span>
              ) : (
                'Convert'
              )}
            </button>
          </div>
        </form>

        {/* Conversion Result */}
        {conversionResult && (
          <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-600 rounded-lg border-2 border-blue-200 dark:border-blue-500">
            <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100">
              Conversion Result
            </h2>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-300">From:</span>
                <span className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                  {formatCurrency(conversionResult.amount, conversionResult.fromCurrency)}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-300">To:</span>
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {formatCurrency(conversionResult.convertedAmount, conversionResult.toCurrency)}
                </span>
              </div>
              
              <div className="border-t border-gray-300 dark:border-gray-500 pt-3 mt-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600 dark:text-gray-300">Exchange Rate:</span>
                  <span className="font-medium text-gray-800 dark:text-gray-100">
                    1 {conversionResult.fromCurrency} = {conversionResult.rate.toFixed(6)} {conversionResult.toCurrency}
                  </span>
                </div>
                
                <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 mt-2">
                  <span>Last Updated:</span>
                  <span>{new Date(conversionResult.lastUpdate).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

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

export default Converter;