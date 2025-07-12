import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import { getCurrentUser, logoutUser } from './services/api';
import './App.css';

/**
 * Main App component
 * Handles user authentication, global dark mode toggle, and routing
 * Displays Login or Dashboard based on authentication status
 */
function App() {
  const [user, setUser] = useState(null); // User state
  const [loading, setLoading] = useState(true); // Loading state during auth check
  const [error, setError] = useState(null); // General error state
  const [darkMode, setDarkMode] = useState(() => {
    // Load dark mode preference from localStorage or default to false
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  // On mount, check if user is logged in
  useEffect(() => {
    async function fetchUser() {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (err) {
        // If error occurs assume no user logged in
        setUser(null);
        setError('Failed to verify user authentication.');
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, []);

  // Handler to toggle dark mode
  const toggleDarkMode = useCallback(() => {
    setDarkMode((prev) => {
      const newMode = !prev;
      localStorage.setItem('darkMode', JSON.stringify(newMode));
      return newMode;
    });
  }, []);

  // Handler for user logout
  const handleLogout = async () => {
    try {
      await logoutUser();
      setUser(null);
    } catch (err) {
      setError('Logout failed. Please try again.');
    }
  };

  // If still loading auth state, show loading UI
  if (loading) {
    return <div className="loading">Loading authentication...</div>;
  }

  return (
    <div className={darkMode ? 'app dark-mode' : 'app'}>
      <Router>
        <Routes>
          <Route
            path="/login"
            element={
              user ? <Navigate to="/dashboard" replace /> : <Login onLogin={setUser} onError={setError} />
            }
          />
          <Route
            path="/dashboard"
            element={
              user ? (
                <Dashboard
                  user={user}
                  onLogout={handleLogout}
                  darkMode={darkMode}
                  toggleDarkMode={toggleDarkMode}
                />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />
        </Routes>
        {error && <div className="error-message" role="alert">{error}</div>}
      </Router>
    </div>
  );
}

export default App;
