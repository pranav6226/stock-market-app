import React from 'react';
import { render, screen } from '@testing-library/react';
import PerformanceAnalytics from '../components/PerformanceAnalytics';

test('renders Performance Analytics heading', () => {
  render(<PerformanceAnalytics />);
  const heading = screen.getByText(/Performance Analytics/i);
  expect(heading).toBeInTheDocument();
});
