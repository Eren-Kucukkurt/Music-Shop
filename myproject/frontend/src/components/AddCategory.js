// AddCategory.js
import React, { useState } from 'react';
import axios from 'axios';
import './AddCategory.css';

const AddCategory = () => {
  const [categoryName, setCategoryName] = useState('');
  const [feedback, setFeedback] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!categoryName.trim()) {
      setFeedback({ type: 'error', message: 'Category name is required.' });
      return;
    }

    try {
      const token = sessionStorage.getItem('access_token');
      const response = await axios.post(
        'http://localhost:8000/api/categories/',
        { name: categoryName },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      setFeedback({ type: 'success', message: 'Category added successfully!' });
      setCategoryName(''); // Reset form
    } catch (error) {
      setFeedback({ 
        type: 'error', 
        message: error.response?.data?.error || 'Failed to add category.' 
      });
    }
  };

  return (
    <div className="add-category-container">


      <h2>Add New Category</h2>
      
      {feedback && (
        <div className={`feedback ${feedback.type}`}>
          {feedback.message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="category-form">
        <div className="form-group">
          <label htmlFor="categoryName">Category Name</label>
          <input
            type="text"
            id="categoryName"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            placeholder="Enter category name"
            required
          />
        </div>
        <button type="submit" className="submit-button">
          Add Category
        </button>
      </form>
    </div>
  );
};

export default AddCategory;