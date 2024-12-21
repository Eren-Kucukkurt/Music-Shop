import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './ProductDetails.css';
import ReviewForm from './ReviewForm';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar as filledStar } from '@fortawesome/free-solid-svg-icons';
import { faStarHalfAlt as halfStar, faStar as emptyStar } from '@fortawesome/free-regular-svg-icons';
// KurtarmaRampasi
const ProductDetails = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [nextPage, setNextPage] = useState(null); // Track the next page of reviews
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false); // For "Load More" button
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [cartMessage, setCartMessage] = useState(null); // For feedback messages

  const fetchProduct = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/products/${productId}/`);
      if (!response.ok) {
        throw new Error("Product not found");
      }
      const data = await response.json();
      //console.log(data);
      setProduct(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchReviews = async (url, isInitialLoad = false) => {
    try {
      setLoadingMore(true); // Show loading spinner for "Load More"
      const response = await fetch(url || `http://localhost:8000/api/reviews/?product_id=${productId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch reviews");
      }
      const data = await response.json();

      // Replace reviews on initial load, append reviews on "Load More"
      setReviews(prev => (isInitialLoad ? data.results : [...prev, ...data.results]));
      setNextPage(data.next); // Update the next page URL
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMore(false);
    }
  };


  const handleAddToCart = async () => {
    try {
      const accessToken = sessionStorage.getItem('access_token'); // For logged-in users
      const guestToken = sessionStorage.getItem('guest_token') || generateGuestToken(); // For guest users
  
      // Prepare headers
      const headers = {
        'Content-Type': 'application/json',
      };
  
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      } else {
        headers['Guest-Token'] = guestToken;
      }

      //console.log('quantity:', quantity);

      // Make the API call
      const response = await axios.post(
        'http://localhost:8000/cart/add_item/',
        {
          product_id: productId,
          quantity: quantity,
        },
        {
          headers: headers, // Include the headers in the request
        }
      );
  
      // Handle the response
      setCartMessage(response.data.message); // Display success message

    } catch (err) {
      console.error('Error adding item to cart:', err);
      setCartMessage('Failed to add item to cart. Please try again.');
    }
  };
  const generateGuestToken = () => {
    const token = Math.random().toString(36).substring(2);
    sessionStorage.setItem('guest_token', token);
    return token;
  };
  
  
  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchProduct(),
      fetchReviews(null, true), // Pass `isInitialLoad = true`
    ]).finally(() => setLoading(false));
  }, [productId]);

  const increaseQuantity = () => setQuantity(prev => Math.min(prev + 1, product?.quantity_in_stock || prev));
  const decreaseQuantity = () => setQuantity(prev => Math.max(prev - 1, 1));

  const handleReviewSubmitted = () => {
    setReviews([]); // Clear existing reviews
    fetchReviews(null, true); // Reload reviews after a new review is submitted
  };

  const loadMoreReviews = () => {
    if (nextPage) {
      fetchReviews(nextPage);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;
  const rating = parseFloat(product.rating) || 0;

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

  const handleAddToWishlist = async () => {
    try {
      const accessToken = sessionStorage.getItem('access_token');
  
      if (!accessToken) {
        alert("You need to log in to add items to your wishlist.");
        return;
      }
  
      const response = await axios.post(
        'http://localhost:8000/api/wishlist/',
        { product_id: productId },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
  
      alert(response.data.message || "Product added to wishlist!");
    } catch (error) {
      console.error('Error adding product to wishlist:', error);
      alert('Failed to add product to wishlist. Please try again.');
    }
  };
  

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

            {/* Display Rating */}
            {rating > 0 ? (
              <div className="product-rating">
                {renderStars(rating)}
                <span className="rating-value">({rating.toFixed(1)})</span>
              </div>
            ) : (
              <p className="no-rating-message">No ratings yet</p>
            )}
            <p className="product-price">Price: ${Number(product.price || 0).toFixed(2)}</p>
            <p className="product-description">{product.description}</p>
            <p className="product-model">Product Model: {product.model || "Not Specified"}</p> {/* Add Model */}
            <p className="product-warranty">Warranty: {product.warranty || "No Warranty"}</p> {/* Add Warranty */}

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
                  disabled={quantity <= 1}
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
                  disabled={quantity >= (product?.quantity_in_stock || 0)}
                >
                  +
                </button>
              </div>

              <div className="action-buttons">
                <button
                  onClick={handleAddToCart}
                  className="add-to-cart-button"
                  disabled={product.quantity_in_stock <= 0}
                >
                  {product.quantity_in_stock > 0 ? "Add to Cart" : "Out of Stock"}
                </button>

                <button
                  onClick={handleAddToWishlist}
                  className="add-to-wishlist-button"
                >
                  Add to Wishlist
                </button>
              </div>
          </div>



            {cartMessage && (
              <div className="cart-message-container">
                <p className="cart-message">{cartMessage}</p>
                <button
                  onClick={() => (window.location.href = "http://localhost:3000/shoppingcart")}
                  className="go-to-cart-button"
                >
                  Go to Cart
                </button>
              </div>
            )}

            <p className="delivery-info">Delivery: 1-3 business days</p>

            <div className="product-reviews">
              <h2>Reviews</h2>
              {reviews.length > 0 ? (
                <>
                  {reviews.map(review => (
                    <div key={review.id} className="review-item">
                      <p><strong>{review.username}</strong> rated: {review.rating}★</p>
                      <p>{review.comment}</p>
                      <p className="review-date">{new Date(review.created_at).toLocaleDateString()}</p>
                    </div>
                  ))}
                  {nextPage && (
                    <button
                      onClick={loadMoreReviews}
                      disabled={loadingMore}
                      className="load-more-button"
                    >
                      {loadingMore ? "Loading..." : "Load More Reviews"}
                    </button>
                  )}
                </>
              ) : (
                <p>No reviews yet for this product.</p>
              )}
            </div>

            <div className="review-form-section">
              <ReviewForm productId={productId} onReviewSubmitted={handleReviewSubmitted} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetails;
