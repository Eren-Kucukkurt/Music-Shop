// src/components/Dashboard.js
import React, { useState, useEffect, useRef } from 'react';
import ProductListing from './ProductListing'; // Importing ProductListing component
import FilterPanel from './FilterPanel';
import axios from 'axios';
import './Dashboard.css';
import { Link } from 'react-router-dom'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCartShopping } from '@fortawesome/free-solid-svg-icons';

function Dashboard() {
  const [showCategories, setShowCategories] = useState(false);
  const dropdownRef = useRef(null);
  const token = localStorage.getItem('access_token');
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showFilterOptions, setShowFilterOptions] = useState(false);
  const [maxPrice, setMaxPrice] = useState(1000);
  const [filters, setFilters] = useState({ priceSort: '', priceRange: [0, 1000], inStock: false });

  useEffect(() => {
    fetchAllProducts();
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggleCategories = () => setShowCategories(!showCategories);
  const handleSearchChange = (e) => setSearchQuery(e.target.value);

  const handleSearch = () => applySearchAndFilters(searchQuery, filters);

  const fetchAllProducts = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('http://localhost:8000/api/products/');
      const productsData = response.data;
      setProducts(productsData);
      setMaxPrice(Math.max(...productsData.map(product => Number(product.price) || 0)));
      setFilters(prev => ({ ...prev, priceRange: [0, maxPrice] }));
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setShowCategories(false);
    }
  };

  const toggleFilterOptions = () => setShowFilterOptions(!showFilterOptions);

  const applyFilters = (newFilters) => {
    setFilters(newFilters);
    applySearchAndFilters(searchQuery, newFilters);
    setShowFilterOptions(false);
  };

  const applySearchAndFilters = (searchQuery, filters) => {
    let filteredProducts = [...products];

    if (searchQuery) {
      filteredProducts = filteredProducts.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    filteredProducts = filteredProducts.filter(
      product => Number(product.price) >= filters.priceRange[0] && Number(product.price) <= filters.priceRange[1]
    );

    if (filters.inStock) {
      filteredProducts = filteredProducts.filter(product => product.quantity_in_stock > 0);
    }

    if (filters.priceSort === 'lowToHigh') {
      filteredProducts.sort((a, b) => Number(a.price) - Number(b.price));
    } else if (filters.priceSort === 'highToLow') {
      filteredProducts.sort((a, b) => Number(b.price) - Number(a.price));
    }

    setProducts(filteredProducts);
  };

  const resetFilters = () => {
    const defaultFilters = { priceSort: '', priceRange: [0, maxPrice], inStock: false };
    setFilters(defaultFilters);
    applySearchAndFilters(searchQuery, defaultFilters);
    setShowFilterOptions(false);
  };

  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <h3>Navigation</h3>
        <ul>
          <li><Link to="/">Home</Link></li>
          <li><Link to="/profile">Profile</Link></li>
          <li><Link to="/orders">Orders</Link></li>
          <li><Link to="/settings">Settings</Link></li>
        </ul>
      </aside>
      
      <div className="main-content">
        <header className="header">
          <div className="cart-container">
            <Link to="/shoppingcart" className="cart-link">
              <FontAwesomeIcon icon={faCartShopping} className="cart-icon" />
              <span className="cart-count">0</span>
            </Link>
            {!token && (
              <Link to="/login" className="login-button-container">
                <span className="login-button">Login</span>
              </Link>
            )}
          </div>
          <h2>Dashboard</h2>
          <p className="welcome-message">Welcome!</p>
          <div className="header-actions">
            <input
              type="text"
              placeholder="Search..."
              className="search-bar"
              value={searchQuery}
              onChange={handleSearchChange}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button onClick={handleSearch} className="search-button">Search</button>
            <button onClick={handleToggleCategories} className="categories-btn">Categories</button>
            {showCategories && (
              <div className="categories-dropdown" ref={dropdownRef}>
                <ul>
                  <li>Guitars</li>
                  <li>Pianos</li>
                  <li>Drums</li>
                  <li>Wind Instruments</li>
                </ul>
              </div>
            )}
            <button onClick={toggleFilterOptions} className="filter-button">Filter</button>
            {showFilterOptions && (
              <FilterPanel
                filters={filters}
                maxPrice={maxPrice}
                onApplyFilters={applyFilters}
                resetFilters={resetFilters}
              />
            )}
          </div>
        </header>
        
        {/* Use ProductListing component for product display */}
        <ProductListing products={products} isLoading={isLoading} />
      </div>
    </div>
  );
}

export default Dashboard;
