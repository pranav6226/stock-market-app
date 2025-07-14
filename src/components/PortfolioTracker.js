import React, { useState, useEffect } from 'react';

const PortfolioTracker = () => {
  const [portfolio, setPortfolio] = useState([]);
  const [loading, setLoading] = useState(true);
  const userId = 'demoUser'; // Replace with user auth logic

  useEffect(() => {
    fetch(`/api/portfolio?user_id=${userId}`)
      .then(res => res.json())
      .then(data => {
        setPortfolio(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading portfolio...</div>;
  return (
    <div className="portfolio-tracker">
      <h2>Portfolio Tracker</h2>
      {portfolio.length === 0 ? (
        <p>No portfolio holdings.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Symbol</th>
              <th>Shares</th>
              <th>Purchase Price</th>
              <th>Purchase Date</th>
            </tr>
          </thead>
          <tbody>
            {portfolio.map(item => (
              <tr key={item.id}>
                <td>{item.symbol}</td>
                <td>{item.shares}</td>
                <td>${item.purchase_price.toFixed(2)}</td>
                <td>{new Date(item.purchase_date).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default PortfolioTracker;
