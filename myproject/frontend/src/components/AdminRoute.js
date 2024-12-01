import React from 'react';
import { Navigate } from 'react-router-dom';

const AdminRoute = ({ children }) => {
  const token = sessionStorage.getItem('access_token');
  // const isAdmin = sessionStorage.getItem('is_admin'); Commented out for now

  console.log('Token:', token); // Check if token exists
  // console.log('Is Admin:', isAdmin); // Check admin status

  if (!token) {
    console.log('Redirecting to login...');
    return <Navigate to="/login" />;
  }

  return children;
};

export default AdminRoute;
