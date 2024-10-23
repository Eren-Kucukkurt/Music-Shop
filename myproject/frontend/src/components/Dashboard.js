import React, { useState, useEffect, useRef } from 'react';
import ProductListing from './ProductListing';
import './Dashboard.css';

function Dashboard() {
  const [showCategories, setShowCategories] = useState(false);
  const dropdownRef = useRef(null);

  const handleToggleCategories = () => {
    setShowCategories(!showCategories);
  };

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setShowCategories(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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
          <h2>Dashboard</h2>
          <p className="welcome-message">Welcome!</p>
          <div className="header-actions">
            <input type="text" placeholder="Search..." className="search-bar" />
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
            <div className="header-right">
              <button className="categories-btn">Sign In</button> {/* Use btn class here */}
              <button className="categories-btn">Cart</button>
            </div>
          </div>
        </header>
        <ProductListing />
      </div>
    </div>
  );
}

export default Dashboard;
