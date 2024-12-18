import React from 'react';
import { useNavigate } from 'react-router-dom';
import './SalesManager.css';

const SalesManager = () => {
  const navigate = useNavigate();

  return (
    <div>
      <h1>Sales Manager Dashboard</h1>
      <p>Welcome to the Sales Manager's dashboard.</p>

      {/* Button to navigate to Discount Management */}
      <button onClick={() => navigate('/product-management')}>Manage Products</button>
    </div>
  );
};

export default SalesManager;
