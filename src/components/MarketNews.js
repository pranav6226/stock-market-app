import React, { useState, useEffect, useCallback } from 'react';

const MarketNews = ({ stockData }) => {
  const [news, setNews] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // News API key
  const NEWS_API_KEY = '161a8aed5bd4405b9b2eda4a0e09e9fd';
  
  // Fetch news when stock data changes
  useEffect(() => {
    if (stockData && stockData['01. symbol']) {
      fetchNewsForStock(stockData['01. symbol']);
    }
  }, [stockData, fetchNewsForStock]);
  
  // Fetch news from the News API
  const fetchNewsForStock = useCallback(async (symbol) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Search for stock market specific news about the company
      const companyName = getCompanyName(symbol);
      const query = encodeURIComponent(`(${symbol} OR ${companyName}) AND (stock market OR NYSE OR NASDAQ OR trading OR investors OR Wall Street)`);
      
      // Use domains parameter to filter for financial news sources
      const domains = 'finance.yahoo.com,investor.cnbc.com,fool.com,marketwatch.com,bloomberg.com,investors.com,wsj.com,barrons.com,ft.com,reuters.com';
      
      const url = `https://newsapi.org/v2/everything?q=${query}&domains=${domains}&apiKey=${NEWS_API_KEY}&language=en&sortBy=publishedAt&pageSize=5`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch news data');
      }
      
      const data = await response.json();
      
      if (data.status === 'ok' && data.articles) {
        // Format news data
        const formattedNews = data.articles.map((article, index) => ({
          id: index,
          title: article.title,
          source: article.source.name,
          time: formatNewsDate(article.publishedAt),
          snippet: article.description,
          url: article.url,
          imageUrl: article.urlToImage
        }));
        
        setNews(formattedNews);
        
        // If no financial news found, try a broader search with category=business
        if (formattedNews.length === 0) {
          fallbackToGeneralFinancialNews(symbol);
        }
      } else {
        throw new Error(data.message || 'Invalid news data received');
      }
    } catch (err) {
      console.error('Error fetching news:', err);
      setError(err.message);
      // Fall back to mock news if API fails
      setNews(generateMockNews());
    } finally {
      setIsLoading(false);
    }
  }, [NEWS_API_KEY, getCompanyName, formatNewsDate, fallbackToGeneralFinancialNews, generateMockNews, setIsLoading, setError, setNews]);
  
  // Fallback to general financial news if no specific stock news found
  const fallbackToGeneralFinancialNews = useCallback(async (symbol) => {
    try {
      const companyName = getCompanyName(symbol);
      // Try a broader search with top-headlines endpoint and category=business
      const url = `https://newsapi.org/v2/top-headlines?country=us&category=business&q=${encodeURIComponent(companyName)}&apiKey=${NEWS_API_KEY}&pageSize=5`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch general financial news');
      }
      
      const data = await response.json();
      
      if (data.status === 'ok' && data.articles && data.articles.length > 0) {
        // Format news data
        const formattedNews = data.articles.map((article, index) => ({
          id: index,
          title: article.title,
          source: article.source.name,
          time: formatNewsDate(article.publishedAt),
          snippet: article.description,
          url: article.url,
          imageUrl: article.urlToImage
        }));
        
        setNews(formattedNews);
      } else {
        // If still no results, fall back to mock news
        setNews(generateMockNews());
      }
    } catch (err) {
      console.error('Error fetching general financial news:', err);
      // Fall back to mock news
      setNews(generateMockNews());
    }
  }, [NEWS_API_KEY, getCompanyName, formatNewsDate, generateMockNews, setNews]);
  
  // Format the publishedAt date to a relative time
  const formatNewsDate = (dateString) => {
    const publishedDate = new Date(dateString);
    const now = new Date();
    const diffMs = now - publishedDate;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMins < 60) {
      return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    }
  };
  
  // Map common stock symbols to company names for better news results
  const getCompanyName = useCallback((symbol) => {
    const companyMap = {
      'AAPL': 'Apple',
      'MSFT': 'Microsoft',
      'GOOGL': 'Google',
      'GOOG': 'Google',
      'AMZN': 'Amazon',
      'META': 'Meta Facebook',
      'TSLA': 'Tesla',
      'NVDA': 'NVIDIA',
      'JPM': 'JPMorgan Chase',
      'BAC': 'Bank of America',
      'WMT': 'Walmart',
      'JNJ': 'Johnson and Johnson',
      'PG': 'Procter and Gamble',
      'MA': 'Mastercard',
      'V': 'Visa',
      'DIS': 'Disney',
      'NFLX': 'Netflix',
      'INTC': 'Intel',
      'KO': 'Coca-Cola',
      'PEP': 'PepsiCo'
    };
    
    return companyMap[symbol] || symbol;
  }, []);
  
  // Generate mock news based on the stock data (fallback)
  const generateMockNews = useCallback(() => {
    if (!stockData || !stockData['01. symbol']) return [];
    
    const symbol = stockData['01. symbol'];
    const companyName = getCompanyName(symbol);
    const change = parseFloat(stockData['09. change'] || 0);
    const changePercent = parseFloat(stockData['10. change percent']?.replace('%', '') || 0);
    const price = parseFloat(stockData['05. price'] || 0);
    const isPositive = change >= 0;
    
    // Market indexes for context
    const indexes = ['S&P 500', 'Nasdaq', 'Dow Jones'];
    const randomIndex = indexes[Math.floor(Math.random() * indexes.length)];
    
    // Generate market-related news
    const newsItems = [
      {
        id: 1,
        title: `${symbol} ${isPositive ? 'Rises' : 'Falls'} ${Math.abs(changePercent).toFixed(2)}% as ${randomIndex} ${isPositive ? 'Gains' : 'Drops'}`,
        source: 'Market Watch',
        time: '2 hours ago',
        url: '#',
        snippet: `Shares of ${companyName} (${symbol}) ${isPositive ? 'climbed' : 'fell'} by ${Math.abs(changePercent).toFixed(2)}% in today's trading session amid broader ${isPositive ? 'gains' : 'losses'} in the US markets. Wall Street analysts cite ${isPositive ? 'positive economic data' : 'recession fears'} as the main driver.`
      },
      {
        id: 2,
        title: `Wall Street Analysts Adjust ${symbol} Price Target to $${(price * 1.15).toFixed(2)} Following Earnings`,
        source: 'CNBC',
        time: '1 day ago',
        url: '#',
        snippet: `Major investment banks including Goldman Sachs and JP Morgan have revised their outlook for ${companyName}, with the consensus price target suggesting a potential ${(Math.random() * 10 + 5).toFixed(1)}% upside from current trading levels. Trading volume was ${(Math.random() * 50 + 50).toFixed(1)}% above the NYSE daily average.`
      },
      {
        id: 3,
        title: `${companyName} Shares React to Federal Reserve Policy Amid Volatile Trading Session`,
        source: 'Yahoo Finance',
        time: '3 days ago',
        url: '#',
        snippet: `${symbol} stock ${Math.random() > 0.5 ? 'rebounded' : 'retreated'} following the Federal Reserve's latest policy announcement. The company, which is a component of the ${randomIndex}, has seen its market position ${Math.random() > 0.6 ? 'strengthen' : 'weaken'} as investors assess the impact of interest rates on growth stocks.`
      },
      {
        id: 4,
        title: `Sector Analysis: How ${companyName} Compares to Industry Peers on Wall Street`,
        source: 'Barron\'s',
        time: '5 days ago',
        url: '#',
        snippet: `A comprehensive analysis of the ${getStockSector(symbol)} sector reveals that ${companyName} is ${Math.random() > 0.5 ? 'outperforming' : 'underperforming'} its competitors on key metrics. Trading patterns suggest ${Math.random() > 0.5 ? 'institutional buying' : 'profit-taking'} has been the dominant force in recent NASDAQ sessions.`
      }
    ];
    
    return newsItems;
  }, [stockData, getCompanyName, getStockSector]);
  
  // Get sector for a stock symbol
  const getStockSector = (symbol) => {
    if (['AAPL', 'MSFT', 'GOOG', 'GOOGL', 'META', 'NVDA', 'ADBE', 'CSCO', 'INTC'].includes(symbol)) {
      return 'Technology';
    } else if (['AMZN', 'TSLA', 'NFLX', 'DIS', 'CMCSA'].includes(symbol)) {
      return 'Consumer Cyclical';
    } else if (['JPM', 'BAC', 'V', 'MA', 'PYPL'].includes(symbol)) {
      return 'Financial Services';
    } else if (['JNJ', 'PFE', 'MRK', 'TMO'].includes(symbol)) {
      return 'Healthcare';
    } else if (['WMT', 'PG', 'COST', 'KO', 'PEP'].includes(symbol)) {
      return 'Consumer Defensive';
    }
    return 'Stocks';
  };
  
  // Generate market insight data
  const generateMarketInsights = () => {
    if (!stockData || !stockData['01. symbol']) return null;
    
    // Mock market cap based on price and a random multiplier
    const price = parseFloat(stockData['05. price'] || 0);
    const marketCapMultiplier = Math.floor(Math.random() * 900) + 100; // Between 100M and 1B shares
    const marketCap = price * marketCapMultiplier * 1000000;
    
    // Format market cap in billions or millions
    const formattedMarketCap = marketCap >= 1000000000 
      ? `$${(marketCap / 1000000000).toFixed(2)}B` 
      : `$${(marketCap / 1000000).toFixed(2)}M`;
    
    // Random PE ratio between 10 and 40
    const peRatio = (Math.random() * 30 + 10).toFixed(2);
    
    // Random dividend yield between 0 and 4%
    const dividendYield = (Math.random() * 4).toFixed(2);
    
    // Random 52-week range
    const currentPrice = parseFloat(stockData['05. price'] || 0);
    const lowPrice = (currentPrice * (0.7 + Math.random() * 0.2)).toFixed(2);
    const highPrice = (currentPrice * (1.1 + Math.random() * 0.3)).toFixed(2);
    
    return {
      marketCap: formattedMarketCap,
      peRatio,
      dividendYield: `${dividendYield}%`,
      week52Range: `$${lowPrice} - $${highPrice}`,
      averageVolume: `${(Math.floor(Math.random() * 9) + 1).toFixed(1)}M`,
      beta: (0.8 + Math.random() * 1.2).toFixed(2)
    };
  };
  
  const marketInsights = generateMarketInsights();
  
  return (
    <div className="dashboard-bottom">
      <div className="news-section card">
        <h2>Latest News</h2>
        {isLoading ? (
          <div className="loading-indicator">Loading news...</div>
        ) : error ? (
          <div className="error-message">Error loading news: {error}</div>
        ) : (
          <div className="news-list">
            {news.length > 0 ? (
              news.map(newsItem => (
                <div key={newsItem.id} className="news-item">
                  <h3>
                    <a href={newsItem.url} target="_blank" rel="noopener noreferrer">
                      {newsItem.title}
                    </a>
                  </h3>
                  <div className="news-meta">
                    <span className="news-source">{newsItem.source}</span>
                    <span className="news-time">{newsItem.time}</span>
                  </div>
                  {newsItem.imageUrl && (
                    <img 
                      src={newsItem.imageUrl} 
                      alt={newsItem.title}
                      className="news-image"
                      onError={(e) => e.target.style.display = 'none'}
                    />
                  )}
                  <p>{newsItem.snippet}</p>
                </div>
              ))
            ) : (
              <div className="no-news">No news available for this stock.</div>
            )}
          </div>
        )}
      </div>
      
      <div className="market-insights card">
        <h2>Market Insights</h2>
        {marketInsights && (
          <div className="insights-grid">
            <div className="insight-item">
              <div className="insight-label">Market Cap</div>
              <div className="insight-value">{marketInsights.marketCap}</div>
            </div>
            <div className="insight-item">
              <div className="insight-label">P/E Ratio</div>
              <div className="insight-value">{marketInsights.peRatio}</div>
            </div>
            <div className="insight-item">
              <div className="insight-label">Dividend Yield</div>
              <div className="insight-value">{marketInsights.dividendYield}</div>
            </div>
            <div className="insight-item">
              <div className="insight-label">52-Week Range</div>
              <div className="insight-value">{marketInsights.week52Range}</div>
            </div>
            <div className="insight-item">
              <div className="insight-label">Avg. Volume</div>
              <div className="insight-value">{marketInsights.averageVolume}</div>
            </div>
            <div className="insight-item">
              <div className="insight-label">Beta</div>
              <div className="insight-value">{marketInsights.beta}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MarketNews; 