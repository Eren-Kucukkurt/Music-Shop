import React, { useState, useEffect, useRef } from 'react';
import ProductListing from './ProductListing';
import FilterPanel from './FilterPanel';
import axios from 'axios';
import './Dashboard.css';
import { Link, useNavigate } from 'react-router-dom'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCartShopping, faUser } from '@fortawesome/free-solid-svg-icons';

function Dashboard() {
  const [showCategories, setShowCategories] = useState(false);
  const [showLoginDropdown, setShowLoginDropdown] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Track authentication state
  const dropdownRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [fullProductList, setFullProductList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showFilterOptions, setShowFilterOptions] = useState(false);
  const [maxPrice, setMaxPrice] = useState(1000);
  const [filters, setFilters] = useState({ priceSort: '', priceRange: [0, 1000], inStock: false });
  const navigate = useNavigate();

  useEffect(() => {
    // Check if the user is authenticated (based on token existence in sessionStorage)
    const token = sessionStorage.getItem('access_token');
    setIsAuthenticated(!!token); // Set authentication state
    fetchAllProducts();
  
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowLoginDropdown(false);
        setShowCategories(false);
      }
    };
  
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);  

  const fetchAllProducts = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('http://localhost:8000/api/products/');
      const productsData = response.data;
      setProducts(productsData);
      setFullProductList(productsData);
      
      const calculatedMaxPrice = Math.max(...productsData.map(product => product.price));
      setMaxPrice(calculatedMaxPrice);
      setFilters(prevFilters => ({
        ...prevFilters,
        priceRange: [0, calculatedMaxPrice],
      }));
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('access_token'); // Clear access token
    sessionStorage.removeItem('refresh_token'); // Clear refresh token (if used)
    setIsAuthenticated(false); // Update state
    window.location.reload(); // Refresh to update UI (optional)
  };

  const handleToggleCategories = () => {
    setShowCategories(!showCategories);
  };
  const applyFilters = (newFilters) => {
    setFilters(newFilters);
    applySearchAndFilters(searchQuery, newFilters);
    setShowFilterOptions(false);
  };
    
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearch = () => {
    applySearchAndFilters(searchQuery, filters);
  };

  const applySearchAndFilters = (searchQuery, filters) => {
    let filteredProducts = [...fullProductList];
  
    if (searchQuery) {
      filteredProducts = filteredProducts.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase()) // Include description in search
      );
    }
  
    filteredProducts = filteredProducts.filter(
      product => product.price >= filters.priceRange[0] && product.price <= filters.priceRange[1]
    );
  
    if (filters.inStock) {
      filteredProducts = filteredProducts.filter(product => product.quantity_in_stock > 0);
    }
  
    if (filters.priceSort === 'lowToHigh') {
      filteredProducts.sort((a, b) => a.price - b.price);
    } else if (filters.priceSort === 'highToLow') {
      filteredProducts.sort((a, b) => b.price - a.price);
    }
  
    setProducts(filteredProducts);
  };  

  const resetFilters = () => {
    const defaultFilters = { priceSort: '', priceRange: [0, maxPrice], inStock: false };
    setFilters(defaultFilters);
    applySearchAndFilters(searchQuery, defaultFilters);
    setShowFilterOptions(false);
  };

  const toggleLoginDropdown = () => {
    setShowLoginDropdown(!showLoginDropdown);
  };

  const toggleFilterOptions = () => {
    setShowFilterOptions(!showFilterOptions);
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

            {!isAuthenticated ? (
              <div className="login-register-container" ref={dropdownRef}>
                <FontAwesomeIcon
                  icon={faUser}
                  onClick={toggleLoginDropdown}
                  className="user-icon"
                />
                <span className="login-register-text" onClick={toggleLoginDropdown}>
                  Login or Register
                </span>
                {showLoginDropdown && (
                  <div className="login-dropdown">
                    <Link to="/login" className="dropdown-link">Login</Link>
                    <Link to="/register" className="dropdown-link">Register</Link>
                  </div>
                )}
              </div>
            ) : (
              <div className="logout-container">
                <FontAwesomeIcon icon={faUser} className="user-icon" />
                <button onClick={handleLogout} className="logout-button">
                  Logout
                </button>
              </div>
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
                maxPrice={maxPrice}
                onApplyFilters={applyFilters}
                resetFilters={resetFilters}
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
