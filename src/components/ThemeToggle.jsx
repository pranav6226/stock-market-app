import React, { useEffect, useState } from 'react';

const ThemeToggle = ({ userId }) => {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    // Fetch saved theme from backend
    fetch(`/api/theme?user_id=${userId}`)
      .then(res => res.json())
      .then(data => {
        if (data.theme) {
          setTheme(data.theme);
          document.body.setAttribute('data-theme', data.theme);
        }
      })
      .catch(console.error);
  }, [userId]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.body.setAttribute('data-theme', newTheme);

    // Save theme preference
    fetch('/api/theme', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, theme: newTheme }),
      credentials: 'include'
    }).catch(console.error);
  };

  return (
    <button onClick={toggleTheme}>
      Switch to {theme === 'light' ? 'Dark' : 'Light'} Mode
    </button>
  );
};

export default ThemeToggle;
