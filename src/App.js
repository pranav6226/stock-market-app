import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './App.css';
import StockList from './components/StockList';
import StockChart from './components/StockChart';
import SearchBar from './components/SearchBar';
import TechnicalAnalysis from './components/TechnicalAnalysis';
import MarketNews from './components/MarketNews';
import StockComparison from './components/StockComparison';
import Watchlist from './components/Watchlist';
import LandingPage from './components/LandingPage';

// Dashboard component
function Dashboard({ API_URLS, onStockDataChange }) {
  const [stockData, setStockData] = useState({});
  const [searchQuery, setSearchQuery] = useState('AAPL');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [apiUrlIndex, setApiUrlIndex] = useState(0);
  const [dataLoaded, setDataLoaded] = useState(false);
  const navigate = useNavigate();
  
  // Read query parameters for symbol
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const symbol = params.get('symbol');
    if (symbol) {
      setSearchQuery(symbol);
      setDataLoaded(false); // Reset data loaded flag when symbol changes
    }
  }, []);

  // Custom setStockData function that also notifies parent
  const updateStockData = useCallback((data) => {
    setStockData(data);
    if (onStockDataChange) {
      onStockDataChange(data);
    }
    setDataLoaded(true); // Mark data as loaded after successful fetch
  }, [onStockDataChange]); // Dependency: onStockDataChange

  useEffect(() => {
    // Prevent fetching if data is already loaded (unless search query changes)
    if (dataLoaded && searchQuery === stockData['01. symbol']) {
      return;
    }
    
    const fetchStockData = async () => {
      if (!searchQuery) return;
      
      setLoading(true);
      setError(null);
      
      // Try each API URL until one works
      for (let i = 0; i < API_URLS.length; i++) {
        try {
          console.log(`Trying API URL: ${API_URLS[i]}`);
          const response = await axios.get(
            `${API_URLS[i]}?symbol=${searchQuery}`,
            { timeout: 5000 } // Add timeout to fail faster if an endpoint is unreachable
          );
          
          console.log('Response data:', response.data);
          
          if (response.data && !response.data.error) {
            updateStockData(response.data);
            setApiUrlIndex(i); // Remember which URL worked
            setLoading(false);
            return; // Exit the loop if successful
          } else {
            setError(response.data.error || 'No data found for this stock symbol');
          }
        } catch (err) {
          console.error(`Error with URL ${API_URLS[i]}:`, err);
          // Only set the error from the last attempt
          if (i === API_URLS.length - 1) {
            setError('Error fetching stock data. Please try again.');
          }
          // Continue to try the next URL
        }
      }
      
      setLoading(false);
    };

    fetchStockData();
  }, [searchQuery, API_URLS, onStockDataChange, dataLoaded, stockData, updateStockData]);

  const handleSearch = (query) => {
    setSearchQuery(query);
    setDataLoaded(false); // Reset data loaded flag when manually searching
  };

  const handleCompareStocks = () => {
    navigate('/compare');
  };

  return (
    <div className="dashboard">
      <header className="App-header">
        <h1>Stock Market Dashboard</h1>
        <p className="api-info">Data source: {API_URLS[apiUrlIndex]}</p>
        <div className="navigation-links">
          <Link to="/">Home</Link>
          <Link to="/compare">Compare Stocks</Link>
          <Link to="/watchlist">Watchlist</Link>
        </div>
      </header>

      <div className="dashboard-layout">
        <div className="dashboard-sidebar">
          <SearchBar onSearch={handleSearch} />
          
          {loading && <p className="loading">Loading stock data...</p>}
          {error && <p className="error">{error}</p>}
          
          {!loading && !error && Object.keys(stockData).length > 0 && (
            <>
              <StockList stockData={stockData} />
              <TechnicalAnalysis stockData={stockData} />
              <button onClick={handleCompareStocks} className="compare-button">
                Compare with Other Stocks
              </button>
            </>
          )}
        </div>
        
        <div className="dashboard-main">
          {!loading && !error && Object.keys(stockData).length > 0 && (
            <>
              <StockChart stockData={stockData} />
              <MarketNews stockData={stockData} />
            </>
          )}
        </div>
      </div>
      
      <footer className="App-footer">
        <p>
          <small>Data provided by Yahoo Finance API via yfinance. 
          This dashboard is for educational purposes only.</small>
        </p>
      </footer>
    </div>
  );
}

// Import the LoginForm component for user authentication
import LoginForm from './components/LoginForm';

// Main application component handles routing and global state
function App() {
  const [stockData, setStockData] = useState({});
  
  // Define the API URL based on environment variable or fallback to localhost
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';
  
  // Maintain the array structure if needed, or simplify if only one URL is used now
  const API_URLS = [
    `${API_BASE_URL}/api/stock` // Assuming the backend route is /api/stock
  ];
  
  // Handler for when a stock is selected in watchlist or comparison view
  const handleSelectStock = (symbol) => {
    // Navigate to dashboard and set the symbol to search for
    window.location.href = `/dashboard?symbol=${symbol}`;
  };
  
  // Handler for entering the dashboard from landing page
  const handleEnterApp = () => {
    window.location.href = '/dashboard';
  };

  return (
    <Router>
      <div className="App">
        {/* Render the login form component */}
        <LoginForm />
        <Routes>
          <Route path="/" element={<LandingPage onEnterApp={handleEnterApp} />} />
          <Route path="/dashboard" element={<Dashboard API_URLS={API_URLS} onStockDataChange={setStockData} />} />
          <Route 
            path="/compare" 
            element={<StockComparison primaryStock={stockData} API_URLS={API_URLS} />} 
          />
          <Route 
            path="/watchlist" 
            element={<Watchlist API_URLS={API_URLS} onSelectStock={handleSelectStock} />} 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App; 