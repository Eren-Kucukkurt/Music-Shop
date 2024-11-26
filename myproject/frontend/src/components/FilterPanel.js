import React from 'react';
import './FilterPanel.css';

export default function FilterPanel({ filters, maxPrice, onApplyFilters, resetFilters }) {
  const [localFilters, setLocalFilters] = React.useState(filters);

  const handleSortChange = (e) => {
    setLocalFilters({ ...localFilters, priceSort: e.target.value });
  };

  const handleMinPriceChange = (e) => {
    setLocalFilters({
      ...localFilters,
      priceRange: [e.target.value ? Number(e.target.value) : 0, localFilters.priceRange[1]],
    });
  };

  const handleMaxPriceChange = (e) => {
    setLocalFilters({
      ...localFilters,
      priceRange: [localFilters.priceRange[0], e.target.value ? Number(e.target.value) : maxPrice],
    });
  };

  const handleInStockChange = (e) => {
    setLocalFilters({ ...localFilters, inStock: e.target.checked });
  };

  const applyFilters = () => {
    onApplyFilters(localFilters);
  };

  return (
    <div className="filter-panel">
      {/* Sort By Section */}
      <div className="filter-section">
        <h4 className="filter-title">Sort By</h4>
        <select
          className="filter-dropdown"
          onChange={handleSortChange}
          value={localFilters.priceSort}
        >
          <option value="">Select</option>
          <option value="lowToHigh">Price: Low to High</option>
          <option value="highToLow">Price: High to Low</option>
          <option value="popularityHigh">Popularity: High to Low</option>
          <option value="popularityLow">Popularity: Low to High</option>
        </select>
      </div>

      {/* Price Range Section */}
      <div className="filter-section">
        <h4 className="filter-title">Price Range</h4>
        <div className="price-range-container">
          <input
            type="number"
            className="price-input"
            placeholder="Min"
            value={localFilters.priceRange[0] || ''}
            onChange={handleMinPriceChange}
          />
          <input
            type="number"
            className="price-input"
            placeholder="Max"
            value={localFilters.priceRange[1] !== maxPrice ? localFilters.priceRange[1] : ''}
            onChange={handleMaxPriceChange}
          />
        </div>
      </div>

      {/* Stock Status and Buttons Section */}
      <div className="filter-section">
        <h4 className="filter-title">Stock Status</h4>
        <label className="stock-checkbox">
          <input
            type="checkbox"
            onChange={handleInStockChange}
            checked={localFilters.inStock}
          />
          In Stock Only
        </label>
        <div className="filter-actions">
          <button onClick={applyFilters} className="apply-filters-button">Apply</button>
          <button onClick={resetFilters} className="reset-button">Reset</button>
        </div>
      </div>
    </div>
  );
}
