import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './RemoveProduct.css';

const RemoveProduct = () => {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const headers = {
    'Authorization': `Bearer ${sessionStorage.getItem('access_token')}`,
  };

  const fetchProducts = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/products/', {
        headers,
        params: { search },
      });
      setProducts(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products.');
      setLoading(false);
    }
  };

  const deleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      await axios.delete(`http://localhost:8000/api/delete-product/${productId}/`, { headers });
      alert('Product deleted successfully.');
      fetchProducts(); // Refresh products after deletion
    } catch (err) {
      console.error('Error deleting product:', err);
      alert('Failed to delete product.');
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [search]);

  if (loading) return <p>Loading products...</p>;
  if (error) return <p className="error-message">{error}</p>;

  return (
    <div className="remove-product-container">
      <h1>Remove Product</h1>
      <input
        type="text"
        placeholder="Search for a product..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="search-bar"
      />

      <div className="product-list">
        {products.map((product) => (
          <div key={product.id} className="product-card">
            <img
              src={product.image || '/placeholder.png'}
              alt={product.name}
              className="product-image"
            />
            <p>{product.name}</p>
            <button
              className="delete-button"
              onClick={() => deleteProduct(product.id)}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RemoveProduct;
