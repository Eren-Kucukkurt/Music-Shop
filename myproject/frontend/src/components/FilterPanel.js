import React from 'react';
import './Dashboard.css';

export default function FilterPanel({ filters, maxPrice, onApplyFilters, resetFilters }) {
  const [localFilters, setLocalFilters] = React.useState(filters);

  const handlePriceSortChange = (e) => {
    setLocalFilters({ ...localFilters, priceSort: e.target.value });
  };

  const handleMinPriceChange = (e) => {
    setLocalFilters({ ...localFilters, priceRange: [Number(e.target.value), localFilters.priceRange[1]] });
  };

  const handleMaxPriceChange = (e) => {
    setLocalFilters({ ...localFilters, priceRange: [localFilters.priceRange[0], Number(e.target.value)] });
  };

  const handleInStockChange = (e) => {
    setLocalFilters({ ...localFilters, inStock: e.target.checked });
  };

  const applyFilters = () => {
    onApplyFilters(localFilters);
  };

  return (
    <div className="filter-options">
      <h4>Sort by Price</h4>
      <select onChange={handlePriceSortChange} value={localFilters.priceSort}>
        <option value="">Select</option>
        <option value="lowToHigh">Low to High</option>
        <option value="highToLow">High to Low</option>
      </select>

      <h4>Price Range</h4>
      <input
        type="number"
        placeholder="Min"
        onChange={handleMinPriceChange}
        value={localFilters.priceRange[0]}
      />
      <input
        type="number"
        placeholder="Max"
        onChange={handleMaxPriceChange}
        value={localFilters.priceRange[1]}
        max={maxPrice}
      />

      <h4>Stock Status</h4>
      <label>
        <input
          type="checkbox"
          onChange={handleInStockChange}
          checked={localFilters.inStock}
        />
        In Stock Only
      </label>

      <button onClick={applyFilters} className="apply-filters-button">Apply Filters</button>
      <button onClick={resetFilters} className="reset-button">Reset</button>
    </div>
  );
}
