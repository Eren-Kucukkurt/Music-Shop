import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Typography } from '@mui/material';
import './AdminReviewManager.css';

const AdminReviewManager = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate(); // Hook to navigate back

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

  const handleAction = async (reviewId, action) => {
    // Send approval, rejection, or pending update to the backend
    try {
      await axios.post(
        'http://localhost:8000/api/admin-reviews/',
        { review_id: reviewId, action },
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem('access_token')}`,
          },
        }
      );
      // Update the local state
      if (action === 'approve') {
        setReviews(reviews.map((review) =>
          review.id === reviewId ? { ...review, is_approved: true } : review
        ));
      } else if (action === 'reject') {
        setReviews(reviews.filter((review) => review.id !== reviewId)); // Remove the rejected review
      } else if (action === 'pending') {
        setReviews(reviews.map((review) =>
          review.id === reviewId ? { ...review, is_approved: false } : review
        ));
      }
    } catch (err) {
      console.error(`Error performing ${action} action on review:`, err);
      setError(`Failed to ${action} review`);
    }
  };

  const confirmReject = (reviewId) => {
    if (window.confirm("Are you sure you want to reject and delete this review?")) {
      handleAction(reviewId, 'reject');
    }
  };

  if (loading) return <Typography variant="h6" sx={{ textAlign: 'center', marginTop: 3 }}>
  Loading reviews...
</Typography>;;
  if (error) return <p>{error}</p>;

  return (
    <div className="admin-review-manager">
      {/* Back Button */}
      <button
        className="btn btn-secondary"
        onClick={() => navigate('/productManager')}
        style={{ marginBottom: '20px' }}
      >
        Back to Product Manager
      </button>

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

          {/* Action Buttons */}
          <div className="review-actions">
            <button
              onClick={() => handleAction(review.id, 'approve')}
              className="approve-button"
              disabled={review.is_approved}
            >
              Approve
            </button>
            <button
              onClick={() => confirmReject(review.id)}
              className="reject-button"
            >
              Reject
            </button>
            <button
              onClick={() => handleAction(review.id, 'pending')}
              className="pending-button"
              disabled={!review.is_approved}
            >
              Mark as Pending
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AdminReviewManager;
