import React, { useState } from 'react';

const SearchBar = ({ onSearch }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim().toUpperCase());
    }
  };

  return (
    <div className="card">
      <h2>Search Stock</h2>
      <form onSubmit={handleSubmit} className="input-group">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter stock symbol (e.g., AAPL, MSFT, GOOG)"
        />
        <button type="submit">Search</button>
      </form>
    </div>
  );
};

export default SearchBar; 