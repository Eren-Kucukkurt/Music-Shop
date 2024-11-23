import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './ProductDetails.css';

const ProductDetails = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1); // State to manage quantity

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/products/${productId}/`);
        if (!response.ok) {
          throw new Error("Product not found");
        }
        const data = await response.json();
        setProduct(data);
      } catch (err) {
        setError(err.message);
      }
    };

    const fetchReviews = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/reviews/?product_id=${productId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch reviews");
        }
        const data = await response.json();
        setReviews(data);
      } catch (err) {
        console.error(err);
      }
    };

    Promise.all([fetchProduct(), fetchReviews()]).finally(() => setLoading(false));
  }, [productId]);

  const increaseQuantity = () => setQuantity(prev => Math.min(prev + 1, product?.quantity_in_stock || prev));
  const decreaseQuantity = () => setQuantity(prev => Math.max(prev - 1, 1));

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="product-details-fullpage">
      {product && (
        <div className="product-details">
          <div className="product-image-section">
            <img src={product.image} alt={product.name} className="product-main-image" />
          </div>
          
          <div className="product-info-section">
            <h1 className="product-title">{product.name}</h1>
            <p className="product-code">Product Code: {product.serial_number || "N/A"}</p>
            <p className="product-price">Price: ${Number(product.price || 0).toFixed(2)}</p>
            <p className="product-description">{product.description}</p>
            
            <p className="product-stock">
              {product.quantity_in_stock > 0 ? (
                `In Stock: ${product.quantity_in_stock} available`
              ) : (
                <span className="out-of-stock">Out of Stock</span>
              )}
            </p>

            <div className="product-actions">
              <div className="quantity-selector">
                <button onClick={decreaseQuantity} className="quantity-button">-</button>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  readOnly
                  className="quantity-input"
                />
                <button onClick={increaseQuantity} className="quantity-button">+</button>
              </div>
              <button className="add-to-cart-button">Add to Cart</button>
            </div>

            <p className="delivery-info">Delivery: 1-3 business days</p>

            <div className="product-reviews">
              <h2>Reviews</h2>
              {reviews.length > 0 ? (
                reviews.map(review => (
                  <div key={review.id} className="review-item">
                    <p><strong>{review.username}</strong> rated: {review.rating}★</p>
                    <p>{review.comment}</p>
                    <p className="review-date">{new Date(review.created_at).toLocaleDateString()}</p>
                  </div>
                ))
              ) : (
                <p>No reviews yet for this product.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetails;
