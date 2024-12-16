import React from 'react';
import { useNavigate } from 'react-router-dom';

const UnauthorizedPage = () => {
  const navigate = useNavigate();

  return (
    <div style={{ textAlign: "center", padding: "50px" }}>
      <h1>Access Denied</h1>
      <p>You do not have permission to access this page.</p>
      <button onClick={() => navigate("/")} className="btn btn-primary">
        Go Back to Dashboard
      </button>
    </div>
  );
};

export default UnauthorizedPage;
