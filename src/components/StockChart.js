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
    
    if (!priceLevelsData.length || !candlestickData.length) {
      return <div>No data available for price levels</div>;
    }

    return (
      <div className="chart-container">
        <h3>Price Levels</h3>
        <div className="price-levels-container">
          <div className="candlestick-chart">
            <h4>Last 10 Trading Days</h4>
            <ResponsiveContainer width="100%" height={250}>
              <ComposedChart data={candlestickData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={['auto', 'auto']} />
                <Tooltip 
                  formatter={(value, name) => [parseFloat(value).toFixed(2), name]}
                  labelFormatter={(value) => `Date: ${value}`}
                />
                <Legend />
                <Bar 
                  dataKey="volume" 
                  fill="#8884d8" 
                  opacity={0.3} 
                  yAxisId="volume" 
                  name="Volume" 
                  barSize={20} 
                />
                <Line 
                  type="monotone" 
                  dataKey="close" 
                  stroke="#ff7300" 
                  name="Close Price" 
                  dot={{ r: 5 }} 
                  activeDot={{ r: 8 }} 
                />
                <ReferenceLine 
                  y={parseFloat(stockData?.['05. price'] || 0)} 
                  stroke="red" 
                  strokeDasharray="3 3" 
                  label="Current" 
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          
          <div className="price-summary">
            <h4>Today's Price Summary</h4>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart 
                data={priceLevelsData} 
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

    return (
      <div className="chart-container">
        <h3>Daily Price Chart</h3>
        <ResponsiveContainer width="100%" height={400}>
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
      </div>
    );
  };

  // Render comparison chart
  const renderComparisonChart = () => {
    return (
      <div className="chart-container">
        <h3>Performance Comparison</h3>
        <ResponsiveContainer width="100%" height={400}>
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