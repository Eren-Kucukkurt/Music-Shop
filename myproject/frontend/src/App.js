// src/App.js
import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import ShoppingCartComponent from './components/ShoppingCart';
import ProductDetails from './components/ProductDetails';
import RequireAuth from './middleware';

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
        </Routes>
      </div>
    </Router>
  );
}

export default App;
