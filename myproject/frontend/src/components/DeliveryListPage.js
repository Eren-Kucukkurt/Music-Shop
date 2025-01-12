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

  const handleStatusChange = async (deliveryId, newStatus) => {
    try {
      const token = sessionStorage.getItem('access_token');
      const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      };
  
      // Use the correct URL for updating the delivery
      const response = await axios.put(
        `http://localhost:8000/api/deliveries/${deliveryId}/`,
        { status: newStatus },
        { headers }
      );
  
      // Update the local state to reflect the new status
      setDeliveries((prevDeliveries) =>
        prevDeliveries.map((delivery) =>
          delivery.id === deliveryId ? { ...delivery, status: newStatus } : delivery
        )
      );
  
      alert(`Delivery status updated to: ${newStatus}`);
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update delivery status. Please try again.');
    }
  };
  

  if (loading) return <p className="loading-message">Loading deliveries...</p>;
  if (error) return <p className="error-message">{error}</p>;

  return (
    <div className="delivery-list-container">
      <h1 className="page-title">Delivery List</h1>
      {deliveries.length === 0 ? (
        <p className="no-deliveries-message">No deliveries found.</p>
      ) : (
        deliveries.map((delivery) => (
          <div key={delivery.id} className="delivery-card">
            <div className="delivery-header">
              <h2>Delivery #{delivery.id}</h2>
              <span className={`status-badge status-${delivery.status.toLowerCase()}`}>
                {delivery.status}
              </span>
            </div>

            <p>
              <strong>Customer ID:</strong> {delivery.customer_id || 'N/A'}
            </p>
            <p>
              <strong>Delivery Address:</strong> {delivery.delivery_address}
            </p>
            <p>
              <strong>Total Price:</strong> $
              {delivery.total_price ? delivery.total_price.toFixed(2) : '0.00'}
            </p>

            <div className="order-items-section">
              <h3>Order Items:</h3>
              {delivery.order_data && delivery.order_data.items && delivery.order_data.items.length > 0 ? (
                <div className="order-items-grid">
                  {delivery.order_data.items.map((item) => (
                    <div key={item.id} className="order-item-card">
                      <ProductImage
                        src={item.product_image_url}
                        alt={item.product_name || 'Deleted Product'}
                      />
                      <p>
                        <strong>Product Name:</strong> {item.product_name}
                      </p>
                      <p>
                        <strong>Quantity:</strong> {item.quantity}
                      </p>
                      <p>
                        <strong>Price:</strong> ${item.price}
                      </p>
                      <Link to={`/product/${item.product}`} className="view-product-button">
                        View Product
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No Order Items found.</p>
              )}
            </div>

            {/* Status Update Dropdown */}
            <div className="status-update-section">
              <label htmlFor={`status-${delivery.id}`}>
                <strong>Update Status:</strong>
              </label>
              <select
                id={`status-${delivery.id}`}
                value={delivery.status}
                onChange={(e) => handleStatusChange(delivery.id, e.target.value)}
              >
                <option value="PENDING">Pending</option>
                <option value="IN-TRANSIT">In-Transit</option>
                <option value="DELIVERED">Delivered</option>
                <option value="CANCELED">Canceled</option>
              </select>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

const ProductImage = ({ src, alt }) => {
  const [imageError, setImageError] = useState(false);

  return (
    <img
      src={!imageError ? src : '/placeholder.png'}
      alt={alt}
      className="product-icon"
      onError={() => setImageError(true)}
    />
  );
};

export default DeliveryListPage;
