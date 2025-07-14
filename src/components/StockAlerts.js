import React, { useState, useEffect } from 'react';

const StockAlerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const userId = 'demoUser'; // Replace with user auth logic

  useEffect(() => {
    fetch(`/api/alerts?user_id=${userId}`)
      .then(res => res.json())
      .then(data => {
        setAlerts(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading stock alerts...</div>;

  return (
    <div className="stock-alerts">
      <h2>Stock Alerts</h2>
      {alerts.length === 0 ? (
        <p>No active alerts.</p>
      ) : (
        <ul>
          {alerts.map(alert => (
            <li key={alert.id}>
              {alert.symbol} - {alert.alert_type} {alert.target_price}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default StockAlerts;
