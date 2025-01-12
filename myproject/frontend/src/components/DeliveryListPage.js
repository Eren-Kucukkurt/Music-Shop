import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './DeliveryListPage.css';

const DeliveryListPage = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDeliveries = async () => {
      try {
        const token = sessionStorage.getItem('access_token');
        const headers = {
          Authorization: `Bearer ${token}`,
        };

        const response = await axios.get('http://localhost:8000/api/deliveries/', { headers });
        setDeliveries(response.data);
      } catch (err) {
        console.error('Error fetching deliveries:', err);
        setError('Failed to load deliveries. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchDeliveries();
  }, []);

  if (loading) return <p>Loading deliveries...</p>;
  if (error) return <p className="error-message">{error}</p>;

  return (
    <div className="delivery-list-container">
      <h1>Delivery List</h1>
      {deliveries.length === 0 ? (
        <p>No deliveries found.</p>
      ) : (
        deliveries.map((delivery) => (
          <div key={delivery.id} className="delivery-card">
            {/* Delivery ID */}
            <p>
              <strong>Delivery ID:</strong> {delivery.id}
            </p>

            {/* Customer ID (fetched from order.user.id if available) */}
            <p>
              <strong>Customer ID:</strong>{' '}
              {delivery.customer_id ? delivery.customer_id : 'N/A'}
            </p>

            {/* Delivery Address */}
            <p>
              <strong>Delivery Address:</strong> {delivery.delivery_address}
            </p>

            {/* Delivery Status */}
            <p>
              <strong>Status:</strong> {delivery.status}
            </p>

            {/* Show total price from the related order */}
            <p>
              <strong>Total Price:</strong> $
              {delivery.total_price ? delivery.total_price.toFixed(2) : '0.00'}
            </p>

            {/* 
              Additional info: We'll show the Order Items from 
              delivery.order_data.items, including product ID, quantity, price, etc.
            */}
            <div className="order-items-section">
              <strong>Order Items:</strong>
              {delivery.order_data && delivery.order_data.items && delivery.order_data.items.length > 0 ? (
                delivery.order_data.items.map((item) => (
                  <div key={item.id} className="order-item-detail">
                    <p>
                      <strong>Product ID:</strong> {item.product}
                    </p>
                    <p>
                      <strong>Product Name:</strong> {item.product_name}
                    </p>
                    <p>
                      <strong>Quantity:</strong> {item.quantity}
                    </p>
                    <p>
                      <strong>Price (this item):</strong> ${item.price}
                    </p>
                    <Link to={`/product/${item.product}`} className="product-link" target="_blank">
                      <img
                        src={item.product_image_url || '/placeholder.png'}
                        alt={item.product_name || 'Deleted Product'}
                        className="order-item-image"
                        onError={(e) => {
                          e.target.src = '/placeholder.png';
                        }}
                      />
                    </Link>
                  </div>
                ))
              ) : (
                <p>No Order Items found.</p>
              )}
            </div>

            {/* Also show the direct "products" field (M2M from Delivery) if needed */}
            <div className="delivery-products-section">
              <strong>Delivery Products (M2M):</strong>
              {delivery.products && delivery.products.length > 0 ? (
                delivery.products.map((prod) => (
                  <div key={prod.id} className="delivery-product-item">
                    <p>Product ID: {prod.id}</p>
                    <p>Product Name: {prod.name}</p>
                    <img
                      src={prod.image_url || '/placeholder.png'}
                      alt={prod.name}
                      className="product-icon"
                      onError={(e) => {
                        e.target.src = '/placeholder.png';
                      }}
                    />
                  </div>
                ))
              ) : (
                <p>No M2M products attached.</p>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default DeliveryListPage;
