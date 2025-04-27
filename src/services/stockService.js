import axios from 'axios';

// Define the API base URL from environment variable or fallback to localhost
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

// Fetch stock data by symbol
export const fetchStockData = async (symbol) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/api/stock?symbol=${symbol}`
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching stock data:', error);
    throw error;
  }
};

// Fetch stock quote (alias for fetchStockData for compatibility)
export const fetchStockQuote = async (symbol) => {
  return fetchStockData(symbol);
};

// Fetch company overview information
export const fetchCompanyOverview = async (symbol) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/api/company?symbol=${symbol}`
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching company overview:', error);
    throw error;
  }
};

// Fetch historical data
export const fetchHistoricalData = async (symbol, period = '1mo', interval = '1d') => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/api/stock/history?symbol=${symbol}&period=${period}&interval=${interval}`
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching historical data:', error);
    throw error;
  }
}; 