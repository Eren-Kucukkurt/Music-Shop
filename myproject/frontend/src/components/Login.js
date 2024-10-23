import React, { useState } from 'react';
import './Login.css';  // Optional: Create your own CSS to customize further

function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Hardcoded login details
    const hardcodedUsername = 'admin';
    const hardcodedPassword = '1234';

    if (username === hardcodedUsername && password === hardcodedPassword) {
      // Simulate setting a token as in a real API call
      localStorage.setItem('access_token', 'hardcoded_access_token');
      onLoginSuccess();
    } else {
      console.log('Login error: Invalid credentials');
      alert('Invalid credentials');
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <div className="card p-4 shadow-lg" style={{ width: '20rem' }}>
        <h2 className="text-center mb-4">Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Username</label>
            <input
              type="text"
              className="form-control"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary w-100">Login</button>
        </form>
      </div>
    </div>
  );
}

export default Login;
