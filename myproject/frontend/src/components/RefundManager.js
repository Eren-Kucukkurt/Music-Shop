import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Typography } from '@mui/material';
import './RefundManager.css';

const RefundManager = () => {
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${sessionStorage.getItem('access_token')}`,
  };

  // Fetch all refund requests
  const fetchRefunds = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/cart/refunds/', { headers });
      setRefunds(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching refund requests:', err);
      setError('Failed to load refund requests. Please try again.');
      setLoading(false);
    }
  };

  // Approve a refund
  const approveRefund = async (refundId) => {
    try {
      const response = await axios.post(
        `http://localhost:8000/api/cart/approve-refund/${refundId}/`,
        {},
        { headers }
      );
      alert(response.data.success);
      fetchRefunds(); // Refresh refunds after action
    } catch (err) {
      console.error('Error approving refund:', err);
      alert(err.response?.data?.error || 'Failed to approve refund.');
    }
  };

  // Deny a refund
  const denyRefund = async (refundId) => {
    try {
      const response = await axios.post(
        `http://localhost:8000/api/cart/deny-refund/${refundId}/`,
        {},
        { headers }
      );
      alert(response.data.success);
      fetchRefunds(); // Refresh refunds after action
    } catch (err) {
      console.error('Error denying refund:', err);
      alert(err.response?.data?.error || 'Failed to deny refund.');
    }
  };

  useEffect(() => {
    fetchRefunds();
  }, []);

  if (loading) return <Typography variant="h6" sx={{ textAlign: 'center', marginTop: 3 }}>
  Loading refund requests...
</Typography>;
  if (error) return <p className="error-message">{error}</p>;

  return (
    <div className="refund-manager-container">
      <h1>Refund Management</h1>
      {refunds.length === 0 ? (
        <p className="no-refunds-message">No refund requests found.</p>
      ) : (
        <table className="refund-table">
          <thead>
            <tr>
              <th>Refund ID</th>
              <th>Customer</th>
              <th>Product</th>
              <th>Requested Quantity</th>
              <th>Reason</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {refunds.map((refund) => (
              <tr key={refund.id}>
                <td>{refund.id}</td>
                <td>{refund.user}</td>
                <td>{refund.order_item.product_name}</td>
                <td>{refund.requested_quantity}</td>
                <td>{refund.reason}</td>
                <td>{refund.status}</td>
                <td>
                  {refund.status === 'PENDING' && (
                    <>
                      <button
                        className="approve-button"
                        onClick={() => approveRefund(refund.id)}
                      >
                        Approve
                      </button>
                      <button
                        className="deny-button"
                        onClick={() => denyRefund(refund.id)}
                      >
                        Deny
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default RefundManager;
