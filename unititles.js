import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import './App.css';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

function App() {
  const [stockData, setStockData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [ticker, setTicker] = useState('AAPL');
  const [watchlist, setWatchlist] = useState([]);
  const [period, setPeriod] = useState('1mo'); // Default period: 1 month

  // API endpoint (would be replaced with actual API Gateway URL)
  const API_URL = 'https://your-api-gateway-url.amazonaws.com/dev';

  useEffect(() => {
    fetchStockData(ticker);
  }, [ticker, period]);

  const fetchStockData = async (symbol) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`${API_URL}/stock`, {
        params: {
          symbol: symbol,
          period: period
        }
      });
      
      setStockData(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch stock data. Please try again.');
      setLoading(false);
      console.error('Error fetching stock data:', err);
    }
  };

  const addToWatchlist = async () => {
    if (watchlist.includes(ticker)) {
      return; // Already in watchlist
    }
    
    try {
      await axios.post(`${API_URL}/watchlist`, {
        ticker: ticker
      });
      
      setWatchlist([...watchlist, ticker]);
    } catch (err) {
      console.error('Error adding to watchlist:', err);
    }
  };

  const getWatchlist = async () => {
    try {
      const response = await axios.get(`${API_URL}/watchlist`);
      setWatchlist(response.data.tickers || []);
    } catch (err) {
      console.error('Error fetching watchlist:', err);
    }
  };

  useEffect(() => {
    getWatchlist();
  }, []);

  const renderChart = () => {
    if (loading) return <div className="loading">Loading...</div>;
    if (error) return <div className="error">{error}</div>;
    if (!stockData.dates || !stockData.prices) return <div>No data available</div>;

    const chartData = {
      labels: stockData.dates,
      datasets: [
        {
          label: ticker,
          data: stockData.prices,
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1
        }
      ]
    };

    const options = {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: `${ticker} Stock Price`
        }
      }
    };

    return <Line data={chartData} options={options} />;
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Stock Dashboard</h1>
      </header>
      
      <div className="search-container">
        <input
          type="text"
          value={ticker}
          onChange={(e) => setTicker(e.target.value.toUpperCase())}
          placeholder="Enter stock ticker (e.g., AAPL)"
        />
        <button onClick={() => fetchStockData(ticker)}>Search</button>
        <button onClick={addToWatchlist}>Add to Watchlist</button>
        
        <div className="period-selector">
          <select value={period} onChange={(e) => setPeriod(e.target.value)}>
            <option value="1d">1 Day</option>
            <option value="5d">5 Days</option>
            <option value="1mo">1 Month</option>
            <option value="3mo">3 Months</option>
            <option value="6mo">6 Months</option>
            <option value="1y">1 Year</option>
            <option value="5y">5 Years</option>
          </select>
        </div>
      </div>
      
      <div className="chart-container">
        {renderChart()}
      </div>
      
      <div className="watchlist-container">
        <h2>Watchlist</h2>
        {watchlist.length === 0 ? (
          <p>Your watchlist is empty</p>
        ) : (
          <ul>
            {watchlist.map((stock) => (
              <li key={stock} onClick={() => setTicker(stock)}>
                {stock}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default App;
