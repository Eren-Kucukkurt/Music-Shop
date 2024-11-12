// src/components/ProductListing.js
import React from 'react';
import { Link } from 'react-router-dom';
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
          <Link to={`/product/${product.id}`} key={product.id} className="product-item-link">
            <div className="product-item">
              {product.image ? (
                <img src={product.image} alt={product.name} className="product-image" />
              ) : (
                <div className="no-image-placeholder">No Image Available</div>
              )}
              <h3 className="product-name">{product.name}</h3>
              <p className="product-price">Price: ${Number(product.price).toFixed(2)}</p>
            </div>
          </Link>
        ))
      )}
    </div>
  );
}
