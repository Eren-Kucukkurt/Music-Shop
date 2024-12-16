import React from 'react';
import { Navigate } from 'react-router-dom';

const withRoleGuard = (WrappedComponent, allowedRoles) => {
  return (props) => {
    const userRole = sessionStorage.getItem('user_role'); // Retrieve the user role from sessionStorage

    if (!userRole) {
      // If no role is found (e.g., unauthenticated users), redirect to UnauthorizedPage
      return <Navigate to="/unauthorized" />;
    }

    if (!allowedRoles.includes(userRole)) {
      // If the user's role is not allowed, redirect to UnauthorizedPage
      return <Navigate to="/unauthorized" />;
    }

    // Render the protected component if the user's role is allowed
    return <WrappedComponent {...props} />;
  };
};

export default withRoleGuard;
