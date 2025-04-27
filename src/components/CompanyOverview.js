import React from 'react';
import { Card, Descriptions, Spin, Empty } from 'antd';
import { formatLargeNumber, formatCurrency, formatPercentage } from '../utils/formatters';

const CompanyOverview = ({ companyData, loading, error }) => {
  if (loading) {
    return (
      <Card title="Company Overview" className="company-overview-card">
        <div className="loading-container">
          <Spin size="large" />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card title="Company Overview" className="company-overview-card">
        <div className="error-container">
          <p>Error loading company overview: {error}</p>
        </div>
      </Card>
    );
  }

  if (!companyData) {
    return (
      <Card title="Company Overview" className="company-overview-card">
        <Empty description="No company data available" />
      </Card>
    );
  }

  return (
    <Card title="Company Overview" className="company-overview-card">
      <div className="company-description">
        <h3>About {companyData.Name}</h3>
        <p>{companyData.Description}</p>
      </div>
      
      <Descriptions bordered column={2} size="small" className="company-details">
        <Descriptions.Item label="Sector">{companyData.Sector || 'N/A'}</Descriptions.Item>
        <Descriptions.Item label="Industry">{companyData.Industry || 'N/A'}</Descriptions.Item>
        <Descriptions.Item label="Market Cap">{formatCurrency(companyData.MarketCapitalization)}</Descriptions.Item>
        <Descriptions.Item label="P/E Ratio">{companyData.PERatio || 'N/A'}</Descriptions.Item>
        <Descriptions.Item label="Dividend Yield">{companyData.DividendYield ? formatPercentage(Number(companyData.DividendYield) * 100) : 'N/A'}</Descriptions.Item>
        <Descriptions.Item label="52-Week High">{formatCurrency(companyData['52WeekHigh'])}</Descriptions.Item>
        <Descriptions.Item label="52-Week Low">{formatCurrency(companyData['52WeekLow'])}</Descriptions.Item>
        <Descriptions.Item label="Employees">{formatLargeNumber(companyData.FullTimeEmployees)}</Descriptions.Item>
      </Descriptions>
    </Card>
  );
};

export default CompanyOverview; 