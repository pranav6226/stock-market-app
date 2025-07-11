import React, { useState } from 'react';

const FilterPanel = ({ filters, onFilterChange }) => {
  const [localFilters, setLocalFilters] = useState(filters || {});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const updatedFilters = { ...localFilters, [name]: value };
    setLocalFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  return (
    <div className="card">
      <h2>Filters</h2>
      <form>
        <div>
          <label htmlFor="marketCap">Market Cap &gt;= </label>
          <input
            type="number"
            name="marketCap"
            id="marketCap"
            value={localFilters.marketCap || ''}
            onChange={handleInputChange}
            placeholder="e.g., 1000000000"
          />
        </div>
        <div>
          <label htmlFor="sector">Sector</label>
          <input
            type="text"
            name="sector"
            id="sector"
            value={localFilters.sector || ''}
            onChange={handleInputChange}
            placeholder="e.g., Technology"
          />
        </div>
      </form>
    </div>
  );
};

export default FilterPanel;
