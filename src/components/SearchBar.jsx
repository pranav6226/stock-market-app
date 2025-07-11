import React, { useState } from 'react';

const SearchBar = ({ onSearch }) => {
  const [query, setQuery] = useState('');

  const handleChange = (event) => {
    setQuery(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if(onSearch) {
      onSearch(query);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: '1rem' }}>
      <input
        type="text"
        placeholder="Search..."
        value={query}
        onChange={handleChange}
        style={{ padding: '0.5rem', width: '100%', boxSizing: 'border-box' }}
      />
    </form>
  );
};

export default SearchBar;
