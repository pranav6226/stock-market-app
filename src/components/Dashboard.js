import React from 'react';
import PortfolioTracker from './PortfolioTracker';
import './Dashboard.css';

import StockAlerts from './StockAlerts';
import PerformanceAnalytics from './PerformanceAnalytics';

const Dashboard = () => {
  return (
    <div className="dashboard">
      <h1>User Dashboard</h1>
      <PortfolioTracker />
      <StockAlerts />
      <PerformanceAnalytics />
    </div>
  );
};

export default Dashboard;
