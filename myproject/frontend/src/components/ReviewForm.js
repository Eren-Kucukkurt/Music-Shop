import React, { useState } from 'react';
import './ReviewForm.css';

function ReviewForm({ productId, onReviewSubmitted }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = sessionStorage.getItem('access_token'); // Retrieve the access token
    if (!token) {
      setError('You must be logged in to submit a review.');
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/api/reviews/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // Add the token in the header
        },
        body: JSON.stringify({
          product: productId, // The product ID for which the review is being submitted
          rating,
          comment,
        }),
      });

      if (response.ok) {
        alert('Review submitted for approval.');
        onReviewSubmitted(); // Refresh reviews after submission
        setRating(5); // Reset the form
        setComment('');
        window.location.reload(); // Refresh the window after leaving a comment
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Could not submit review.');
      }
    } catch (err) {
      console.error('Error submitting review:', err);
      setError('An error occurred while submitting the review.');
    }
  };

  return (
    <div>
      <h3>Write a Review</h3>
      {error && <p className="text-danger">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Rating:</label>
          <select value={rating} onChange={(e) => setRating(Number(e.target.value))}>
            {[1, 2, 3, 4, 5].map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
        <div>
          <label>Comment:</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            required
          />
        </div>
        <button type="submit">Submit Review</button>
      </form>
    </div>
  );
}

export default ReviewForm;
