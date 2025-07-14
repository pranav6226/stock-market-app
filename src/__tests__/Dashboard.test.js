import React from 'react';
import { render, screen } from '@testing-library/react';
import Dashboard from '../components/Dashboard';

test('renders User Dashboard heading', () => {
  render(<Dashboard />);
  const heading = screen.getByText(/User Dashboard/i);
  expect(heading).toBeInTheDocument();
});
