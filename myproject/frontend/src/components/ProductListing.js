
/*
import React from 'react';
import './ProductListing.css';

export default function ProductListing({ products, isLoading }) {
  if (isLoading) {
    return <p>Loading products...</p>;
  }

  return (
    <div className="product-listing-grid">
      {products.length === 0 ? (
        <p>No products found.</p>
      ) : (
        products.map(product => (
          <div key={product.id} className="product-item">
            {product.image ? (
              <img src={product.image} alt={product.name} className="product-image" />
            ) : (
              <div className="no-image-placeholder">No Image Available</div>
            )}
            <h3 className="product-name">{product.name}</h3>
            <p className="product-price">Price: ${Number(product.price).toFixed(2)}</p>
          </div>
        ))
      )}
    </div>
  );
}
*/

import React from 'react';
import './ProductListing.css';
import api from '../api/axiosConfig'; // Adjust the path if necessary

export default function ProductListing({ products, isLoading }) {
  const addToCart = async (productId, quantity = 1) => {
    try {
      const response = await api.post('/cart/add_item/', {
        product_id: productId,
        quantity: quantity,
      });
      alert("Item added to cart!");
      console.log(response.data);
    } catch (error) {
      console.error("Error adding item to cart:", error);
      alert("Could not add item to cart");
    }
  };

  if (isLoading) {
    return <p>Loading products...</p>;
  }

  return (
    <div className="product-listing-grid">
      {products.length === 0 ? (
        <p>No products found.</p>
      ) : (
        products.map(product => (
          <div key={product.id} className="product-item">
            {product.image ? (
              <img src={product.image} alt={product.name} className="product-image" />
            ) : (
              <div className="no-image-placeholder">No Image Available</div>
            )}
            <h3 className="product-name">{product.name}</h3>
            <p className="product-price">Price: ${Number(product.price).toFixed(2)}</p>
            <button onClick={() => addToCart(product.id)} className="add-to-cart-button">
              Add to Cart
            </button>
          </div>
        ))
      )}
    </div>
  );
}
