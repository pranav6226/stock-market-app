import React from 'react';
import './LoadingSpinner.css';

const LoadingSpinner = () => {
  return (
    <div className="loading-spinner">
      <div className="spinner"></div>
      <div>Loading...</div>
    </div>
  );
};

export default LoadingSpinner;
