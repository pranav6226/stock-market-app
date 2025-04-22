import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, LineChart, Line, ComposedChart, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';

const StockChart = ({ stockData }) => {
  const [chartType, setChartType] = useState('bar');
  const [historicalData, setHistoricalData] = useState([]);
  const [sectorData, setSectorData] = useState(null);
  const [marketData, setMarketData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Fetch historical data from backend API
  useEffect(() => {
    if (stockData && stockData['01. symbol']) {
      setIsLoading(true);
      setError(null);
      setHistoricalData([]);
      
      const symbol = stockData['01. symbol'];
      const period = '1mo'; // Default to 1 month
      const interval = '1d'; // Default to daily data
      
      // Define the API URL based on environment variable or fallback to localhost
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';
      const historyApiUrl = `${API_BASE_URL}/api/stock/history?symbol=${symbol}&period=${period}&interval=${interval}`;
      
      // Fetch stock historical data
      fetch(historyApiUrl)
        .then(response => {
          if (!response.ok) {
            throw new Error('Failed to fetch historical data');
          }
          return response.json();
        })
        .then(data => {
          if (data && data.data && Array.isArray(data.data)) {
            setHistoricalData(data.data);
            
            // Get sector for the stock (simplified mapping)
            let sector = 'TECHNOLOGY';
            if (['AAPL', 'MSFT', 'GOOG', 'GOOGL', 'META', 'NVDA', 'ADBE', 'CSCO', 'INTC'].includes(symbol)) {
              sector = 'XLK'; // Technology sector ETF
            } else if (['AMZN', 'TSLA', 'NFLX', 'DIS', 'CMCSA'].includes(symbol)) {
              sector = 'XLC'; // Communication Services sector ETF
            } else if (['JPM', 'BAC', 'V', 'MA', 'PYPL'].includes(symbol)) {
              sector = 'XLF'; // Financial sector ETF
            } else if (['JNJ', 'PFE', 'MRK', 'TMO'].includes(symbol)) {
              sector = 'XLV'; // Healthcare sector ETF
            } else if (['WMT', 'PG', 'COST', 'KO', 'PEP'].includes(symbol)) {
              sector = 'XLP'; // Consumer Staples sector ETF
            }
            
            // Fetch sector ETF data
            fetchComparisonData(sector, 'sector');
            
            // Fetch market index data (S&P 500)
            fetchComparisonData('SPY', 'market');
          } else {
            setError('Invalid data format received');
          }
          setIsLoading(false);
        })
        .catch(err => {
          console.error('Error fetching historical data:', err);
          setError(err.message);
          setIsLoading(false);
        });
    }
  }, [stockData]);
  
  // Helper function to fetch comparison data (sector, market index)
  const fetchComparisonData = (symbol, type) => {
    // Define the API URL based on environment variable or fallback to localhost
    const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';
    const stockApiUrl = `${API_BASE_URL}/api/stock?symbol=${symbol}`;

    fetch(stockApiUrl)
      .then(response => {
        if (!response.ok) {
          throw new Error(`Failed to fetch ${type} data`);
        }
        return response.json();
      })
      .then(data => {
        if (type === 'sector') {
          setSectorData(data);
        } else if (type === 'market') {
          setMarketData(data);
        }
      })
      .catch(err => {
        console.error(`Error fetching ${type} data:`, err);
      });
  };
  
  // Creating data for current day price levels
  const prepareChartData = () => {
    if (!stockData || !stockData['05. price']) {
      return [];
    }

    const basePrice = parseFloat(stockData['05. price']);
    
    // Create daily price data for visualization
    return [
      { name: 'Open', price: parseFloat(stockData['02. open']) },
      { name: 'Low', price: parseFloat(stockData['04. low']) },
      { name: 'Current', price: basePrice },
      { name: 'High', price: parseFloat(stockData['03. high']) },
    ];
  };

  // Generate data for price comparison with sector and index using real data
  const generateComparisonData = () => {
    if (!stockData || !stockData['05. price']) {
      return [];
    }
    
    // Stock data
    const stockPrice = parseFloat(stockData['05. price']);
    const stockChange = parseFloat(stockData['09. change'] || 0);
    const stockPercentChange = (stockChange / stockPrice) * 100;
    
    const result = [
      {
        name: stockData['01. symbol'],
        performance: parseFloat(stockPercentChange.toFixed(2)),
        fill: stockPercentChange >= 0 ? '#4CAF50' : '#F44336'
      }
    ];
    
    // Add sector data if available
    if (sectorData && sectorData['05. price'] && sectorData['09. change']) {
      const sectorChange = parseFloat(sectorData['09. change']);
      const sectorPrice = parseFloat(sectorData['05. price']);
      const sectorPercentChange = (sectorChange / sectorPrice) * 100;
      
      result.push({
        name: `${sectorData['01. symbol']} (Sector)`,
        performance: parseFloat(sectorPercentChange.toFixed(2)),
        fill: sectorPercentChange >= 0 ? '#4CAF50' : '#F44336'
      });
    } else {
      // Default sector if data not available yet
      result.push({
        name: 'Sector Avg',
        performance: 0,
        fill: '#9E9E9E'
      });
    }
    
    // Add market index data if available
    if (marketData && marketData['05. price'] && marketData['09. change']) {
      const marketChange = parseFloat(marketData['09. change']);
      const marketPrice = parseFloat(marketData['05. price']);
      const marketPercentChange = (marketChange / marketPrice) * 100;
      
      result.push({
        name: `${marketData['01. symbol']} (Market)`,
        performance: parseFloat(marketPercentChange.toFixed(2)),
        fill: marketPercentChange >= 0 ? '#4CAF50' : '#F44336'
      });
    } else {
      // Default market if data not available yet
      result.push({
        name: 'Market Index',
        performance: 0,
        fill: '#9E9E9E'
      });
    }
    
    return result;
  };

  const chartData = prepareChartData();
  const comparisonData = generateComparisonData();
  
  // Determine if stock is up or down for color schemes
  const isStockUp = parseFloat(stockData['09. change'] || 0) >= 0;
  const mainColor = isStockUp ? '#4CAF50' : '#F44336';
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

  // Chart type options
  const chartTypes = [
    { id: 'bar', label: 'Price Levels' },
    { id: 'line', label: 'Price History' },
    { id: 'volume', label: 'Volume Analysis' },
    { id: 'comparison', label: 'Performance Comparison' }
  ];

  // Loading state
  if ((chartType === 'line' || chartType === 'volume') && isLoading) {
    return (
      <div className="chart-container" style={{ height: '400px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <p>Loading historical data...</p>
      </div>
    );
  }

  // Error state
  if ((chartType === 'line' || chartType === 'volume') && error) {
    return (
      <div className="chart-container" style={{ height: '400px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#F44336' }}>
        <p>Error: {error}. Unable to display historical data.</p>
      </div>
    );
  }

  // No data state
  if ((chartType === 'line' || chartType === 'volume') && historicalData.length === 0 && !isLoading && !error) {
    return (
      <div className="chart-container" style={{ height: '400px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <p>No historical data available for this stock.</p>
      </div>
    );
  }

  // Render different chart based on selection
  const renderSelectedChart = () => {
    switch(chartType) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis 
                domain={[
                  (dataMin) => Math.floor(dataMin * 0.995),
                  (dataMax) => Math.ceil(dataMax * 1.005)
                ]}
                tickFormatter={(value) => `$${value.toFixed(2)}`}
              />
              <Tooltip 
                formatter={(value) => [`$${value.toFixed(2)}`, 'Price']}
              />
              <Legend />
              <Bar dataKey="price" fill={mainColor} />
            </BarChart>
          </ResponsiveContainer>
        );
      
      case 'line':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={historicalData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis 
                domain={['auto', 'auto']}
                tickFormatter={(value) => `$${value.toFixed(2)}`}
              />
              <Tooltip 
                formatter={(value) => [`$${value.toFixed(2)}`, 'Price']} 
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="price" 
                stroke={mainColor} 
                strokeWidth={2}
                dot={{ r: 0 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        );
      
      case 'volume':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={historicalData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis 
                yAxisId="left"
                orientation="left"
                tickFormatter={(value) => `$${value.toFixed(2)}`}
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                domain={['auto', 'auto']}
                tickFormatter={(value) => `${(value/1000000).toFixed(1)}M`}
              />
              <Tooltip 
                formatter={(value, name) => {
                  return name === 'price' 
                    ? [`$${value.toFixed(2)}`, 'Price'] 
                    : [`${(value/1000000).toFixed(1)}M`, 'Volume'];
                }}
              />
              <Legend />
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="price" 
                stroke={mainColor} 
                strokeWidth={2}
                dot={false}
              />
              <Bar 
                yAxisId="right"
                dataKey="volume" 
                fill="#8884d8" 
                opacity={0.5} 
              />
            </ComposedChart>
          </ResponsiveContainer>
        );
      
      case 'comparison':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={comparisonData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis 
                tickFormatter={(value) => `${value}%`}
                domain={[
                  dataMin => Math.min(dataMin, -2),
                  dataMax => Math.max(dataMax, 2)
                ]}
              />
              <Tooltip 
                formatter={(value) => [`${value}%`, 'Performance']}
              />
              <Legend />
              <Bar dataKey="performance" fill="#8884d8">
                {
                  comparisonData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))
                }
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        );
      
      default:
        return (
          <div>Please select a chart type</div>
        );
    }
  };

  return (
    <div className="stock-chart">
      <div className="chart-selectors">
        {chartTypes.map((type) => (
          <button
            key={type.id}
            className={`chart-type-btn ${chartType === type.id ? 'active' : ''}`}
            onClick={() => setChartType(type.id)}
          >
            {type.label}
          </button>
        ))}
      </div>
      <div className="chart-container" style={{ height: '400px' }}>
        {!stockData || Object.keys(stockData).length === 0 ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <p>Please select a stock to display chart</p>
          </div>
        ) : (
          renderSelectedChart()
        )}
      </div>
    </div>
  );
};

export default StockChart; 