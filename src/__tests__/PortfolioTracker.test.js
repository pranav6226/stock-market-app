import React from 'react';
import { render, screen } from '@testing-library/react';
import PortfolioTracker from '../components/PortfolioTracker';

test('renders Portfolio Tracker heading', () => {
  render(<PortfolioTracker />);
  const heading = screen.getByText(/Portfolio Tracker/i);
  expect(heading).toBeInTheDocument();
});
