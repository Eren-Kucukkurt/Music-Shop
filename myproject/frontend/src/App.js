import React, { useState } from 'react';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  return (
    <div className="App">
      {isLoggedIn ? (
        <Dashboard />
      ) : showRegister ? (
        <Register />
      ) : (
        <Login onLoginSuccess={handleLoginSuccess} />
      )}

      {/* Toggle between login and registration */}
      {!isLoggedIn && (
        <div className="text-center mt-3">
          <button onClick={() => setShowRegister(!showRegister)} className="btn btn-link">
            {showRegister ? 'Already have an account? Login' : "Don't have an account? Register"}
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
