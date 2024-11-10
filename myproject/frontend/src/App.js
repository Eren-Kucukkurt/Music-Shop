import React, { useState } from 'react';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ShoppingCartComponent from './components/ShoppingCart.js';
import RequireAuth from './middleware.js'


function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  
  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  return (
    <Router>
    
    <div className="App">
    <Routes>
     
        
        <Route path="/" element={<Dashboard />}></Route>

        <Route path="/shoppingcart" element={<ShoppingCartComponent />}></Route>
        
      
        <Route path="/register" element={<Register />}></Route>
      
        <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />}></Route>
      
    </Routes>
   
   
    </div>
   
    </Router>
  );
}

export default App;
