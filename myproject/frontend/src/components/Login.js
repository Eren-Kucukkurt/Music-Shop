import React, { useState } from 'react';
import axios from 'axios';
import './Login.css';  // Optional: Create your own CSS to customize further
import { useNavigate } from 'react-router-dom';

function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const handleSubmit = (e) => {
    e.preventDefault();

    // Hardcoded admin credentials
    if (username === 'admin' && password === '12345678') {


      alert('Logged in as admin');
      localStorage.setItem('access_token', 'hardcoded_admin_token');
      onLoginSuccess();
      navigate('/');
      console.log('token', localStorage.getItem('access_token'));
      return;
    }
    
    // If not hardcoded user, proceed with API login
    axios.post('http://localhost:8000/api/login/', {
      username: username,
      password: password,
    })
    .then(response => {
      localStorage.setItem('access_token', response.data.access);
      onLoginSuccess();
    })
    .catch(error => {
      console.log('Login error', error);
      alert('Invalid credentials');
    });
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
