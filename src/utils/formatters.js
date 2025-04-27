/**
 * Format large numbers into a more readable format with suffixes (K, M, B, T)
 * @param {number} num - The number to format
 * @returns {string} The formatted number with appropriate suffix
 */
export const formatLargeNumber = (num) => {
  if (!num) return 'N/A';
  
  num = Number(num);
  
  // Billions
  if (num >= 1000000000) {
    return `${(num / 1000000000).toFixed(2)}B`;
  }
  // Millions
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(2)}M`;
  }
  // Thousands
  if (num >= 1000) {
    return `${(num / 1000).toFixed(2)}K`;
  }
  
  return num.toLocaleString();
};

/**
 * Format currency values with proper symbol and separators
 * @param {number} value - The currency value to format
 * @param {string} currency - Currency code (default: USD)
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (value, currency = 'USD') => {
  if (!value && value !== 0) return 'N/A';
  
  const currencySymbols = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
    // Add more as needed
  };
  
  const symbol = currencySymbols[currency] || currency;
  
  return `${symbol}${Number(value).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

/**
 * Format percentage values
 * @param {number} value - The value to format as percentage
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted percentage string
 */
export const formatPercentage = (value, decimals = 2) => {
  if (!value && value !== 0) return 'N/A';
  return `${Number(value).toFixed(decimals)}%`;
}; 