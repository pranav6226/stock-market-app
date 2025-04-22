import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Watchlist = ({ API_URLS, onSelectStock }) => {
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [newSymbol, setNewSymbol] = useState('');
  const [apiUrlIndex, setApiUrlIndex] = useState(0);
  const [dataLoaded, setDataLoaded] = useState(false);

  // Fetch watchlist data from API
  useEffect(() => {
    // Skip if data is already loaded
    if (dataLoaded && watchlist.length > 0) {
      return;
    }
    
    // For now, we'll use localStorage to simulate a backend server
    // In the final implementation, this would be replaced with DynamoDB through API Gateway
    const loadWatchlist = () => {
      const savedWatchlist = localStorage.getItem('stockWatchlist');
      
      if (savedWatchlist) {
        try {
          const parsedWatchlist = JSON.parse(savedWatchlist);
          // Only load symbols, we'll fetch the latest data
          const symbols = parsedWatchlist.map(item => item.symbol);
          fetchWatchlistData(symbols);
        } catch (e) {
          console.error('Error loading watchlist from localStorage:', e);
          // Start with default watchlist if there's an error
          fetchWatchlistData(['AAPL', 'MSFT', 'GOOG']);
        }
      } else {
        // Start with default watchlist if none exists
        fetchWatchlistData(['AAPL', 'MSFT', 'GOOG']);
      }
    };
    
    loadWatchlist();
  }, [dataLoaded, watchlist.length, API_URLS]);

  // Fetch data for all watchlist symbols
  const fetchWatchlistData = async (symbols) => {
    if (!symbols || symbols.length === 0) return;
    
    setLoading(true);
    const watchlistData = [];
    
    for (const symbol of symbols) {
      try {
        // Try each API URL until one works
        for (let i = 0; i < API_URLS.length; i++) {
          try {
            const response = await axios.get(
              `${API_URLS[i]}?symbol=${symbol}`,
              { timeout: 3000 } // Short timeout since we're fetching multiple stocks
            );
            
            if (response.data && !response.data.error) {
              setApiUrlIndex(i);
              
              watchlistData.push({
                symbol: response.data['01. symbol'],
                price: parseFloat(response.data['05. price']),
                change: parseFloat(response.data['09. change']),
                changePercent: response.data['10. change percent'],
                volume: parseInt(response.data['06. volume'])
              });
              
              break; // Exit the loop if successful
            }
          } catch (err) {
            if (i === API_URLS.length - 1) {
              console.error(`Failed to fetch data for ${symbol}`);
              // Add with minimal data if API fails
              watchlistData.push({
                symbol: symbol,
                price: 0,
                change: 0,
                changePercent: '0.00%',
                volume: 0,
                error: true
              });
            }
          }
        }
      } catch (err) {
        console.error(`Error fetching data for ${symbol}:`, err);
      }
    }
    
    setWatchlist(watchlistData);
    setLoading(false);
    setDataLoaded(true);
    
    // Save to localStorage (would be DynamoDB in AWS implementation)
    localStorage.setItem('stockWatchlist', JSON.stringify(watchlistData));
  };

  // Add a new symbol to watchlist
  const handleAddToWatchlist = async () => {
    if (!newSymbol) return;
    
    const symbol = newSymbol.toUpperCase();
    
    // Check if already in watchlist
    if (watchlist.some(item => item.symbol === symbol)) {
      setNewSymbol('');
      return;
    }
    
    setLoading(true);
    setDataLoaded(false); // Reset data loaded flag
    
    try {
      // Try each API URL to validate the symbol
      for (let i = 0; i < API_URLS.length; i++) {
        try {
          const response = await axios.get(
            `${API_URLS[i]}?symbol=${symbol}`,
            { timeout: 5000 }
          );
          
          if (response.data && !response.data.error) {
            const newItem = {
              symbol: response.data['01. symbol'],
              price: parseFloat(response.data['05. price']),
              change: parseFloat(response.data['09. change']),
              changePercent: response.data['10. change percent'],
              volume: parseInt(response.data['06. volume'])
            };
            
            const updatedWatchlist = [...watchlist, newItem];
            setWatchlist(updatedWatchlist);
            localStorage.setItem('stockWatchlist', JSON.stringify(updatedWatchlist));
            
            setNewSymbol('');
            setLoading(false);
            setDataLoaded(true); // Mark data as loaded
            return;
          }
        } catch (err) {
          if (i === API_URLS.length - 1) {
            setError(`Could not find symbol: ${symbol}`);
            setTimeout(() => setError(null), 3000);
          }
        }
      }
    } catch (err) {
      setError('Error adding to watchlist');
      setTimeout(() => setError(null), 3000);
    }
    
    setLoading(false);
    setNewSymbol('');
  };

  // Remove a symbol from watchlist
  const handleRemoveFromWatchlist = (symbol) => {
    const updatedWatchlist = watchlist.filter(item => item.symbol !== symbol);
    setWatchlist(updatedWatchlist);
    localStorage.setItem('stockWatchlist', JSON.stringify(updatedWatchlist));
  };

  // Handle stock selection
  const handleSelectStock = (symbol) => {
    if (onSelectStock) {
      onSelectStock(symbol);
    }
  };

  // Refresh watchlist data
  const handleRefreshWatchlist = () => {
    const symbols = watchlist.map(item => item.symbol);
    setDataLoaded(false); // Reset data loaded flag for refresh
    fetchWatchlistData(symbols);
  };

  return (
    <div className="card">
      <div className="watchlist-header">
        <h2>Watchlist</h2>
        <button onClick={handleRefreshWatchlist} disabled={loading}>
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>
      
      <div className="input-group">
        <input
          type="text"
          value={newSymbol}
          onChange={(e) => setNewSymbol(e.target.value)}
          placeholder="Add symbol (e.g., AAPL)"
          maxLength={5}
        />
        <button onClick={handleAddToWatchlist} disabled={loading || !newSymbol}>
          Add
        </button>
      </div>
      
      {error && <p className="error">{error}</p>}
      
      {watchlist.length === 0 ? (
        <p className="empty-watchlist">Your watchlist is empty. Add stocks to track them here.</p>
      ) : (
        <table className="watchlist-table">
          <thead>
            <tr>
              <th>Symbol</th>
              <th>Price</th>
              <th>Change</th>
              <th>Volume</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {watchlist.map((stock) => (
              <tr key={stock.symbol} className="watchlist-item">
                <td>
                  <strong onClick={() => handleSelectStock(stock.symbol)}>
                    {stock.symbol}
                  </strong>
                </td>
                <td>${stock.price.toFixed(2)}</td>
                <td className={stock.change >= 0 ? 'price-up' : 'price-down'}>
                  {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)} ({stock.changePercent})
                </td>
                <td>{stock.volume.toLocaleString()}</td>
                <td>
                  <div className="watchlist-actions">
                    <button 
                      className="view-btn" 
                      onClick={() => handleSelectStock(stock.symbol)}
                    >
                      View
                    </button>
                    <button 
                      className="remove-btn" 
                      onClick={() => handleRemoveFromWatchlist(stock.symbol)}
                    >
                      Remove
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      
      <div className="disclaimer">
        <small>
          Data will be stored in AWS DynamoDB in the production deployment.
        </small>
      </div>
    </div>
  );
};

export default Watchlist; 