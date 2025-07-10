import React from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function LogoutButton() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      // Call the backend API to logout and clear session
      await axios.post('/api/logout');
      // Redirect to login or landing page after logout
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
      alert('Logout failed, please try again.');
    }
  };

  return (
    <button onClick={handleLogout} className="logout-button">
      Logout
    </button>
  );
}

export default LogoutButton;
