// src/App.js
import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import ShoppingCartComponent from './components/ShoppingCart';
import ProductDetails from './components/ProductDetails';
import RequireAuth from './middleware';
import AdminRoute from './components/AdminRoute';
import AddProductForm from './components/AddProductForm';
import AdminReviewManager from './components/AdminReviewManager.js';
import Checkout from './components/Checkout'; // Import the Checkout component

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/shoppingcart" element={<ShoppingCartComponent />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />
          <Route path="/product/:productId" element={<ProductDetails />} />
          <Route path="/admin/add-product" element={<AdminRoute><AddProductForm /></AdminRoute>} />
          <Route path="/admin/reviews" element={<AdminRoute><AdminReviewManager /></AdminRoute>} />
          <Route path="/checkout" element={<Checkout />} /> {/* Add this route */}
          
        </Routes>
      </div>
    </Router>
  );
}

export default App;
