import React, { useState } from 'react';
import { Table, Card, Empty, Spin, Radio } from 'antd';
import { formatLargeNumber } from '../utils/formatters';

const InstitutionalHolders = ({ companyData, loading, error }) => {
  const [sortBy, setSortBy] = useState('shares');

  if (loading) {
    return (
      <Card title="Institutional Holders" className="institutional-holders-card">
        <div className="loading-container">
          <Spin size="large" />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card title="Institutional Holders" className="institutional-holders-card">
        <div className="error-container">
          <p>Error loading institutional holders data: {error}</p>
        </div>
      </Card>
    );
  }

  if (!companyData || !companyData.InstitutionalOwnership || companyData.InstitutionalOwnership.length === 0) {
    return (
      <Card title="Institutional Holders" className="institutional-holders-card">
        <Empty description="No institutional holders data available" />
      </Card>
    );
  }

  // Calculate total shares for percentage computation
  const totalShares = companyData.InstitutionalOwnership.reduce(
    (sum, holder) => sum + holder.shares, 0
  );

  // Process data to include percentage ownership
  const processedData = companyData.InstitutionalOwnership.map((holder, index) => ({
    ...holder,
    key: index,
    percentage: (holder.shares / totalShares) * 100
  }));

  // Sort the data based on the selected criteria
  const sortedData = [...processedData].sort((a, b) => {
    if (sortBy === 'name') {
      return a.name.localeCompare(b.name);
    } else if (sortBy === 'percentage') {
      return b.percentage - a.percentage;
    } else {
      return b[sortBy] - a[sortBy];
    }
  });

  const columns = [
    {
      title: 'Institution',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Shares',
      dataIndex: 'shares',
      key: 'shares',
      render: (shares) => formatLargeNumber(shares),
      sorter: (a, b) => a.shares - b.shares,
    },
    {
      title: 'Value ($)',
      dataIndex: 'value',
      key: 'value',
      render: (value) => `$${formatLargeNumber(value)}`,
      sorter: (a, b) => a.value - b.value,
    },
    {
      title: 'Ownership (%)',
      dataIndex: 'percentage',
      key: 'percentage',
      render: (percentage) => percentage.toFixed(2) + '%',
      sorter: (a, b) => a.percentage - b.percentage,
    }
  ];

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  return (
    <Card 
      title="Institutional Holders" 
      className="institutional-holders-card"
      extra={
        <Radio.Group onChange={handleSortChange} value={sortBy}>
          <Radio.Button value="shares">By Shares</Radio.Button>
          <Radio.Button value="value">By Value</Radio.Button>
          <Radio.Button value="percentage">By %</Radio.Button>
          <Radio.Button value="name">By Name</Radio.Button>
        </Radio.Group>
      }
    >
      <Table 
        dataSource={sortedData} 
        columns={columns} 
        pagination={false}
        size="small"
      />
    </Card>
  );
};

export default InstitutionalHolders; 