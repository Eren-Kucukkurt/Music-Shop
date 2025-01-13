import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import './UpdateProductForm.css';

const UpdateProductForm = () => {
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [formData, setFormData] = useState({});
  const [feedback, setFeedback] = useState(null);
  const [categories, setCategories] = useState([]);

  const token = sessionStorage.getItem('access_token');
  const headers = { Authorization: `Bearer ${token}` };

  const formRef = useRef(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/products/', { headers });
        setProducts(response.data);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };
    fetchProducts();
  }, []);

  // Add this new useEffect to fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/categories/');
        setCategories(response.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (formRef.current && !formRef.current.contains(event.target)) {
        setSelectedProduct(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value.toLowerCase());
  };

  const handleProductSelect = (product) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      category: product.category, // Keep this as ID
      model: product.model,
      serial_number: product.serial_number,
      description: product.description,
      quantity_in_stock: product.quantity_in_stock,
      price: product.price,
      cost: product.cost,
      warranty_status: product.warranty_status,
      distributor_info: product.distributor_info,
      existingImage: product.image_url, // Preserve existing image
      image: null, // For new uploads
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, image: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedProduct) {
      alert('Please select a product to update.');
      return;
    }

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    };

    const productData = new FormData();
    Object.keys(formData).forEach((key) => {
      if (key === 'image' && !formData.image) return; // Skip if no new image
      if (key !== 'existingImage') {
        productData.append(key, formData[key]);
      }
    });

    try {
      await axios.put(
        `http://localhost:8000/api/update-product/${selectedProduct.id}/`,
        productData,
        config
      );
      setFeedback({ type: 'success', message: 'Product updated successfully!' });
    } catch (error) {
      setFeedback({ type: 'error', message: 'Failed to update product. Please try again.' });
      console.error(error);
    }
  };

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchQuery) ||
      product.category.toLowerCase().includes(searchQuery) ||
      product.model.toLowerCase().includes(searchQuery)
  );

  return (
    <div className="update-product-form">
      <h2>Update Product</h2>
      {feedback && (
        <div className={`feedback ${feedback.type}`}>
          {feedback.message}
        </div>
      )}

      {/* Search Section */}
      <div className="search-section">
        <input
          type="text"
          placeholder="Search products..."
          value={searchQuery}
          onChange={handleSearchChange}
        />
      </div>

      {/* Product List */}
      <div className="product-list">
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            className={`product-item ${selectedProduct?.id === product.id ? 'selected' : ''}`}
            onClick={() => handleProductSelect(product)}
          >
            <img
              src={product.image_url || '/placeholder.png'}
              alt={product.name}
              className="product-thumbnail"
            />
            <p>{product.name}</p>
          </div>
        ))}
      </div>

      {/* Update Form */}
      {selectedProduct && (
        <form onSubmit={handleSubmit} className="update-form" ref={formRef}>
          <h3>Editing: {selectedProduct.name}</h3>

          <label htmlFor="name">Name</label>
          <input
            id="name"
            type="text"
            name="name"
            placeholder="Product Name"
            value={formData.name}
            onChange={handleChange}
            required
          />

          <label htmlFor="category">Category</label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
          >
            <option value="" disabled>Select Category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>

          <label htmlFor="model">Model</label>
          <input
            id="model"
            type="text"
            name="model"
            placeholder="Model"
            value={formData.model}
            onChange={handleChange}
            required
          />

          <label htmlFor="serial_number">Serial Number</label>
          <input
            id="serial_number"
            type="text"
            name="serial_number"
            placeholder="Serial Number"
            value={formData.serial_number}
            onChange={handleChange}
          />

          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            placeholder="Description"
            value={formData.description}
            onChange={handleChange}
          />

          <label htmlFor="quantity_in_stock">Quantity in Stock</label>
          <input
            id="quantity_in_stock"
            type="number"
            name="quantity_in_stock"
            placeholder="Quantity in Stock"
            value={formData.quantity_in_stock}
            onChange={handleChange}
            required
          />

          <label htmlFor="price">Price</label>
          <input
            id="price"
            type="number"
            name="price"
            placeholder="Price"
            value={formData.price}
            onChange={handleChange}
            required
          />

          <label htmlFor="cost">Cost</label>
          <input
            id="cost"
            type="number"
            name="cost"
            placeholder="Cost"
            value={formData.cost}
            onChange={handleChange}
            required
          />

          <label htmlFor="warranty_status">Warranty Status</label>
          <input
            id="warranty_status"
            type="text"
            name="warranty_status"
            placeholder="Warranty Status"
            value={formData.warranty_status}
            onChange={handleChange}
          />

          <label htmlFor="distributor_info">Distributor Info</label>
          <input
            id="distributor_info"
            type="text"
            name="distributor_info"
            placeholder="Distributor Info"
            value={formData.distributor_info}
            onChange={handleChange}
          />

          <label htmlFor="existingImage">Existing Image</label>
          {formData.existingImage && (
            <img
              src={formData.existingImage}
              alt={selectedProduct.name}
              className="existing-image-preview"
            />
          )}

          <label htmlFor="image">Upload New Image (Optional)</label>
          <input
            id="image"
            type="file"
            name="image"
            onChange={handleFileChange}
          />

          <button type="submit">Update Product</button>
        </form>
      )}
    </div>
  );
};

export default UpdateProductForm;