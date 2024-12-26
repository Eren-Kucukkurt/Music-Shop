import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Typography } from '@mui/material';
const Wishlist = () => {
  const [wishlist, setWishlist] = useState(null); // Start with null
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/wishlist/', {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem('access_token')}`,
          },
        });
        setWishlist(response.data); // Set the entire wishlist object
      } catch (error) {
        console.error('Error fetching wishlist:', error);
        setError('Failed to load wishlist. Please try again later.');
        setWishlist({ products: [] }); // Fallback to an empty products array
      }
    };

    fetchWishlist();
  }, []);

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
      <div className="wishlist-items">
        {wishlist.products.map((productId) => (
          <div key={productId} className="wishlist-item">
            <h2>Product ID: {productId}</h2>
            {/* Replace the placeholder below with a fetch to get product details */}
            <p>Product details coming soon...</p>
            <button
              onClick={() => {
                // Placeholder for removing product from wishlist
                console.log(`Remove product with ID: ${productId}`);
              }}
              className="remove-button"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Wishlist;
