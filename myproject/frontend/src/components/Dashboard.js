import React, { useState, useEffect, useRef } from 'react';
import ProductListing from './ProductListing';
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

  const handleToggleCategories = () => {
    setShowCategories(!showCategories);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      fetchProducts(searchQuery);
    } else {
      fetchAllProducts();  // Reset to all products if search is cleared
    }
  };

  const fetchProducts = async (query) => {
    setIsLoading(true);
    try {
      const response = await axios.get(`http://localhost:8000/api/products/?search=${query}`);
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAllProducts = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('http://localhost:8000/api/products/');
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllProducts();  // Fetch all products when the component mounts

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
          </div>
        </header>
        <ProductListing products={products} isLoading={isLoading} />
      </div>
    </div>
  );
}

export default Dashboard;
