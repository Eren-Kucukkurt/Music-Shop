import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar as filledStar } from '@fortawesome/free-solid-svg-icons';
import { faStarHalfAlt as halfStar, faStar as emptyStar } from '@fortawesome/free-regular-svg-icons';
import './ProductListing.css';

export default function ProductListing({ products, isLoading }) {
  if (isLoading) {
    return <p>Loading products...</p>;
  }

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating); // Number of full stars
    const hasHalfStar = rating % 1 >= 0.5; // Determine if there's a half star
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0); // Calculate remaining empty stars

    return (
      <div className="star-rating">
        {[...Array(fullStars)].map((_, index) => (
          <FontAwesomeIcon key={`full-${index}`} icon={filledStar} className="star filled" />
        ))}
        {hasHalfStar && <FontAwesomeIcon icon={halfStar} className="star half" />}
        {[...Array(emptyStars)].map((_, index) => (
          <FontAwesomeIcon key={`empty-${index}`} icon={emptyStar} className="star empty" />
        ))}
      </div>
    );
  };

  return (
    <div className="product-listing-grid">
      {products.length === 0 ? (
        <p>No products found.</p>
      ) : (
        products.map((product) => {
          const rating = parseFloat(product.rating) || 0; // Safeguard against invalid rating
          return (
            <Link to={`/product/${product.id}`} key={product.id} className="product-item-link">
              <div className="product-item">
                <div className="product-image-container">
                  {product.image ? (
                    <img src={product.image} alt={product.name} className="product-image" />
                  ) : (
                    <div className="no-image-placeholder">No Image Available</div>
                  )}
                  {product.quantity_in_stock <= 0 && (
                    <div className="out-of-stock-overlay">Out of Stock</div>
                  )}
                </div>

                <h3 className="product-name">{product.name}</h3>
                <p className="product-price">Price: ${Number(product.price).toFixed(2)}</p>

                {/* Display Rating */}
                {rating > 0 ? (
                  <div className="product-rating">
                    {renderStars(rating)}
                    <span className="rating-value">({rating.toFixed(1)})</span>
                  </div>
                ) : (
                  <p className="no-rating-message">No ratings yet</p>
                )}
              </div>
            </Link>
          );
        })
      )}
    </div>
  );
}

