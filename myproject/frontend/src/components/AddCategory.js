import React, { useState, useEffect } from 'react';  // Add useEffect
import axios from 'axios';
import './AddCategory.css';

const AddCategory = () => {
  const [categoryName, setCategoryName] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [categories, setCategories] = useState([]);  // Add this state
  const [loading, setLoading] = useState(true);     // Add loading state

  // Add useEffect to fetch existing categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = sessionStorage.getItem('access_token');
        const response = await axios.get('http://localhost:8000/api/categories/', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setCategories(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setFeedback({
          type: 'error',
          message: 'Failed to load existing categories.',
        });
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!categoryName.trim()) {
      setFeedback({ type: 'error', message: 'Category name is required.' });
      return;
    }

    try {
      const token = sessionStorage.getItem('access_token');
      await axios.post(
        'http://localhost:8000/api/categories/',
        { name: categoryName },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      // Fetch categories again to get the updated list
      const response = await axios.get('http://localhost:8000/api/categories/', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      setCategories(response.data);
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
      <h2>Categories</h2>
      
      {/* Display existing categories */}
      <div className="existing-categories">

        {loading ? (
          <p>Loading categories...</p>
        ) : categories.length > 0 ? (
          <div className="categories-grid">
            {categories.map((category) => (
              <div key={category.id} className="category-item">
                {category.name}
              </div>
            ))}
          </div>
        ) : (
          <p>No categories found.</p>
        )}
      </div>

      <div className="add-category-section">
        <h3>Add New Category</h3>
        
        {feedback && (
          <div className={`feedback ${feedback.type}`}>
            {feedback.message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="category-form">
          <div className="form-group">
            
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
    </div>
  );
};

export default AddCategory;