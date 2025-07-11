import React from 'react';
import '../styles/Alert.css';

// Inline SVG icons for alert types
const icons = {
  success: (
    <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  ),
  warning: (
    <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
    </svg>
  ),
  error: (
    <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
};

export const Alert = ({ type, message, onClose }) => {
  const alertClass = `alert alert-${type}`;

  return (
    <div className={alertClass} role="alert">
      <span className="alert-icon" aria-hidden="true">{icons[type]}</span>
      <span className="alert-message">{message}</span>
      {onClose && (
        <button onClick={onClose} className="alert-close" aria-label="Close alert">
          &times;
        </button>
      )}
    </div>
  );
};
