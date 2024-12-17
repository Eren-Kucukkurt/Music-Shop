import React from 'react';
import { useNavigate } from 'react-router-dom';
import './ProductManager.css';

const ProductManager = () => {
  const navigate = useNavigate(); // Hook to programmatically navigate

  return (
    <div className="product-manager">
      <h1>Product Manager Dashboard</h1>

      {/* Button to navigate to Review Management */}
      <section>
        <h2>Review Management</h2>
        <button
          className="btn btn-primary"
          onClick={() => navigate('/productManager/reviews')}
        >
          Go to Review Management
        </button>
      </section>

      {/* Placeholder for future functionalities */}
      <section>
        <h2>Product Management</h2>
        <button 
        className="btn btn-primary"
        onClick= {() => navigate('/productManager/addProduct')}
        >
        Add Product</button>
        <button className="btn btn-secondary">Update Product</button>
        <button className="btn btn-danger">Delete Product</button>
      </section>
    </div>
  );
};

export default ProductManager;
