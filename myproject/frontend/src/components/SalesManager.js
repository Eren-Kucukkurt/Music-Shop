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
      
      {/* Button to navigate to Invoice Viewer */}
      <button onClick={() => navigate('/invoice-viewer')}>View Invoices</button>

      {/* Button to navigate to Refund Management */}
      <button onClick={() => navigate('/refund-management')}>Manage Refunds</button>
      
      {/* Button to navigate to Revenue and Profit Analysis */}
      <button onClick={() => navigate('/salesManager/revenue-analysis')}>Revenue and Profit Analysis</button>
    </div>
  );
};

export default SalesManager;
