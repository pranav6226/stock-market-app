import React, { useState, useEffect, useCallback } from 'react';

const TechnicalAnalysis = ({ stockData }) => {
  // const [historicalData, setHistoricalData] = useState([]); // Removed as unused
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [technicalIndicators, setTechnicalIndicators] = useState({});

  // Fetch historical data for technical analysis
  useEffect(() => {
    if (stockData && stockData['01. symbol']) {
      setIsLoading(true);
      setError(null);
      
      const symbol = stockData['01. symbol'];
      // Get 3 months of data for better technical analysis
      const period = '3mo';
      const interval = '1d';
      
      // Define the API URL based on environment variable or fallback to localhost
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';
      const historyApiUrl = `${API_BASE_URL}/api/stock/history?symbol=${symbol}&period=${period}&interval=${interval}`;
      
      fetch(historyApiUrl)
        .then(response => {
          if (!response.ok) {
            throw new Error('Failed to fetch historical data for technical analysis');
          }
          return response.json();
        })
        .then(data => {
          if (data && data.data && Array.isArray(data.data)) {
            // setHistoricalData(data.data); // Removed as unused
            
            // Calculate technical indicators
            const indicators = calculateTechnicalIndicators(data.data, stockData);
            setTechnicalIndicators(indicators);
          } else {
            setError('Invalid data format received');
          }
          setIsLoading(false);
        })
        .catch(err => {
          console.error('Error fetching historical data for technical analysis:', err);
          setError(err.message);
          setIsLoading(false);
        });
    }
  }, [stockData, calculateTechnicalIndicators]);

  // Calculate technical indicators from historical data
  const calculateTechnicalIndicators = useCallback((data, currentStockData) => {
    if (!data || data.length < 14) {
      return { error: "Insufficient data for analysis" };
    }

    // Make sure data is sorted by date (oldest first)
    const sortedData = [...data].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Extract prices for easier calculation
    const prices = sortedData.map(item => parseFloat(item.price));
    const volumes = sortedData.map(item => parseInt(item.volume));
    
    // Get current price info
    const currentPrice = parseFloat(currentStockData['05. price']);
    const prevClose = parseFloat(currentStockData['08. previous close']);
    
    // Calculate Simple Moving Averages
    const sma20 = calculateSMA(prices, 20);
    const sma50 = calculateSMA(prices, 50);
    const sma200 = calculateSMA(prices, Math.min(200, prices.length));
    
    // Calculate RSI (Relative Strength Index)
    const rsi = calculateRSI(prices);
    
    // Calculate MACD
    const macd = calculateMACD(prices);
    
    // Calculate Bollinger Bands
    const bollingerBands = calculateBollingerBands(prices);
    
    // Volume analysis
    const averageVolume = volumes.slice(-10).reduce((sum, vol) => sum + vol, 0) / 10;
    const currentVolume = parseInt(currentStockData['06. volume']);
    const volumeRatio = currentVolume / averageVolume;
    
    // Price momentum
    const priceChange1Day = currentPrice - prevClose;
    const priceChange5Day = currentPrice - prices[prices.length - 5];
    const priceChange1Month = currentPrice - prices[0];
    
    // Calculate trend strength
    const trendStrength = calculateTrendStrength(prices);
    
    // Analyze support and resistance
    const supportResistance = analyzeSupportResistance(prices, currentPrice);
    
    return {
      sma: { 
        sma20: sma20.toFixed(2), 
        sma50: sma50.toFixed(2), 
        sma200: sma200.toFixed(2),
        isBullish: currentPrice > sma20 && sma20 > sma50
      },
      rsi: {
        value: rsi.toFixed(2),
        isOverbought: rsi > 70,
        isOversold: rsi < 30
      },
      macd: {
        value: macd.macdLine.toFixed(2),
        signal: macd.signalLine.toFixed(2),
        histogram: macd.histogram.toFixed(2),
        isBullish: macd.histogram > 0
      },
      bollingerBands: {
        upper: bollingerBands.upper.toFixed(2),
        middle: bollingerBands.middle.toFixed(2),
        lower: bollingerBands.lower.toFixed(2),
        width: ((bollingerBands.upper - bollingerBands.lower) / bollingerBands.middle * 100).toFixed(2),
        isOutsideUpper: currentPrice > bollingerBands.upper,
        isOutsideLower: currentPrice < bollingerBands.lower
      },
      volume: {
        average: averageVolume.toFixed(0),
        current: currentVolume,
        ratio: volumeRatio.toFixed(2),
        isHigh: volumeRatio > 1.5
      },
      priceChange: {
        oneDay: priceChange1Day.toFixed(2),
        oneDayPercent: (priceChange1Day / prevClose * 100).toFixed(2),
        fiveDay: priceChange5Day.toFixed(2),
        fiveDayPercent: (priceChange5Day / prices[prices.length - 5] * 100).toFixed(2),
        oneMonth: priceChange1Month.toFixed(2),
        oneMonthPercent: (priceChange1Month / prices[0] * 100).toFixed(2)
      },
      trend: {
        strength: trendStrength.strength,
        direction: trendStrength.direction
      },
      supportResistance: supportResistance
    };
  }, [calculateSMA, calculateRSI, calculateMACD, calculateBollingerBands, calculateTrendStrength, analyzeSupportResistance]);

  // Calculate Simple Moving Average
  const calculateSMA = useCallback((prices, period) => {
    if (prices.length < period) {
      return prices[prices.length - 1] || 0;
    }
    
    const sum = prices.slice(-period).reduce((total, price) => total + price, 0);
    return sum / period;
  }, []);

  // Calculate RSI (Relative Strength Index)
  const calculateRSI = useCallback((prices, period = 14) => {
    if (prices.length < period + 1) {
      return 50; // Neutral if not enough data
    }
    
    let gains = 0;
    let losses = 0;
    
    // Calculate initial average gain/loss
    for (let i = 1; i <= period; i++) {
      const change = prices[prices.length - period - 1 + i] - prices[prices.length - period - 1 + i - 1];
      if (change >= 0) {
        gains += change;
      } else {
        losses -= change;
      }
    }
    
    let avgGain = gains / period;
    let avgLoss = losses / period;
    
    // Calculate RSI using Wilder's smoothing method
    for (let i = period + 1; i < prices.length; i++) {
      const change = prices[i] - prices[i - 1];
      let currentGain = 0;
      let currentLoss = 0;
      
      if (change >= 0) {
        currentGain = change;
      } else {
        currentLoss = -change;
      }
      
      avgGain = (avgGain * (period - 1) + currentGain) / period;
      avgLoss = (avgLoss * (period - 1) + currentLoss) / period;
    }
    
    if (avgLoss === 0) {
      return 100; // No losses means RSI = 100
    }
    
    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
  }, []);

  // Calculate MACD
  const calculateMACD = useCallback((prices) => {
    // Default periods: 12, 26, 9
    const fastEMA = calculateEMA(prices, 12);
    const slowEMA = calculateEMA(prices, 26);
    const macdLine = fastEMA - slowEMA;
    
    // Calculate signal line (9-day EMA of MACD line)
    // For simplicity, we'll use a simplified approach
    const signalLine = macdLine * 0.9 + calculateEMA(prices, 9) * 0.1;
    const histogram = macdLine - signalLine;
    
    return { macdLine, signalLine, histogram };
  }, [calculateEMA]);

  // Calculate Exponential Moving Average
  const calculateEMA = useCallback((prices, period) => {
    if (prices.length < period) {
      return prices[prices.length - 1] || 0;
    }
    
    const sma = calculateSMA(prices.slice(0, period), period);
    const multiplier = 2 / (period + 1);
    
    let ema = sma;
    for (let i = period; i < prices.length; i++) {
      ema = (prices[i] - ema) * multiplier + ema;
    }
    
    return ema;
  }, [calculateSMA]);

  // Calculate Bollinger Bands
  const calculateBollingerBands = useCallback((prices, period = 20, stdDev = 2) => {
    if (prices.length < period) {
      const price = prices[prices.length - 1] || 0;
      return { upper: price * 1.05, middle: price, lower: price * 0.95 };
    }
    
    const recentPrices = prices.slice(-period);
    const middle = calculateSMA(recentPrices, period);
    
    // Calculate standard deviation
    const sqrDiff = recentPrices.map(price => {
      const diff = price - middle;
      return diff * diff;
    });
    
    const avgSquareDiff = sqrDiff.reduce((sum, val) => sum + val, 0) / period;
    const standardDeviation = Math.sqrt(avgSquareDiff);
    
    const upper = middle + (standardDeviation * stdDev);
    const lower = middle - (standardDeviation * stdDev);
    
    return { upper, middle, lower };
  }, [calculateSMA]);

  // Calculate trend strength
  const calculateTrendStrength = useCallback((prices) => {
    if (prices.length < 10) {
      return { strength: "Unknown", direction: "Neutral" };
    }
    
    const shortTerm = (prices[prices.length - 1] - prices[prices.length - 5]) / prices[prices.length - 5];
    const mediumTerm = (prices[prices.length - 1] - prices[prices.length - 10]) / prices[prices.length - 10];
    
    let direction = "Neutral";
    if (shortTerm > 0 && mediumTerm > 0) {
      direction = "Bullish";
    } else if (shortTerm < 0 && mediumTerm < 0) {
      direction = "Bearish";
    } else if (shortTerm > 0 && mediumTerm < 0) {
      direction = "Recovering";
    } else if (shortTerm < 0 && mediumTerm > 0) {
      direction = "Weakening";
    }
    
    let strength = "Weak";
    const totalStrength = Math.abs(shortTerm) + Math.abs(mediumTerm);
    if (totalStrength > 0.1) {
      strength = "Strong";
    } else if (totalStrength > 0.05) {
      strength = "Moderate";
    }
    
    return { strength, direction };
  }, []);

  // Analyze support and resistance levels
  const analyzeSupportResistance = useCallback((prices, currentPrice) => {
    if (prices.length < 20) {
      return { support: currentPrice * 0.95, resistance: currentPrice * 1.05 };
    }
    
    // Find recent highs and lows
    const recentPrices = prices.slice(-30);
    let potentialResistance = [];
    let potentialSupport = [];
    
    // Find price points that may be support or resistance
    for (let i = 2; i < recentPrices.length - 2; i++) {
      // Check if it's a local peak (resistance)
      if (recentPrices[i] > recentPrices[i-1] && 
          recentPrices[i] > recentPrices[i-2] && 
          recentPrices[i] > recentPrices[i+1] && 
          recentPrices[i] > recentPrices[i+2]) {
        potentialResistance.push(recentPrices[i]);
      }
      
      // Check if it's a local trough (support)
      if (recentPrices[i] < recentPrices[i-1] && 
          recentPrices[i] < recentPrices[i-2] && 
          recentPrices[i] < recentPrices[i+1] && 
          recentPrices[i] < recentPrices[i+2]) {
        potentialSupport.push(recentPrices[i]);
      }
    }
    
    // Find closest levels
    let resistance = Math.max(...recentPrices) * 1.02;
    let support = Math.min(...recentPrices) * 0.98;
    
    if (potentialResistance.length > 0) {
      // Find the nearest resistance level above current price
      const aboveResistances = potentialResistance.filter(price => price > currentPrice);
      if (aboveResistances.length > 0) {
        resistance = Math.min(...aboveResistances);
      }
    }
    
    if (potentialSupport.length > 0) {
      // Find the nearest support level below current price
      const belowSupports = potentialSupport.filter(price => price < currentPrice);
      if (belowSupports.length > 0) {
        support = Math.max(...belowSupports);
      }
    }
    
    return { support: parseFloat(support.toFixed(2)), resistance: parseFloat(resistance.toFixed(2)) };
  }, []);

  // Calculate recommendation based on technical indicators
  const calculateRecommendation = () => {
    if (isLoading || error || !technicalIndicators.sma) {
      return { recommendation: "Hold", signals: [], color: "#f0ad4e" };
    }
    
    const price = parseFloat(stockData['05. price'] || 0);
    const indicators = technicalIndicators;
    
    let score = 0;
    let signals = [];
    
    // SMA analysis
    if (indicators.sma) {
      const sma20 = parseFloat(indicators.sma.sma20);
      const sma50 = parseFloat(indicators.sma.sma50);
      const sma200 = parseFloat(indicators.sma.sma200);
      
      if (price > sma20 && price > sma50 && price > sma200) {
        score += 2;
        signals.push("Price is above all major moving averages (strongly bullish)");
      } else if (price > sma20 && price > sma50) {
        score += 1;
        signals.push("Price is above short-term moving averages (bullish)");
      } else if (price < sma20 && price < sma50 && price < sma200) {
        score -= 2;
        signals.push("Price is below all major moving averages (strongly bearish)");
      } else if (price < sma20 && price < sma50) {
        score -= 1;
        signals.push("Price is below short-term moving averages (bearish)");
      }
      
      // Golden cross / Death cross
      if (sma20 > sma50 && sma20 - sma50 < sma20 * 0.01) {
        score += 2;
        signals.push("Recent golden cross detected (bullish)");
      } else if (sma20 < sma50 && sma50 - sma20 < sma50 * 0.01) {
        score -= 2;
        signals.push("Recent death cross detected (bearish)");
      }
    }
    
    // RSI analysis
    if (indicators.rsi) {
      const rsi = parseFloat(indicators.rsi.value);
      
      if (rsi > 70) {
        score -= 1.5;
        signals.push(`RSI is overbought at ${rsi} (bearish)`);
      } else if (rsi < 30) {
        score += 1.5;
        signals.push(`RSI is oversold at ${rsi} (bullish)`);
      } else if (rsi > 60) {
        score += 0.5;
        signals.push(`RSI shows strong momentum at ${rsi} (bullish)`);
      } else if (rsi < 40) {
        score -= 0.5;
        signals.push(`RSI shows weak momentum at ${rsi} (bearish)`);
      }
    }
    
    // MACD analysis
    if (indicators.macd) {
      if (indicators.macd.isBullish) {
        score += 1;
        signals.push("MACD histogram is positive (bullish)");
      } else {
        score -= 1;
        signals.push("MACD histogram is negative (bearish)");
      }
    }
    
    // Bollinger Bands analysis
    if (indicators.bollingerBands) {
      if (indicators.bollingerBands.isOutsideUpper) {
        score -= 1;
        signals.push("Price is above upper Bollinger Band (potential reversal or strong uptrend)");
      } else if (indicators.bollingerBands.isOutsideLower) {
        score += 1;
        signals.push("Price is below lower Bollinger Band (potential reversal or strong downtrend)");
      }
      
      // Check Bollinger Band width for potential breakout
      const bbWidth = parseFloat(indicators.bollingerBands.width);
      if (bbWidth < 2) {
        signals.push("Tight Bollinger Bands suggest potential breakout soon");
      }
    }
    
    // Volume analysis
    if (indicators.volume && indicators.volume.isHigh) {
      const volumeRatio = parseFloat(indicators.volume.ratio);
      if (indicators.priceChange && parseFloat(indicators.priceChange.oneDay) > 0) {
        score += 1;
        signals.push(`High volume (${volumeRatio}x avg) with price increase (bullish)`);
      } else if (indicators.priceChange && parseFloat(indicators.priceChange.oneDay) < 0) {
        score -= 1;
        signals.push(`High volume (${volumeRatio}x avg) with price decrease (bearish)`);
      }
    }
    
    // Trend analysis
    if (indicators.trend) {
      if (indicators.trend.direction === "Bullish" && indicators.trend.strength === "Strong") {
        score += 1.5;
        signals.push("Strong bullish trend detected");
      } else if (indicators.trend.direction === "Bearish" && indicators.trend.strength === "Strong") {
        score -= 1.5;
        signals.push("Strong bearish trend detected");
      } else if (indicators.trend.direction === "Recovering") {
        score += 0.5;
        signals.push("Recovering trend detected (potential reversal)");
      }
    }
    
    // Support/Resistance analysis
    if (indicators.supportResistance) {
      const support = indicators.supportResistance.support;
      const resistance = indicators.supportResistance.resistance;
      const nearSupportPercent = ((price - support) / price) * 100;
      const nearResistancePercent = ((resistance - price) / price) * 100;
      
      if (nearSupportPercent < 1) {
        score += 0.5;
        signals.push(`Price is near support level at $${support} (potential bounce)`);
      } else if (nearResistancePercent < 1) {
        score -= 0.5;
        signals.push(`Price is near resistance level at $${resistance} (potential rejection)`);
      }
    }
    
    // Determine recommendation
    let recommendation = "Hold";
    let color = "#f0ad4e"; // Yellow/orange for hold
    
    if (score >= 3) {
      recommendation = "Strong Buy";
      color = "#5cb85c"; // Green
    } else if (score > 1) {
      recommendation = "Buy";
      color = "#5bc0de"; // Light blue
    } else if (score < -2) {
      recommendation = "Strong Sell";
      color = "#d9534f"; // Red
    } else if (score < 0) {
      recommendation = "Sell";
      color = "#f0605e"; // Light red
    }
    
    return { recommendation, signals, color };
  };

  const { recommendation, signals, color } = calculateRecommendation();

  if (isLoading) {
    return (
      <div className="card">
        <h2>Technical Analysis</h2>
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <p>Loading technical indicators...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <h2>Technical Analysis</h2>
        <div style={{ color: '#F44336', textAlign: 'center', padding: '20px' }}>
          <p>Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <h2>Technical Analysis</h2>
      
      <div className="recommendation-container">
        <div 
          className="recommendation" 
          style={{ 
            backgroundColor: color,
            padding: '15px',
            borderRadius: '5px',
            color: 'white',
            fontWeight: 'bold',
            textAlign: 'center',
            fontSize: '1.2rem',
            marginBottom: '15px'
          }}
        >
          {recommendation}
        </div>
        
        <div className="indicators-summary">
          {technicalIndicators.sma && (
            <div className="indicator-group">
              <h3>Moving Averages</h3>
              <ul>
                <li>SMA 20: ${technicalIndicators.sma.sma20}</li>
                <li>SMA 50: ${technicalIndicators.sma.sma50}</li>
                <li>SMA 200: ${technicalIndicators.sma.sma200}</li>
              </ul>
            </div>
          )}
          
          {technicalIndicators.rsi && (
            <div className="indicator-group">
              <h3>Momentum</h3>
              <ul>
                <li>RSI (14): {technicalIndicators.rsi.value} 
                  {technicalIndicators.rsi.isOverbought && " (Overbought)"}
                  {technicalIndicators.rsi.isOversold && " (Oversold)"}
                </li>
                {technicalIndicators.macd && (
                  <li>MACD: {technicalIndicators.macd.histogram > 0 ? "Bullish" : "Bearish"}</li>
                )}
              </ul>
            </div>
          )}
          
          {technicalIndicators.supportResistance && (
            <div className="indicator-group">
              <h3>Support/Resistance</h3>
              <ul>
                <li>Support: ${technicalIndicators.supportResistance.support}</li>
                <li>Resistance: ${technicalIndicators.supportResistance.resistance}</li>
              </ul>
            </div>
          )}
        </div>
        
        <h3>Analysis:</h3>
        <ul className="signals-list">
          {signals.map((signal, index) => (
            <li key={index}>{signal}</li>
          ))}
        </ul>
        
        <div className="disclaimer">
          <small>
            <em>Disclaimer: This analysis is based on technical indicators only and should not be the sole basis for investment decisions.</em>
          </small>
        </div>
      </div>
    </div>
  );
};

export default TechnicalAnalysis; 