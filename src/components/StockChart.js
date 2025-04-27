import React, { useState, useEffect, useCallback } from 'react';
import { 
  BarChart, Bar, LineChart, Line, ComposedChart, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, Cell, ReferenceLine
} from 'recharts';
import { fetchHistoricalData, fetchStockData } from '../services/stockService';

const StockChart = ({ stockData }) => {
  const [chartType, setChartType] = useState('bar');
  const [historicalData, setHistoricalData] = useState([]);
  const [sectorData, setSectorData] = useState(null);
  const [marketData, setMarketData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [timePeriod, setTimePeriod] = useState('1M');
  
  // Fetch historical data from backend API
  useEffect(() => {
    if (stockData && stockData['01. symbol']) {
      setIsLoading(true);
      setError(null);
      setHistoricalData([]);
      
      const symbol = stockData['01. symbol'];
      
      // Map time period selection to API parameter
      let period = '1mo'; // Default to 1 month
      if (timePeriod === '3M') period = '3mo';
      if (timePeriod === '6M') period = '6mo';
      if (timePeriod === '1Y') period = '1y';
      
      const interval = '1d'; // Default to daily data
      
      // Fetch stock historical data using our service
      fetchHistoricalData(symbol, period, interval)
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
  }, [stockData, timePeriod]);
  
  // Helper function to fetch comparison data (sector, market index)
  const fetchComparisonData = (symbol, type) => {
    // Use stockService to fetch data
    fetchStockData(symbol)
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
  
  // Generate data for price comparison with sector and index using real data
  const generateComparisonData = () => {
    if (!stockData || !stockData['05. price']) {
      return [];
    }
    
    try {
      // Stock data with safety checks
      const stockPrice = parseFloat(stockData['05. price']) || 0;
      const stockChange = parseFloat(stockData['09. change'] || 0);
      // Avoid division by zero
      const stockPercentChange = stockPrice === 0 ? 0 : (stockChange / stockPrice) * 100;
      
      const result = [
        {
          name: stockData['01. symbol'] || 'Stock',
          performance: parseFloat(stockPercentChange.toFixed(2)),
          fill: stockPercentChange >= 0 ? '#4CAF50' : '#F44336'
        }
      ];
      
      // Add sector data if available
      if (sectorData && sectorData['05. price'] && sectorData['09. change']) {
        try {
          const sectorChange = parseFloat(sectorData['09. change']);
          const sectorPrice = parseFloat(sectorData['05. price']);
          // Avoid division by zero
          const sectorPercentChange = sectorPrice === 0 ? 0 : (sectorChange / sectorPrice) * 100;
          
          result.push({
            name: `${sectorData['01. symbol'] || 'Sector'} (Sector)`,
            performance: parseFloat(sectorPercentChange.toFixed(2)),
            fill: sectorPercentChange >= 0 ? '#4CAF50' : '#F44336'
          });
        } catch (error) {
          // Fallback for sector if calculation fails
          result.push({
            name: 'Sector Avg',
            performance: 0,
            fill: '#9E9E9E'
          });
        }
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
        try {
          const marketChange = parseFloat(marketData['09. change']);
          const marketPrice = parseFloat(marketData['05. price']);
          // Avoid division by zero
          const marketPercentChange = marketPrice === 0 ? 0 : (marketChange / marketPrice) * 100;
          
          result.push({
            name: `${marketData['01. symbol'] || 'Market'} (Market)`,
            performance: parseFloat(marketPercentChange.toFixed(2)),
            fill: marketPercentChange >= 0 ? '#4CAF50' : '#F44336'
          });
        } catch (error) {
          // Fallback for market if calculation fails
          result.push({
            name: 'Market Index',
            performance: 0,
            fill: '#9E9E9E'
          });
        }
      } else {
        // Default market if data not available yet
        result.push({
          name: 'Market Index',
          performance: 0,
          fill: '#9E9E9E'
        });
      }
      
      return result;
    } catch (error) {
      console.error("Error generating comparison data:", error);
      // Return fallback data if anything fails
      return [
        { name: 'Stock', performance: 0, fill: '#9E9E9E' },
        { name: 'Sector', performance: 0, fill: '#9E9E9E' },
        { name: 'Market', performance: 0, fill: '#9E9E9E' }
      ];
    }
  };

  const comparisonData = generateComparisonData();
  
  // Determine if stock is up or down for color schemes
  const isStockUp = parseFloat(stockData?.['09. change'] || 0) >= 0;
  const mainColor = isStockUp ? '#4CAF50' : '#F44336';

  // Function to generate price levels data - moved outside conditional rendering
  const generatePriceLevelsData = useCallback(() => {
    if (!stockData) return [];

    const open = parseFloat(stockData?.['02. open'] || 0);
    const high = parseFloat(stockData?.['03. high'] || 0);
    const low = parseFloat(stockData?.['04. low'] || 0);
    const price = parseFloat(stockData?.['05. price'] || 0);
    const previousClose = parseFloat(stockData?.['08. previous close'] || 0);

    return [
      {
        name: 'Previous Close',
        value: previousClose,
        fill: '#8884d8'
      },
      {
        name: 'Open',
        value: open,
        fill: '#82ca9d'
      },
      {
        name: 'Low',
        value: low,
        fill: '#ff8042'
      },
      {
        name: 'Price',
        value: price,
        fill: '#ffc658'
      },
      {
        name: 'High',
        value: high,
        fill: '#0088FE'
      }
    ];
  }, [stockData]);

  // Function to prepare candlestick data - moved outside conditional rendering
  const prepareCandlestickData = useCallback(() => {
    if (!historicalData || !historicalData.length) return [];
    
    // Get the last 10 trading days for the candlestick chart
    return historicalData.slice(0, 10).map(item => ({
      date: item.date,
      open: parseFloat(item.open),
      high: parseFloat(item.high),
      low: parseFloat(item.low),
      close: parseFloat(item.price),
      volume: parseFloat(item.volume)
    }));
  }, [historicalData]);

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

  // Enhanced rendering of the price levels chart
  const renderPriceLevelsChart = () => {
    const priceLevelsData = generatePriceLevelsData();
    const candlestickData = prepareCandlestickData();
    
    // Make sure we have valid data
    if (!priceLevelsData.length || !candlestickData.length) {
      return <div>No data available for price levels</div>;
    }

    // Ensure data has proper values
    const validPriceLevelsData = priceLevelsData.map(item => ({
      ...item,
      value: isNaN(item.value) ? 0 : item.value,
      fill: item.fill || '#8884d8'
    }));

    // Convert to a simpler data structure to avoid recharts errors
    const simplifiedTradeData = candlestickData.slice(0, 10).map(item => ({
      date: item.date || 'Unknown',
      price: isNaN(item.close) ? 0 : item.close
    }));

    return (
      <div className="chart-container">
        <h3>Price Levels</h3>
        <div className="price-levels-container">
          <div className="recent-price-chart">
            <h4>Recent Price History</h4>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart 
                data={simplifiedTradeData} 
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis 
                  domain={['auto', 'auto']}
                  tickFormatter={(value) => `$${value.toFixed(2)}`}
                />
                <Tooltip 
                  formatter={(value) => [`$${parseFloat(value).toFixed(2)}`, 'Price']}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="price"
                  stroke="#ff7300"
                  name="Price"
                  dot={{ r: 4 }}
                  activeDot={{ r: 8 }}
                />
                <ReferenceLine
                  y={parseFloat(stockData?.['05. price'] || 0)}
                  stroke="red"
                  strokeDasharray="3 3"
                  label="Current"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          <div className="price-summary">
            <h4>Today's Price Summary</h4>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart 
                data={validPriceLevelsData} 
                layout="vertical"
                margin={{ top: 5, right: 30, left: 50, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={['dataMin - 5', 'dataMax + 5']} />
                <YAxis type="category" dataKey="name" />
                <Tooltip formatter={(value) => [`$${parseFloat(value).toFixed(2)}`, 'Price']} />
                <Legend />
                <Bar dataKey="value" fill="#8884d8" name="Price Level" />
                <ReferenceLine 
                  x={parseFloat(stockData?.['05. price'] || 0)} 
                  stroke="red" 
                  strokeDasharray="3 3" 
                  label="Current" 
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    );
  };

  // Render daily chart
  const renderDailyChart = () => {
    if (!historicalData || !historicalData.length) {
      return <div>No historical data available</div>;
    }

    // Ensure the data is valid for the chart
    const validHistoricalData = historicalData.map(item => ({
      ...item,
      date: item.date || 'Unknown',
      price: isNaN(parseFloat(item.price)) ? 0 : parseFloat(item.price)
    }));

    return (
      <div className="chart-container">
        <h3>Daily Price Chart</h3>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart
            data={validHistoricalData}
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
      </div>
    );
  };

  // Render comparison chart
  const renderComparisonChart = () => {
    // Make sure comparisonData is valid and not empty
    if (!comparisonData || !comparisonData.length || comparisonData.some(item => item.performance === undefined)) {
      return <div>No comparison data available</div>;
    }

    // Ensure all data points have the required values
    const validData = comparisonData.map(entry => ({
      ...entry,
      // Ensure performance has a valid number value
      performance: isNaN(entry.performance) ? 0 : entry.performance,
      fill: entry.fill || '#8884d8'
    }));

    // Calculate min and max for more granular scale
    const minValue = Math.min(...validData.map(item => item.performance));
    const maxValue = Math.max(...validData.map(item => item.performance));
    
    // Create a more granular domain by adding small padding
    const padding = Math.max(0.1, (maxValue - minValue) * 0.2); // At least 0.1% padding or 20% of range
    const yDomain = [
      Math.min(minValue - padding, -0.1), // Ensure at least some negative space
      Math.max(maxValue + padding, 0.1)   // Ensure at least some positive space
    ];

    return (
      <div className="chart-container">
        <h3>Performance Comparison</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={validData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis 
              tickFormatter={(value) => `${value}%`}
              domain={yDomain}
              allowDecimals={true}
              tickCount={10}
            />
            <Tooltip 
              formatter={(value) => [`${value}%`, 'Performance']}
            />
            <Legend />
            <Bar dataKey="performance" fill="#8884d8">
              {
                validData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))
              }
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  };

  return (
    <div className="stock-chart-container card">
      <div className="chart-controls">
        <div className="chart-type-selector">
          <button
            className={chartType === 'price-levels' ? 'active' : ''}
            onClick={() => setChartType('price-levels')}
          >
            Price Levels
          </button>
          <button
            className={chartType === 'daily' ? 'active' : ''}
            onClick={() => setChartType('daily')}
          >
            Daily
          </button>
          <button
            className={chartType === 'comparison' ? 'active' : ''}
            onClick={() => setChartType('comparison')}
          >
            Comparison
          </button>
        </div>
        
        <div className="time-period-selector">
          {chartType === 'daily' && (
            <>
              <button
                className={timePeriod === '1M' ? 'active' : ''}
                onClick={() => setTimePeriod('1M')}
              >
                1M
              </button>
              <button
                className={timePeriod === '3M' ? 'active' : ''}
                onClick={() => setTimePeriod('3M')}
              >
                3M
              </button>
              <button
                className={timePeriod === '6M' ? 'active' : ''}
                onClick={() => setTimePeriod('6M')}
              >
                6M
              </button>
              <button
                className={timePeriod === '1Y' ? 'active' : ''}
                onClick={() => setTimePeriod('1Y')}
              >
                1Y
              </button>
            </>
          )}
        </div>
      </div>

      <div className="chart-content">
        {isLoading ? (
          <div className="loading">Loading chart data...</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : (
          <div>
            {chartType === 'price-levels' && renderPriceLevelsChart()}
            {chartType === 'daily' && renderDailyChart()}
            {chartType === 'comparison' && renderComparisonChart()}
          </div>
        )}
      </div>
    </div>
  );
};

export default StockChart; 