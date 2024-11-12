import React, { useState, useEffect, useRef } from 'react';
import ProductListing from './ProductListing';
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
  const [fullProductList, setFullProductList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showFilterOptions, setShowFilterOptions] = useState(false);
  const [maxPrice, setMaxPrice] = useState(1000); // New state to store max price
  const [filters, setFilters] = useState({ priceSort: '', priceRange: [0, 1000], inStock: false });

  const handleToggleCategories = () => {
    setShowCategories(!showCategories);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearch = () => {
    applySearchAndFilters(searchQuery, filters);
  };

  const fetchAllProducts = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('http://localhost:8000/api/products/');
      const productsData = response.data;
      setProducts(productsData);
      setFullProductList(productsData);
      
      // Calculate the max price from the products
      const calculatedMaxPrice = Math.max(...productsData.map(product => product.price));
      setMaxPrice(calculatedMaxPrice);
      setFilters(prevFilters => ({
        ...prevFilters,
        priceRange: [0, calculatedMaxPrice]
      }));
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllProducts(); // Fetch all products on mount

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setShowCategories(false);
    }
  };

  const toggleFilterOptions = () => {
    setShowFilterOptions(!showFilterOptions);
  };

  const applyFilters = (newFilters) => {
    setFilters(newFilters);
    applySearchAndFilters(searchQuery, newFilters); // Combine search and filter
    setShowFilterOptions(false);
  };

  const applySearchAndFilters = (searchQuery, filters) => {
    let filteredProducts = [...fullProductList];

    // Apply search filter
    if (searchQuery) {
      filteredProducts = filteredProducts.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply price range filter
    filteredProducts = filteredProducts.filter(
      product => product.price >= filters.priceRange[0] && product.price <= filters.priceRange[1]
    );

    // Apply in-stock filter
    if (filters.inStock) {
      filteredProducts = filteredProducts.filter(product => product.quantity_in_stock > 0);
    }

    // Apply sorting
    if (filters.priceSort === 'lowToHigh') {
      filteredProducts.sort((a, b) => a.price - b.price);
    } else if (filters.priceSort === 'highToLow') {
      filteredProducts.sort((a, b) => b.price - a.price);
    }

    setProducts(filteredProducts);
  };

  // Reset filters and search
  const resetFilters = () => {
    const defaultFilters = { priceSort: '', priceRange: [0, maxPrice], inStock: false };
    setFilters(defaultFilters);
    applySearchAndFilters(searchQuery, defaultFilters); // Reapply with reset filters and current search query
    setShowFilterOptions(false); // Hide the filter panel if open
  };

  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <h3>Navigation</h3>
        <ul>
          <li><a href="/">Home</a></li>
          <li><a href="/profile">Profile</a></li>
          <li><a href="/orders">Orders</a></li>
          <li><a href="/settings">Settings</a></li>
        </ul>
      </aside>
      <div className="main-content">
        <header className="header">
          <div className="cart-container">
            <Link to="/shoppingcart" className="cart-link">
              <FontAwesomeIcon icon={faCartShopping} className="cart-icon" />
              <span className="cart-count">0</span>
            </Link>
            {!token ? (
              <Link to="/login" className="login-button-container">
                <span className="login-button">login</span>
              </Link>
            ) : (
              <></>
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
            <button onClick={handleToggleCategories} className="categories-btn">
              Categories
            </button>
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
              maxPrice={maxPrice}  // Pass the dynamic max price
              onApplyFilters={applyFilters}
              resetFilters={resetFilters} // Pass the resetFilters function to FilterPanel
            />
            )}
          </div>
        </header>
        <ProductListing products={products} isLoading={isLoading} />
      </div>
    </div>
  );
}

export default Dashboard;
