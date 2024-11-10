// middleware.js
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

// Middleware component for protected routes
const RequireAuth = () => {
  // Check if the user is logged in (for example, by checking a token in localStorage)
  const isLoggedIn = !!localStorage.getItem('access_token'); // Replace 'token' with your key

  // If user is not logged in, redirect to login page
  return isLoggedIn ? <Outlet /> : <Navigate to="/login" />;
};

export default RequireAuth;





