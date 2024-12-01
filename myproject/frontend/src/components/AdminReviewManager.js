import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminReviewManager.css';

const AdminReviewManager = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch all reviews from the backend
    const fetchReviews = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/admin-reviews/', {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem('access_token')}`,
          },
        });
        setReviews(response.data);
      } catch (err) {
        console.error('Error fetching reviews:', err);
        setError('Failed to fetch reviews');
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  const handleApproval = async (reviewId, isApproved) => {
    // Send approval or rejection to the backend
    try {
      await axios.post(
        'http://localhost:8000/api/admin-reviews/',
        { review_id: reviewId, is_approved: isApproved },
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem('access_token')}`,
          },
        }
      );
      // Update the local state
      setReviews(reviews.map((review) =>
        review.id === reviewId ? { ...review, is_approved: isApproved } : review
      ));
    } catch (err) {
      console.error('Error updating review status:', err);
      setError('Failed to update review approval status');
    }
  };

  if (loading) return <p>Loading reviews...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="admin-review-manager">
      <h2>Manage Reviews</h2>
      {reviews.map((review) => (
        <div key={review.id} className="review-item">
          {/* User Info and Review */}
          <p>
            <strong>User:</strong> {review.username} rated <strong>{review.rating}★</strong>
          </p>
          <p><strong>Comment:</strong> {review.comment}</p>
          
          {/* Product Info */}
          {review.product_details && (
            <div className="product-info">
              <p><strong>Product:</strong> {review.product_details.name}</p>
              <p>
                <strong>Model:</strong> {review.product_details.model} |{' '}
                <strong>Category:</strong> {review.product_details.category}
              </p>
              <p><strong>Price:</strong> ${review.product_details.price.toFixed(2)}</p>
            </div>
          )}

          {/* Approval Status */}
          <p>
            <strong>Status:</strong>{' '}
            {review.is_approved ? (
              <span className="approved">Approved</span>
            ) : (
              <span className="pending">Pending</span>
            )}
          </p>

          {/* Approval Buttons */}
          <div className="review-actions">
            {!review.is_approved && (
              <button
                onClick={() => handleApproval(review.id, true)}
                className="approve-button"
              >
                Approve
              </button>
            )}
            {review.is_approved && (
              <button
                onClick={() => handleApproval(review.id, false)}
                className="reject-button"
              >
                Reject
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default AdminReviewManager;
