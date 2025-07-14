import React from 'react';

function DarkModeToggle({darkMode, onToggle}) {
  return (
    <button aria-label="Toggle dark mode" onClick={onToggle} style={{marginLeft: 12}}>
      {darkMode ? '🌙 Dark' : '☀️ Light'}
    </button>
  );
}

export default DarkModeToggle;
