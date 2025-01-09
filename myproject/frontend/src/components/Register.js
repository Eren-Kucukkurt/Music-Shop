import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Register the user
      await axios.post('http://localhost:8000/api/register/', {
        username: username,
        password: password,
        email: email,
      });

      // Redirect to the login page after successful registration
      setMessage('Registration successful!');
      setTimeout(() => {
        navigate('/login');
      }, 2000); // Optional: delay for showing success message
    } catch (error) {
      console.error('There was an error!', error);
      setMessage('Error creating account. Please try again.');
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <div className="card p-4 shadow-lg" style={{ width: '20rem' }}>
        <h2 className="text-center mb-4">Register</h2>
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
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary w-100 mb-3">Register</button>
        </form>
        {message && <p className="mt-3 text-center">{message}</p>}
        <div className="text-center">
          <p className="register-prompt">Already have an account?
            <span className="register-link" onClick={() => navigate('/login')}> Login</span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
