import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import StockChart from '../components/StockChart';
import CompanyOverview from '../components/CompanyOverview';
import StockStats from '../components/StockStats';
import InstitutionalHolders from '../components/InstitutionalHolders';
import { fetchStockQuote, fetchCompanyOverview } from '../services/stockService';

const StockDetails = () => {
  const { symbol } = useParams();
  const [stockData, setStockData] = useState(null);
  const [companyData, setCompanyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [companyLoading, setCompanyLoading] = useState(true);
  const [error, setError] = useState(null);
  const [companyError, setCompanyError] = useState(null);

  useEffect(() => {
    if (!symbol) return;

    const fetchData = async () => {
      setLoading(true);
      setCompanyLoading(true);
      
      try {
        const data = await fetchStockQuote(symbol);
        setStockData(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching stock data:', err);
        setError('Failed to fetch stock data');
        setStockData(null);
      } finally {
        setLoading(false);
      }
      
      try {
        const overview = await fetchCompanyOverview(symbol);
        setCompanyData(overview);
        setCompanyError(null);
      } catch (err) {
        console.error('Error fetching company data:', err);
        setCompanyError('Failed to fetch company data');
        setCompanyData(null);
      } finally {
        setCompanyLoading(false);
      }
    };

    fetchData();
  }, [symbol]);

  if (loading) {
    return <div className="loading-container">Loading stock details...</div>;
  }

  if (error) {
    return <div className="error-container">{error}</div>;
  }

  if (!stockData) {
    return <div className="error-container">No data available for {symbol}</div>;
  }

  return (
    <div className="stock-details-page">
      <div className="stock-details-header">
        <h1>{stockData['01. symbol']} - {stockData['02. open']}</h1>
        <h2>{stockData['01. symbol']}</h2>
      </div>

      <div className="stock-details-content">
        <div className="left-column">
          <StockChart stockSymbol={symbol} stockData={stockData} />
          <StockStats stockData={stockData} />
        </div>
        
        <div className="right-column">
          <CompanyOverview companyData={companyData} loading={companyLoading} error={companyError} />
          <InstitutionalHolders companyData={companyData} loading={companyLoading} error={companyError} />
        </div>
      </div>
    </div>
  );
};

export default StockDetails; 