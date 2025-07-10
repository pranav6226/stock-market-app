import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import UserProfile from './UserProfile';
import Dashboard from './Dashboard';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<UserProfile />} />
      </Routes>
    </Router>
  );
}
