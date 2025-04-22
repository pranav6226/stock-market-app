import React, { useState, useEffect, useCallback } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, ComposedChart, Bar
} from 'recharts';
import axios from 'axios';

const StockComparison = ({ primaryStock = {}, API_URLS = [] }) => {
  const [comparisonSymbols, setComparisonSymbols] = useState(['MSFT', 'GOOG']);
  const [comparisonData, setComparisonData] = useState({});
  const [loading, setLoading] = useState(false);
  const [showInput, setShowInput] = useState(false);
  const [newSymbol, setNewSymbol] = useState('');
  const [chartType, setChartType] = useState('price');
  const [dataLoaded, setDataLoaded] = useState(false);

  // Colors for different stocks
  const COLORS = [
    '#4CAF50', // Primary stock (green)
    '#2196F3', // Microsoft (blue)
    '#FF5722', // Google (orange)
    '#9C27B0', // Purple
    '#FFEB3B', // Yellow
    '#607D8B'  // Blue Grey
  ];

  // Generate mock historical data for visualization
  const generateMockHistoricalData = useCallback((currentPrice) => {
    const data = [];
    
    // For expensive stocks, use smaller volatility to avoid unrealistic swings
    const volatility = currentPrice > 1000 ? 0.005 : 
                       currentPrice > 500 ? 0.008 : 
                       currentPrice > 100 ? 0.01 : 0.015;
    
    // Start with a price that's slightly lower than current for an uptrend
    const startingPriceRatio = 0.94 + (Math.random() * 0.04); // Between 94% and 98% of current price
    let price = currentPrice * startingPriceRatio;
    
    const today = new Date();
    
    // Create a generally upward trend with realistic daily movements
    for (let i = 30; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const formattedDate = `${date.getMonth() + 1}/${date.getDate()}`;
      
      // Add slight upward bias (markets trend up over time)
      // Higher probability of small positive moves, with occasional bigger moves in either direction
      const changeDirection = Math.random();
      let change;
      
      if (changeDirection > 0.57) {  // 43% chance of decrease
        change = -price * volatility * Math.random();  // Negative change
      } else if (changeDirection > 0.2) {  // 37% chance of small increase
        change = price * volatility * 0.5 * Math.random();  // Small positive change
      } else {  // 20% chance of larger increase
        change = price * volatility * Math.random();  // Larger positive change
      }
      
      price += change;
      
      // Ensure price doesn't go negative or too far from reality
      if (price <= 0 || price > currentPrice * 1.5) {
        price = currentPrice * (0.85 + Math.random() * 0.25); // Reset to a reasonable value
      }
      
      data.push({
        date: formattedDate,
        price: parseFloat(price.toFixed(2))
      });
    }
    
    // Ensure the last data point is close to the current price
    // This makes the chart consistent with the displayed current price
    data[data.length - 1].price = parseFloat((currentPrice * (0.995 + Math.random() * 0.01)).toFixed(2));
    
    return data;
  }, []);

  // Helper function to fetch stock data
  const fetchStockData = useCallback(async (symbol, dataObject) => {
    try {
      // Try each API URL until one works
      for (let i = 0; i < API_URLS.length; i++) {
        try {
          const response = await axios.get(
            `${API_URLS[i]}?symbol=${symbol}`,
            { timeout: 5000 }
          );
          
          if (response.data && !response.data.error) {
            dataObject[symbol] = {
              price: parseFloat(response.data['05. price']),
              change: parseFloat(response.data['09. change']),
              percentChange: parseFloat(response.data['10. change percent'].replace('%', '')),
              historicalData: generateMockHistoricalData(parseFloat(response.data['05. price']))
            };
            
            break; // Exit the loop if successful
          }
        } catch (err) {
          if (i === API_URLS.length - 1) {
            console.error(`Failed to fetch data for ${symbol}`);
            // Create mock data if API fails
            dataObject[symbol] = {
              price: Math.random() * 200 + 50,
              change: (Math.random() * 10) - 5,
              percentChange: (Math.random() * 5) - 2.5,
              historicalData: generateMockHistoricalData(Math.random() * 200 + 50)
            };
          }
        }
      }
    } catch (err) {
      console.error(`Error fetching data for ${symbol}:`, err);
    }
  }, [API_URLS, generateMockHistoricalData]);

  // Fetch data for comparison stocks
  useEffect(() => {
    // If we don't have API_URLS, can't proceed
    if (!API_URLS || API_URLS.length === 0) {
      console.error("API URLs not available");
      return;
    }
    
    // Prevent re-fetching if data is already loaded
    if (dataLoaded && Object.keys(comparisonData).length > 0) {
      return;
    }
    
    const fetchComparisonData = async () => {
      // Use a default primary symbol if none provided
      const primarySymbol = primaryStock && primaryStock['01. symbol'] 
        ? primaryStock['01. symbol'] 
        : 'AAPL';
      
      setLoading(true);
      const newData = {};
      
      // Add primary stock data if available, otherwise fetch it
      if (primaryStock && primaryStock['01. symbol']) {
        newData[primaryStock['01. symbol']] = {
          price: parseFloat(primaryStock['05. price']),
          change: parseFloat(primaryStock['09. change']),
          percentChange: parseFloat(primaryStock['10. change percent'].replace('%', '')),
          historicalData: generateMockHistoricalData(parseFloat(primaryStock['05. price']))
        };
      } else {
        // Fetch primary stock data if not provided
        try {
          const symbol = 'AAPL'; // Default
          await fetchStockData(symbol, newData);
        } catch (err) {
          console.error(`Error fetching data for default stock:`, err);
        }
      }
      
      // Fetch data for each comparison symbol
      for (const symbol of comparisonSymbols) {
        if (symbol === primarySymbol) continue;
        
        await fetchStockData(symbol, newData);
      }
      
      setComparisonData(newData);
      setLoading(false);
      setDataLoaded(true); // Mark data as loaded after successful fetch
    };
    
    fetchComparisonData();
  }, [primaryStock, comparisonSymbols, API_URLS, dataLoaded, fetchStockData, generateMockHistoricalData, comparisonData]);

  // Merge historical data for comparison chart
  const prepareComparisonChartData = () => {
    if (Object.keys(comparisonData).length === 0) return [];
    
    // Get all dates from the first stock (any stock)
    const firstSymbol = Object.keys(comparisonData)[0];
    if (!comparisonData[firstSymbol]?.historicalData) return [];
    
    const mergedData = {};
    
    // Process each stock's data
    Object.keys(comparisonData).forEach(symbol => {
      if (!comparisonData[symbol]?.historicalData) return;
      
      comparisonData[symbol].historicalData.forEach(dataPoint => {
        if (!mergedData[dataPoint.date]) {
          mergedData[dataPoint.date] = { date: dataPoint.date };
        }
        mergedData[dataPoint.date][symbol] = dataPoint.price;
      });
    });
    
    // Convert to array and sort by date
    return Object.values(mergedData).sort((a, b) => {
      const dateA = new Date(a.date.split('/')[0], a.date.split('/')[1]);
      const dateB = new Date(b.date.split('/')[0], b.date.split('/')[1]);
      return dateA - dateB;
    });
  };

  // Add a new stock to compare
  const handleAddSymbol = () => {
    if (!newSymbol || comparisonSymbols.includes(newSymbol)) {
      setShowInput(false);
      setNewSymbol('');
      return;
    }
    
    setComparisonSymbols([...comparisonSymbols, newSymbol.toUpperCase()]);
    setDataLoaded(false); // Reset dataLoaded state to force refresh with new symbol
    setShowInput(false);
    setNewSymbol('');
  };

  // Remove a stock from comparison
  const handleRemoveSymbol = (symbol) => {
    setComparisonSymbols(comparisonSymbols.filter(s => s !== symbol));
    setDataLoaded(false); // Reset dataLoaded state to force refresh without this symbol
  };

  // Prepare performance comparison data
  const preparePerformanceData = () => {
    const performanceData = [];
    
    Object.keys(comparisonData).forEach((symbol, index) => {
      if (comparisonData[symbol]) {
        performanceData.push({
          name: symbol,
          value: comparisonData[symbol].percentChange,
          color: COLORS[index % COLORS.length],
          price: comparisonData[symbol].price
        });
      }
    });
    
    return performanceData;
  };

  const comparisonChartData = prepareComparisonChartData();
  const performanceData = preparePerformanceData();

  // Render price comparison chart
  const renderPriceChart = () => (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart
        data={comparisonChartData}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis 
          tickFormatter={(value) => {
            // Format large numbers with K/M suffixes
            if (value >= 1000 && value < 1000000) {
              return `$${(value / 1000).toFixed(1)}K`;
            } else if (value >= 1000000) {
              return `$${(value / 1000000).toFixed(1)}M`;
            }
            return `$${value.toFixed(2)}`;
          }}
        />
        <Tooltip 
          formatter={(value) => {
            // Format the value with commas for thousands
            return [`$${parseFloat(value).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}`, ''];
          }}
          labelFormatter={(label) => `Date: ${label}`}
        />
        <Legend />
        {Object.keys(comparisonData).map((symbol, index) => (
          <Line
            key={symbol}
            type="monotone"
            dataKey={symbol}
            stroke={COLORS[index % COLORS.length]}
            activeDot={{ r: 8 }}
            name={symbol}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );

  // Render performance comparison chart
  const renderPerformanceChart = () => (
    <ResponsiveContainer width="100%" height={350}>
      <ComposedChart
        layout="vertical"
        data={performanceData}
        margin={{ top: 20, right: 30, left: 70, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          type="number" 
          tickFormatter={(value) => `${value.toFixed(2)}%`} 
        />
        <YAxis 
          dataKey="name" 
          type="category" 
          width={60} 
        />
        <Tooltip 
          formatter={(value, name, props) => {
            if (name === 'value') return [`${value.toFixed(2)}%`, 'Change'];
            return [value, name];
          }}
          labelFormatter={(value) => `${value}`}
        />
        <Bar 
          dataKey="value" 
          fill="#8884d8" 
          barSize={20}
        >
          {performanceData.map((entry, index) => (
            <Bar key={`cell-${index}`} fill={entry.color} />
          ))}
        </Bar>
      </ComposedChart>
    </ResponsiveContainer>
  );

  return (
    <div className="card stock-comparison">
      <div className="comparison-header">
        <h2>Stock Comparison</h2>
        <div className="chart-type-selector">
          <button 
            className={chartType === 'price' ? 'active' : ''} 
            onClick={() => setChartType('price')}
          >
            Price History
          </button>
          <button 
            className={chartType === 'performance' ? 'active' : ''} 
            onClick={() => setChartType('performance')}
          >
            Performance
          </button>
          <button 
            onClick={() => {
              setDataLoaded(false);
              setLoading(true);
            }}
            disabled={loading}
          >
            {loading ? 'Refreshing...' : 'Refresh Data'}
          </button>
        </div>
      </div>
      
      <div className="comparison-symbols">
        <p>Comparing: </p>
        <div className="symbol-tags">
          {primaryStock && primaryStock['01. symbol'] && (
            <span className="symbol-tag primary">{primaryStock['01. symbol']}</span>
          )}
          {comparisonSymbols.map(symbol => (
            (primaryStock && symbol !== primaryStock['01. symbol']) && (
              <span key={symbol} className="symbol-tag">
                {symbol}
                <button 
                  className="remove-symbol" 
                  onClick={() => handleRemoveSymbol(symbol)}
                >
                  ×
                </button>
              </span>
            )
          ))}
          
          {!showInput && (
            <button 
              className="add-symbol-btn" 
              onClick={() => setShowInput(true)}
            >
              + Add
            </button>
          )}
          
          {showInput && (
            <div className="add-symbol-input">
              <input
                type="text"
                value={newSymbol}
                onChange={(e) => setNewSymbol(e.target.value)}
                placeholder="Symbol"
                maxLength={5}
              />
              <button onClick={handleAddSymbol}>Add</button>
              <button onClick={() => setShowInput(false)}>Cancel</button>
            </div>
          )}
        </div>
      </div>
      
      {loading ? (
        <div className="loading-comparison">Loading comparison data...</div>
      ) : (
        <div className="comparison-chart">
          {chartType === 'price' ? renderPriceChart() : renderPerformanceChart()}
        </div>
      )}
    </div>
  );
};

export default StockComparison; 