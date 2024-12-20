import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './OrdersPage.css';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refundDetails, setRefundDetails] = useState({});

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${sessionStorage.getItem('access_token')}`,
  };

  const fetchOrders = async () => {
    try {
      const response = await axios.get('http://localhost:8000/orders/', { headers });
      const parsedOrders = response.data.map(order => ({
        ...order,
        total_price: parseFloat(order.total_price),
        items: order.items.map(item => ({
          ...item,
          price: parseFloat(item.price),
          refundable_quantity: item.quantity - (item.refunded_quantity || 0),
        })),
      }));
      setOrders(parsedOrders);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to load orders. Please try again.');
      setLoading(false);
    }
  };

  const cancelOrder = async (orderId) => {
    try {
      const response = await axios.post(
        `http://localhost:8000/api/cart/cancel-order/${orderId}/`,
        {},
        { headers }
      );
      alert(response.data.success);
      fetchOrders();
    } catch (error) {
      console.error('Error canceling order:', error);
      alert(error.response?.data?.error || 'Failed to cancel the order.');
    }
  };

  const requestRefund = async (orderItemId) => {
    try {
      const { quantity, reason } = refundDetails[orderItemId] || {};
      if (!quantity || !reason) {
        alert('Please provide a valid quantity and reason for the refund.');
        return;
      }

      const response = await axios.post(
        `http://localhost:8000/api/cart/request-refund/${orderItemId}/`,
        { quantity, reason },
        { headers }
      );
      alert(response.data.success);
      fetchOrders();
    } catch (error) {
      console.error('Error requesting refund:', error);
      alert(error.response?.data?.error || 'Failed to request a refund.');
    }
  };

  const handleRefundChange = (orderItemId, field, value) => {
    setRefundDetails((prev) => ({
      ...prev,
      [orderItemId]: {
        ...prev[orderItemId],
        [field]: value,
      },
    }));
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading) return <p>Loading orders...</p>;
  if (error) return <p className="error-message">{error}</p>;

  return (
    <div className="orders-page-container">


      <div className="orders-page-content">
        <h1 className="page-title">Your Orders</h1>
        {orders.length === 0 ? (
          <p className="no-orders-message">No orders found.</p>
        ) : (
          <div className="orders-container">
            {orders.map(order => (
              <div key={order.id} className="order-card">
                <p><strong>Order ID:</strong> {order.id}</p>
                <p><strong>Total Price:</strong> ${order.total_price.toFixed(2)}</p>
                <p><strong>Status:</strong> {order.status}</p>
                <p><strong>Order Date:</strong> {new Date(order.created_at).toLocaleString()}</p>
                <div>
                  <strong>Items:</strong>
                  {order.items.map(item => {
                    const productExists = item.product !== null && item.product !== undefined;

                    return (
                      <div key={item.id} className="order-item-detail">
                        {productExists ? (
                          <Link to={`/product/${item.product}`} target="_blank" rel="noopener noreferrer">
                            <img
                              src={item.product_image_url || '/placeholder.png'}
                              alt={item.product_name || 'Deleted Product'}
                              className="order-item-image"
                            />
                          </Link>
                        ) : (
                          <img
                            src={item.product_image_url || '/placeholder.png'}
                            alt={item.product_name || 'Deleted Product'}
                            className="order-item-image"
                          />
                        )}
                        <p>
                          {item.quantity} x {item.product_name || 'Deleted Product'} @ ${item.price.toFixed(2)}
                        </p>
                        <p><strong>Refundable:</strong> {item.refundable_quantity} / {item.quantity}</p>
                        {order.status === 'DELIVERED' && item.refundable_quantity > 0 && (
                          <div className="refund-section">
                            <input
                              type="number"
                              min="1"
                              max={item.refundable_quantity}
                              placeholder="Quantity"
                              value={refundDetails[item.id]?.quantity || ''}
                              onChange={(e) =>
                                handleRefundChange(item.id, 'quantity', Number(e.target.value))
                              }
                            />
                            <input
                              type="text"
                              placeholder="Reason for refund"
                              value={refundDetails[item.id]?.reason || ''}
                              onChange={(e) =>
                                handleRefundChange(item.id, 'reason', e.target.value)
                              }
                            />
                            <button
                              className="refund-button"
                              onClick={() => requestRefund(item.id)}
                            >
                              Request Refund
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                {order.status === 'PROCESSING' && (
                  <button
                    className="cancel-order-button"
                    onClick={() => cancelOrder(order.id)}
                  >
                    Cancel Order
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
