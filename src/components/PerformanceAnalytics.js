import React, { useState, useEffect } from 'react';

const PerformanceAnalytics = () => {
  const [analytics, setAnalytics] = useState([]);
  const [loading, setLoading] = useState(true);
  const userId = 'demoUser'; // Replace with user auth logic

  useEffect(() => {
    fetch(`/api/analytics?user_id=${userId}`)
      .then(res => res.json())
      .then(data => {
        setAnalytics(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading performance analytics...</div>;

  return (
    <div className="performance-analytics">
      <h2>Performance Analytics</h2>
      {analytics.length === 0 ? (
        <p>No performance data available.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Symbol</th>
              <th>Portfolio Value</th>
              <th>Daily Change</th>
              <th>Daily Change %</th>
            </tr>
          </thead>
          <tbody>
            {analytics.map(item => (
              <tr key={item.id}>
                <td>{new Date(item.date).toLocaleDateString()}</td>
                <td>{item.symbol}</td>
                <td>${item.portfolio_value.toFixed(2)}</td>
                <td>{item.daily_change ? item.daily_change.toFixed(2) : 'N/A'}</td>
                <td>{item.daily_change_percent ? item.daily_change_percent.toFixed(2) : 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default PerformanceAnalytics;
