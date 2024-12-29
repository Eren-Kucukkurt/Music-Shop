import React, { useState, useEffect, useRef } from 'react';
import ProductListing from './ProductListing';
import FilterPanel from './FilterPanel';
import axios from 'axios';
import './Dashboard.css';
import { Link, useNavigate } from 'react-router-dom'; 
import Footer from './Footer'; // Import Footer
import { useLocation } from 'react-router-dom';


function Dashboard({ isAuthenticated, setIsAuthenticated, username, setUsername, onSearch }) {
  const [showCategories, setShowCategories] = useState(false);
  const [showLoginDropdown, setShowLoginDropdown] = useState(false);
  //const [isAuthenticated, setIsAuthenticated] = useState(false); // Track authentication state
  //const [username, setUsername] = useState(''); // Add username state
  const dropdownRef = useRef(null);

  const [products, setProducts] = useState([]);
  const [fullProductList, setFullProductList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showFilterOptions, setShowFilterOptions] = useState(true);
  const [maxPrice, setMaxPrice] = useState(1000);
  const [filters, setFilters] = useState({ priceSort: '', priceRange: [0, 1000], inStock: false });
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const navigate = useNavigate();
  const location = useLocation(); 

  const generateGuestToken = () => {
    const token = Math.random().toString(36).substring(2);
    sessionStorage.setItem('guest_token', token);
    return token;
  };

  useEffect(() => {
    // Fetch products and handle query changes
    const fetchInitialData = async () => {
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

      const queryFromNavbar = location.state?.searchQuery ?? ''; // Handle undefined as an empty string
      setSearchQuery(queryFromNavbar); // Store the query locally
      applySearchAndFilters(queryFromNavbar, filters); // Apply the query immediately
    };

    fetchInitialData();

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

  useEffect(() => {
    // Handle changes in the query from the Navbar
    const queryFromNavbar = location.state?.searchQuery ?? ''; // Handle undefined as an empty string
    setSearchQuery(queryFromNavbar); // Store the query locally
    applySearchAndFilters(queryFromNavbar, filters); // Apply the query immediately
  }, [location.state?.searchQuery]);

    // Wait for products to load before applying filters
  useEffect(() => {
    if (fullProductList.length > 0) {
      applySearchAndFilters(searchQuery, filters);
    }
  }, [fullProductList, searchQuery, filters]);


  const fetchAllProducts = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('http://localhost:8000/api/products/');
      const productsData = response.data;
      setProducts(productsData);
      setFullProductList(productsData);
      setFilteredProducts(productsData);
  
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



  const applyFilters = (newFilters) => {
    setFilters(newFilters);
    applySearchAndFilters(searchQuery, newFilters);
    //setShowFilterOptions(false);
  };

  const applySearchAndFilters = (searchQuery, filters) => {

    //if (!fullProductList.length) return; // Wait until products are fetched
    //console.log('Search Query inside apply function:', searchQuery);
    let updatedProducts = [...fullProductList];

    if (searchQuery.trim() !== '') {
      updatedProducts = updatedProducts.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filters.category) {
      updatedProducts = updatedProducts.filter(product => product.category === filters.category);
    }

    updatedProducts = updatedProducts.filter(
      product => product.price >= filters.priceRange[0] && product.price <= filters.priceRange[1]
    );

    if (filters.inStock) {
      updatedProducts = updatedProducts.filter(product => product.quantity_in_stock > 0);
    }

    if (filters.priceSort === 'lowToHigh') {
      updatedProducts.sort((a, b) => a.price - b.price);
    } else if (filters.priceSort === 'highToLow') {
      updatedProducts.sort((a, b) => b.price - a.price);
    } else if (filters.priceSort === 'popularityHigh') {
      updatedProducts.sort((a, b) => b.popularity - a.popularity);
    } else if (filters.priceSort === 'popularityLow') {
      updatedProducts.sort((a, b) => a.popularity - b.popularity);
    }

    //console.log('Filtered Products:', updatedProducts);
    setFilteredProducts(updatedProducts);
  };

  const resetFilters = () => {
    const defaultFilters = { priceSort: '', priceRange: [0, maxPrice], inStock: false };
    setFilters(defaultFilters);
    applySearchAndFilters(searchQuery, defaultFilters);
    //setShowFilterOptions(false);
  };

  const handleCategoryClick = (category) => {
    const updatedFilters = { ...filters, category };
    setFilters(updatedFilters);
    applySearchAndFilters(searchQuery, updatedFilters);
    setShowCategories(false);
  };



  const toggleFilterOptions = () => {
    setShowFilterOptions(!showFilterOptions);
  };



  return (
    <div>
    <div className="dashboard-container">
      
       
      {showFilterOptions && (
        <FilterPanel
          filters={filters}
          maxPrice={maxPrice}
          onApplyFilters={applyFilters}
          resetFilters={resetFilters}
          onCategorySelect={handleCategoryClick} 
        />
      )}
      <div className="main-content">
        <header className="header">

        <h2 className="shop-heading">Find Your Sequence</h2>
          <p className="welcome-message">
            Welcome{username ? `, ${username}!` : '!'}
          </p>
          <div className="header-actions">

            <button onClick={toggleFilterOptions} className="filter-button">Filters and Categories</button>
            {showCategories && (
              <div className="categories-dropdown" ref={dropdownRef}>
                <ul>
                  <li onClick={() => handleCategoryClick('Guitars')}>Guitars</li>
                  <li onClick={() => handleCategoryClick('Pianos')}>Pianos</li>
                  <li onClick={() => handleCategoryClick('Drums')}>Drums</li>
                  <li onClick={() => handleCategoryClick('Electric Guitars')}>Wind Instruments</li>
                  <li onClick={() => handleCategoryClick('')}>All Categories</li>
                </ul>
              </div>
            )}
          
          </div>
        </header>
        <ProductListing products={filteredProducts} isLoading={isLoading} />

      </div>
     

    </div>
    <Footer /> 
    </div>
  );
}

export default Dashboard;
