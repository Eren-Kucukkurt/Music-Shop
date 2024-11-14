// src/components/ProductDetails.js
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './ProductDetails.css';

const ProductDetails = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
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
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [productId]);

  // Update quantity based on button clicks
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
            <div className="product-thumbnail-section">
              <img src={product.image} alt="thumbnail" className="product-thumbnail" />
            </div>
          </div>
          
          <div className="product-info-section">
            <h1 className="product-title">{product.name}</h1>
            <p className="product-code">Product Code: {product.serial_number || "N/A"}</p>
            <p className="product-price">Price: ${Number(product.price || 0).toFixed(2)}</p>
            <p className="product-description">{product.description}</p>
            
            {/* Display Stock Information */}
            <p className="product-stock">
              {product.quantity_in_stock > 0 ? (
                `In Stock: ${product.quantity_in_stock} available`
              ) : (
                <span className="out-of-stock">Sold out.</span>
              )}
            </p>
  
            <div className="product-actions">
              <div className="quantity-selector">
                <button
                  onClick={decreaseQuantity}
                  className="quantity-button"
                  disabled={product.quantity_in_stock <= 0}
                >
                  -
                </button>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  readOnly
                  className="quantity-input"
                />
                <button
                  onClick={increaseQuantity}
                  className="quantity-button"
                  disabled={product.quantity_in_stock <= 0}
                >
                  +
                </button>
              </div>
              <button
                className="add-to-cart-button"
                disabled={product.quantity_in_stock <= 0}
              >
                {product.quantity_in_stock > 0 ? "Add to Cart" : "Out of Stock"}
              </button>
            </div>
            
            <p className="delivery-info">Delivery: 1-3 business days</p>
          </div>
        </div>
      )}
    </div>
  );  
};

export default ProductDetails;
