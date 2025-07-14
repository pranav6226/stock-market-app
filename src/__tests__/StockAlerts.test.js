import React from 'react';
import { render, screen } from '@testing-library/react';
import StockAlerts from '../components/StockAlerts';

test('renders Stock Alerts heading', () => {
  render(<StockAlerts />);
  const heading = screen.getByText(/Stock Alerts/i);
  expect(heading).toBeInTheDocument();
});
