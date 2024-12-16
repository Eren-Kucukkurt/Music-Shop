import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Login.css';
import { useNavigate, useLocation } from 'react-router-dom';

function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Get the intended path from state (default to '/')
  const from = location.state?.from?.pathname || '/';
  const guestToken = sessionStorage.getItem('guest_token');

  useEffect(() => {
    // Redirect if already logged in
    const token = sessionStorage.getItem('access_token');
    if (token) {
      navigate(from); // Redirect to the intended path or homepage
    }
  }, [navigate, from]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Authenticate user and get tokens
      const response = await axios.post('http://localhost:8000/api/token/', {
        username: username,
        password: password,
      });

      // Store the tokens in sessionStorage
      sessionStorage.setItem('access_token', response.data.access);
      sessionStorage.setItem('refresh_token', response.data.refresh);
      sessionStorage.setItem('username', username);

      // **Store the user's role in sessionStorage**
      sessionStorage.setItem('user_role', response.data.role);

      // **Redirect based on role**
      const userRole = response.data.role;
      if (userRole === 'PRODUCT_MANAGER') {
        navigate('/productManager');
      } else if (userRole === 'SALES_MANAGER') {
        navigate('/salesManager');
      } else {
        navigate('/'); // Redirect to the homepage
      }

      // Merge cart if guestToken exists
      if (guestToken) {
        try {
          await axios.post(
            'http://localhost:8000/cart/merge_cart/',
            {}, // No payload required
            {
              headers: {
                'Authorization': `Bearer ${response.data.access}`,
                'Guest-Token': guestToken,
              },
            }
          );
          //console.log('Cart merged successfully');
        } catch (mergeError) {
          console.error('Error merging cart:', mergeError);
        }
      }

      // Notify parent component (optional)
      if (onLoginSuccess) onLoginSuccess();
    } catch (error) {
      console.error('Login error:', error);
      setError('Invalid username or password');
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <div className="card p-4 shadow-lg" style={{ width: '20rem' }}>
        <h2 className="text-center mb-4">Login</h2>
        <form onSubmit={handleSubmit}>
          {error && <p className="text-danger text-center">{error}</p>}
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
          <button type="submit" className="btn btn-primary w-100 mb-3">Login</button>
        </form>
        <div className="text-center">
          <p className="mb-2">Don't have an account?</p>
          <button
            onClick={() => navigate('/register')}
            className="btn btn-primary w-100"
          >
            Register
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;
