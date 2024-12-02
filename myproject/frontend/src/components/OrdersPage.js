import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './OrdersPage.css';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${sessionStorage.getItem('access_token')}`,
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get('http://localhost:8000/orders/', { headers });
        const parsedOrders = response.data.map(order => ({
          ...order,
          total_price: parseFloat(order.total_price),
          items: order.items.map(item => ({
            ...item,
            price: parseFloat(item.price),
            image: item.product_image, // Ensure backend provides the image
            name: item.product_name, // Ensure backend provides the product name
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

    fetchOrders();
  }, []);

  if (loading) return <p>Loading orders...</p>;
  if (error) return <p className="error-message">{error}</p>;

  return (
    <div className="orders-page-container">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <h3>Navigation</h3>
        <ul>
          <li><a href="/">Home</a></li>
          <li><a href="/profile">Profile</a></li>
          <li><a href="/orders">Orders</a></li>
          <li><a href="/settings">Settings</a></li>
        </ul>
      </aside>

      {/* Orders Content */}
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
                {order.items.map(item => (
                  <div key={item.id} className="order-item-detail">
                    <p>
                      {item.quantity} x Product {item.product} @ ${item.price.toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
