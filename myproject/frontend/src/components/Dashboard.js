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
  const [username, setUsername] = useState(''); // Add username state
  const dropdownRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [fullProductList, setFullProductList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showFilterOptions, setShowFilterOptions] = useState(false);
  const [maxPrice, setMaxPrice] = useState(1000);
  const [filters, setFilters] = useState({ priceSort: '', priceRange: [0, 1000], inStock: false });
  const navigate = useNavigate();

  const generateGuestToken = () => {
    const token = Math.random().toString(36).substring(2);
    sessionStorage.setItem('guest_token', token);
    return token;
  };

  useEffect(() => {
    const guestToken = sessionStorage.getItem('guest_token') || generateGuestToken();

    // Check if the user is authenticated
    const token = sessionStorage.getItem('access_token');
    setIsAuthenticated(!!token);

    // Retrieve username if authenticated
    if (token) {
      const storedUsername = sessionStorage.getItem('username');
      if (storedUsername) {
        setUsername(storedUsername);
      }
    }

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
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('refresh_token');
    sessionStorage.removeItem('username'); // Clear username
    setIsAuthenticated(false);
    setUsername(''); // Reset username
    window.location.reload();
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
        product.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filters.category) {
      filteredProducts = filteredProducts.filter((product) => product.category === filters.category);
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
    } else if (filters.priceSort === 'popularityHigh') {
      filteredProducts.sort((a, b) => b.popularity - a.popularity);
    } else if (filters.priceSort === 'popularityLow') {
      filteredProducts.sort((a, b) => a.popularity - b.popularity);
    }

    setProducts(filteredProducts);
  };

  const resetFilters = () => {
    const defaultFilters = { priceSort: '', priceRange: [0, maxPrice], inStock: false };
    setFilters(defaultFilters);
    applySearchAndFilters(searchQuery, defaultFilters);
    setShowFilterOptions(false);
  };

  const handleCategoryClick = (category) => {
    const updatedFilters = { ...filters, category };
    setFilters(updatedFilters);
    applySearchAndFilters(searchQuery, updatedFilters);
    setShowCategories(false);
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

          <h2>Sekans Music Shop</h2>
          <p className="welcome-message">
            Welcome{username ? `, ${username}!` : '!'}
          </p>
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
                <li onClick={() => handleCategoryClick('Guitars')}>Guitars</li>
                <li onClick={() => handleCategoryClick('Pianos')}>Pianos</li>
                <li onClick={() => handleCategoryClick('Drums')}>Drums</li>
                <li onClick={() => handleCategoryClick('Wind Instruments')}>Wind Instruments</li>
                <li onClick={() => handleCategoryClick('')}>All Categories</li>
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
