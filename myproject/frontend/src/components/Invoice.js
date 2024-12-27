import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Typography } from '@mui/material';
import axios from 'axios';
import './Invoice.css'; // Optional for styling

const Invoice = () => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLatestOrder = async () => {
      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sessionStorage.getItem('access_token')}`,
      };

      try {
        const response = await axios.get('http://localhost:8000/orders/latest/', { headers });
        setOrder(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching latest order:', err);
        setError('Failed to load the invoice.');
        setLoading(false);
      }
    };

    fetchLatestOrder();
  }, []);

  if (loading) return <Typography variant="h6" sx={{ textAlign: 'center', marginTop: 3 }}>
  Loading your invoice...
</Typography>;;
  if (error) return <p className="error-message">{error}</p>;

  return (
    <div className="invoice-container">
      <h1>Payment Successful</h1>
      <p>Thank you for your purchase! Below is your invoice:</p>

      <div className="invoice-details">
        <h2>Invoice #{order.id}</h2>
        <p><strong>Date:</strong> {new Date(order.created_at).toLocaleString()}</p>
        <p><strong>Status:</strong> {order.status}</p>

        <h3>Items Purchased:</h3>
        <ul>
          {order.items.map((item) => (
            <li key={item.id}>
              {item.quantity} x {item.product_name} @ ${parseFloat(item.price).toFixed(2)} each
            </li>
          ))}
        </ul>

        <h3>Total: ${parseFloat(order.total_price).toFixed(2)}</h3>
      </div>

      <button className="return-button" onClick={() => navigate('/')}>
        Return to Dashboard
      </button>
    </div>
  );
};

export default Invoice;
