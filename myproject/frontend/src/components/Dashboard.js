import React, { useState, useEffect, useRef } from 'react';
import ProductListing from './ProductListing';
import './Dashboard.css';
import {Link} from 'react-router-dom'; 
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import { faCartShopping } from '@fortawesome/free-solid-svg-icons'


function Dashboard() {
  const [showCategories, setShowCategories] = useState(false);
  const dropdownRef = useRef(null);
  const token = localStorage.getItem('access_token');
  const handleToggleCategories = () => {
    setShowCategories(!showCategories);
  };
  console.log('token', localStorage.getItem('access_token'));
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

        <div className="cart-container">
      
          <Link  to="/shoppingcart" className ="cart-link">
                
            <FontAwesomeIcon icon={faCartShopping} className="cart-icon"/>
            <span className="cart-count">0</span>

          </Link>
          {
            !token ? (
              <Link to= "/login" className="login-button-container">
          
              <span className= "login-button">
                login
              </span>
              

              
              </Link>
                    ) : (
                      <>  </>
                    )
          }
          
          
    
        </div>

        

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
      
          </div>
        </header>
        <ProductListing />
      </div>
    </div>
  );
}

export default Dashboard;
