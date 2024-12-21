import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Wishlist.css';

const Wishlist = () => {
  const [wishlist, setWishlist] = useState(null);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/wishlist/', {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem('access_token')}`,
          },
        });
        setWishlist(response.data);
      } catch (error) {
        console.error('Error fetching wishlist:', error);
        setError('Failed to load wishlist. Please try again later.');
        setWishlist({ products: [] });
      }
    };

    fetchWishlist();
  }, []);

  const addToCart = async (productId) => {
    try {
      const response = await axios.post(
        'http://localhost:8000/add-to-cart-from-wishlist/',
        { product_id: productId },
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem('access_token')}`,
          },
        }
      );
      alert(response.data.message); // Notify user on success
    } catch (error) {
      console.error('Error adding product to cart:', error);
      alert('Failed to add product to cart.');
    }
  };
  
  

  const removeFromWishlist = async (productId) => {
    try {
      const response = await axios.delete('http://localhost:8000/api/wishlist/', {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem('access_token')}`,
        },
        data: { product_id: productId },
      });
      setWishlist((prevWishlist) => ({
        ...prevWishlist,
        products: prevWishlist.products.filter((product) => product.id !== productId),
      }));
    } catch (error) {
      console.error('Error removing product from wishlist:', error);
      setError('Failed to remove product from wishlist.');
    }
  };

  if (error) {
    return <p className="error-message">{error}</p>;
  }

  if (!wishlist) {
    return <p>Loading wishlist...</p>;
  }

  if (wishlist.products.length === 0) {
    return <p>Your wishlist is empty!</p>;
  }

  return (
    <div className="wishlist-container">
      <h1>Your Wishlist</h1>
      {message && <p className="success-message">{message}</p>}
      <div className="wishlist-items">
        {wishlist.products.map((product) => (
          <div key={product.id} className="wishlist-item">
            <div className="wishlist-image-container">
              <img src={product.image || '/placeholder.png'} alt={product.name} className="wishlist-image" />
            </div>
            <div className="wishlist-info">
              <h2>{product.name || 'Unnamed Product'}</h2>
              <p>Category: {product.category || 'Uncategorized'}</p>
              <p>Stock: {product.quantity_in_stock ?? 'Unknown'}</p>
              {product.is_discount_active && (
                <>
                  <p>Discount: {product.discount_percentage || 0}%</p>
                  <strong>Now: ${parseFloat(product.discounted_price || product.price || 0).toFixed(2)}</strong>
                </>
              )}
            </div>
            <div className="wishlist-actions">
              <p>Price: ${parseFloat(product.price || 0).toFixed(2)}</p>
              <button
                onClick={() => addToCart(product.id)}
                className="add-to-cart-button"
              >
                Add to Cart
              </button>
              <button
                onClick={() => removeFromWishlist(product.id)}
                className="remove-button"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Wishlist;
