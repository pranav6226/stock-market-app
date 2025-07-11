import React from 'react';

const SearchResults = ({ results }) => {
  if (!results || results.length === 0) {
    return <div className="card"><p>No results found.</p></div>;
  }

  return (
    <div className="card">
      <h2>Search Results</h2>
      <ul>
        {results.map((item) => (
          <li key={item.symbol}>
            <strong>{item.symbol}</strong>: {item.name} ({item.exchange})
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SearchResults;
