import React from 'react';
import ThemeToggle from './components/ThemeToggle';

const userId = "user123"; // Placeholder, should be replaced with auth user ID

function App() {
  return (
    <div className="App">
      <h1>Stock Market App</h1>
      <ThemeToggle userId={userId} />
    </div>
  );
}

export default App;
