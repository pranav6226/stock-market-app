import React from 'react';

const StockList = ({ stockData }) => {
  // Format a number with commas for thousands
  const formatNumber = (num) => {
    return parseFloat(num).toLocaleString(undefined, { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    });
  };

  return (
    <div className="card">
      <h2>{stockData['01. symbol']} Stock Info</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <tbody>
          <tr>
            <td>Price:</td>
            <td>${formatNumber(stockData['05. price'] || 0)}</td>
          </tr>
          <tr>
            <td>Change:</td>
            <td style={{ 
              color: parseFloat(stockData['09. change'] || 0) >= 0 ? 'green' : 'red' 
            }}>
              ${formatNumber(stockData['09. change'] || 0)}
            </td>
          </tr>
          <tr>
            <td>Change %:</td>
            <td style={{ 
              color: parseFloat(stockData['10. change percent'] || 0) >= 0 ? 'green' : 'red' 
            }}>
              {stockData['10. change percent'] || '0.00%'}
            </td>
          </tr>
          <tr>
            <td>Volume:</td>
            <td>{parseInt(stockData['06. volume'] || 0).toLocaleString()}</td>
          </tr>
          <tr>
            <td>Open:</td>
            <td>${formatNumber(stockData['02. open'] || 0)}</td>
          </tr>
          <tr>
            <td>High:</td>
            <td>${formatNumber(stockData['03. high'] || 0)}</td>
          </tr>
          <tr>
            <td>Low:</td>
            <td>${formatNumber(stockData['04. low'] || 0)}</td>
          </tr>
          <tr>
            <td>Latest Trading Day:</td>
            <td>{stockData['07. latest trading day'] || 'N/A'}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default StockList; 