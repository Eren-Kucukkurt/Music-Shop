import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Typography } from '@mui/material';
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
    return <Typography variant="h6" sx={{ textAlign: 'center', marginTop: 3 }}>
    {error}
  </Typography>;
  }

  if (!wishlist) {
    return <Typography variant="h6" sx={{ textAlign: 'center', marginTop: 3 }}>
      Loading wishlist...
    </Typography>;
  }

  if (wishlist.products.length === 0) {
    return <Typography variant="h6" sx={{ textAlign: 'center', marginTop: 3 }}>
      Your wishlist is empty.
    </Typography>;
  }

  return (
    <div className="wishlist-container">
      <h1>Your Wishlist</h1>
      <div height="100px"/>
      {message && <p className="success-message">{message}</p>}
      <div className="wishlist-items">
        {wishlist.products.map((product) => (
          <div key={product.id} className="wishlist-item">
            <div className="wishlist-image-container">
              <img src={product.image_url || '/placeholder.png'} alt={product.name} className="wishlist-image" />
            </div>
            <div className="wishlist-info">
            <h2>{product.name || 'Unnamed Product'}</h2>
            <p>Category: {product.category_name || 'Uncategorized'}</p>
            <p>In-stock: {product.quantity_in_stock ?? 'Unknown'}</p>
            {product.is_discount_active ? (
              <p className="discount-label">NOW: {product.discount_percentage }% off!</p>
              ) : (
              <p className="discount-label">No discount right now, we will let you know!</p>
              )}
            <div className="price-container">
              {product.is_discount_active ? (
                <>
                  <span className="original-price">
                    ${parseFloat(product.price || 0).toFixed(2)}
                  </span>
                  <span className="discounted-price">
                    ${parseFloat(product.discounted_price || product.price || 0).toFixed(2)}
                  </span>
                </>
              ) : (
                <span className="regular-price">
                  ${parseFloat(product.price || 0).toFixed(2)}
                </span>
              )}
            </div>
            <div className="button-container">
              <button
                onClick={() => addToCart(product.id)}
                className="add-to-cart-button"

                disabled={product.quantity_in_stock <= 0}  
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
            <div className="wishlist-actions">

          </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Wishlist;
