import React, { useState, useEffect, useCallback } from 'react';
import SearchBar from './SearchBar';
import FilterPanel from './FilterPanel';
import StockList from './StockList';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Dashboard = ({ API_URLS, onStockDataChange }) => {
  const [stockData, setStockData] = useState({});
  const [searchQuery, setSearchQuery] = useState('AAPL');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [apiUrlIndex, setApiUrlIndex] = useState(0);
  const [filters, setFilters] = useState({});
  const navigate = useNavigate();

  const updateStockData = useCallback((data) => {
    setStockData(data);
    if (onStockDataChange) {
      onStockDataChange(data);
    }
  }, [onStockDataChange]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const symbol = params.get('symbol');
    if (symbol) {
      setSearchQuery(symbol);
    }
  }, []);

  const handleSearch = (query) => {
    setSearchQuery(query);
    navigate(`/?symbol=${query}`);
  };

  const handleFilterChange = (updatedFilters) => {
    setFilters(updatedFilters);
  };

  useEffect(() => {
    if (!searchQuery) return;

    setLoading(true);
    setError(null);

    const fetchStockData = async () => {
      try {
        const url = API_URLS[apiUrlIndex] + `/stock?symbol=${searchQuery}`;
        const response = await axios.get(url);
        updateStockData(response.data);
      } catch (err) {
        setError('Failed to fetch stock data.');
      } finally {
        setLoading(false);
      }
    };

    fetchStockData();
  }, [searchQuery, apiUrlIndex, updateStockData]);

  // Apply filtering logic
  const filteredStockData = React.useMemo(() => {
    if (!stockData || Object.keys(stockData).length === 0) return null;
    let passesFilters = true;

    const marketCapFilter = filters.marketCap ? parseInt(filters.marketCap, 10) : null;
    const sectorFilter = filters.sector ? filters.sector.toLowerCase() : null;

    if (marketCapFilter && (!stockData.marketCap || stockData.marketCap < marketCapFilter)) {
      passesFilters = false;
    }
    if (sectorFilter && stockData.sector?.toLowerCase() !== sectorFilter) {
      passesFilters = false;
    }

    return passesFilters ? stockData : null;
  }, [stockData, filters]);

  return (
    <div>
      <SearchBar onSearch={handleSearch} />
      <FilterPanel filters={filters} onFilterChange={handleFilterChange} />
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {filteredStockData ? (
        <StockList stockData={filteredStockData} />
      ) : (
        <p>No results found for current filters.</p>
      )}
    </div>
  );
};

export default Dashboard;
