/**
 * Exchange Rate API Service
 * Uses ExchangeRate-API to fetch live currency conversion rates
 */

const API_KEY = '9b17a9c2a2e7fa0c7f7d6b43';
const BASE_URL = 'https://v6.exchangerate-api.com/v6';

/**
 * Fetch the latest exchange rates for a base currency
 * @param {string} baseCurrency - The base currency code (e.g., 'USD')
 * @returns {Promise<Object>} Exchange rates data
 */
export const getExchangeRates = async (baseCurrency = 'USD') => {
  try {
    const response = await fetch(`${BASE_URL}/${API_KEY}/latest/${baseCurrency}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.result !== 'success') {
      throw new Error(data['error-type'] || 'Failed to fetch exchange rates');
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching exchange rates:', error);
    throw error;
  }
};

/**
 * Convert an amount from one currency to another
 * @param {string} fromCurrency - Source currency code
 * @param {string} toCurrency - Target currency code
 * @param {number} amount - Amount to convert
 * @returns {Promise<Object>} Conversion result
 */
export const convertCurrency = async (fromCurrency, toCurrency, amount) => {
  try {
    const data = await getExchangeRates(fromCurrency);
    
    if (!data.conversion_rates || !data.conversion_rates[toCurrency]) {
      throw new Error(`Currency ${toCurrency} not found in conversion rates`);
    }
    
    const rate = data.conversion_rates[toCurrency];
    const convertedAmount = amount * rate;
    
    return {
      fromCurrency,
      toCurrency,
      amount,
      rate,
      convertedAmount,
      lastUpdate: data.time_last_update_utc,
      nextUpdate: data.time_next_update_utc
    };
  } catch (error) {
    console.error('Error converting currency:', error);
    throw error;
  }
};

/**
 * Get a list of all supported currencies with their codes
 * @returns {Promise<Array>} Array of currency objects
 */
export const getSupportedCurrencies = async () => {
  try {
    const response = await fetch(`${BASE_URL}/${API_KEY}/codes`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.result !== 'success') {
      throw new Error(data['error-type'] || 'Failed to fetch currency codes');
    }
    
    // Transform the codes array into objects with code and name
    return data.supported_codes.map(([code, name]) => ({
      code,
      name
    }));
  } catch (error) {
    console.error('Error fetching supported currencies:', error);
    throw error;
  }
};

/**
 * Get popular currencies for quick access
 * @returns {Array} Array of popular currency objects
 */
export const getPopularCurrencies = () => {
  return [
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
    { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
    { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
    { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
    { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
    { code: 'BRL', name: 'Brazilian Real', symbol: 'R$' },
  ];
};

/**
 * Find a currency by code or name
 * @param {string} query - Search query (currency code or name)
 * @param {string} searchType - Search type: 'code' or 'country'
 * @returns {Promise<Object>} Currency object with code, name, and current rate
 */
export const findCurrency = async (query, searchType = 'code') => {
  try {
    // Get all supported currencies
    const currencies = await getSupportedCurrencies();
    
    // Search for the currency
    let foundCurrency = null;
    
    if (searchType === 'code') {
      foundCurrency = currencies.find(c => c.code.toUpperCase() === query.toUpperCase());
    } else if (searchType === 'country') {
      foundCurrency = currencies.find(c => c.name.toUpperCase().includes(query.toUpperCase()));
    }
    
    if (!foundCurrency) {
      throw new Error(`Currency not found for ${searchType}: ${query}`);
    }
    
    // Get the exchange rate for this currency
    const rateData = await getExchangeRates('USD');
    const rate = rateData.conversion_rates[foundCurrency.code] || 1.0;
    
    return {
      code: foundCurrency.code,
      name: foundCurrency.name,
      country: foundCurrency.name,
      rate: rate
    };
  } catch (error) {
    console.error('Error finding currency:', error);
    throw error;
  }
};

/**
 * Format currency amount with proper decimals and separators
 * @param {number} amount - Amount to format
 * @param {string} currencyCode - Currency code
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currencyCode) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};
