import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Mockbank.css'; // Optional for styling

const MockBank = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Simulate a delay for payment verification
    const timer = setTimeout(() => {
      navigate('/invoice'); // Redirect to the invoice page
    }, 7000);

    return () => clearTimeout(timer); // Cleanup timer
  }, [navigate]);

  return (
    <div className="mockbank-container">
      <h1>Payment Processing</h1>
      <p>Your payment is being verified by 308Bank...</p>
      <div className="spinner"></div>
    </div>
  );
};

export default MockBank;
