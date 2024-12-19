import React, { useState } from 'react';
import axios from 'axios';
import './AddProductForm.css'; // Optional CSS for styling
import { useNavigate } from 'react-router-dom';

const AddProductForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    model: '',
    serial_number: '',
    description: '',
    quantity_in_stock: '',
    price: '',
    cost: '', // New field for cost
    warranty_status: '',
    distributor_info: '',
    image: null,
  });
  const navigate = useNavigate();
  const [feedback, setFeedback] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, image: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = sessionStorage.getItem('access_token'); // Authorization token
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    };

    const productData = new FormData();
    Object.keys(formData).forEach((key) => {
      productData.append(key, formData[key]);
    });

    try {
      const response = await axios.post('http://localhost:8000/api/add-product/', productData, config);
      setFeedback({ type: 'success', message: 'Product added successfully!' });
      setFormData({
        name: '',
        category: '',
        model: '',
        serial_number: '',
        description: '',
        quantity_in_stock: '',
        price: '',
        cost: '', // Reset cost
        warranty_status: '',
        distributor_info: '',
        image: null,
      });
    } catch (error) {
      setFeedback({ type: 'error', message: 'Failed to add product. Please try again.' });
      console.error(error);
    }
  };

  return (
    <div className="add-product-form">
      {/* Back Button */}
      <button
        className="btn btn-secondary"
        onClick={() => navigate('/productManager')}
        style={{
          display: 'block', // Required for margin auto
          margin: '0 auto',
          marginBottom: '20px',
        }}
      >
        Back to Product Manager
      </button>
      <h2>Add New Product</h2>
      {feedback && (
        <div className={`feedback ${feedback.type}`}>
          {feedback.message}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Product Name"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="category"
          placeholder="Category"
          value={formData.category}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="model"
          placeholder="Model"
          value={formData.model}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="serial_number"
          placeholder="Serial Number"
          value={formData.serial_number}
          onChange={handleChange}
        />
        <textarea
          name="description"
          placeholder="Description"
          value={formData.description}
          onChange={handleChange}
        />
        <input
          type="number"
          name="quantity_in_stock"
          placeholder="Quantity in Stock"
          value={formData.quantity_in_stock}
          onChange={handleChange}
          required
        />
        <input
          type="number"
          name="price"
          placeholder="Price"
          value={formData.price}
          onChange={handleChange}
          required
        />
        <input
          type="number"
          name="cost"
          placeholder="Cost"
          value={formData.cost}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="warranty_status"
          placeholder="Warranty Status"
          value={formData.warranty_status}
          onChange={handleChange}
        />
        <input
          type="text"
          name="distributor_info"
          placeholder="Distributor Info"
          value={formData.distributor_info}
          onChange={handleChange}
        />
        <input
          type="file"
          name="image"
          onChange={handleFileChange}
        />
        <button type="submit">Add Product</button>
      </form>
    </div>
  );
};

export default AddProductForm;
