import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ProductManagement.css';

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [discountDetails, setDiscountDetails] = useState({
    discount_percentage: '',
    discount_start_date: '',
    discount_end_date: '',
    price: '',
  });

  // Fetch products from the API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const token = sessionStorage.getItem('access_token');
        const response = await axios.get('http://localhost:8000/api/store/products/', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: { search },
        });

        setProducts(response.data);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchProducts();
  }, [search]);

  // Handle form submission to update product
  const handleProductUpdate = async () => {
    if (!selectedProduct) return;

    try {
      const token = sessionStorage.getItem('access_token');

      // Prepare the payload with only updated fields
      const payload = {};
      if (discountDetails.discount_percentage) {
        payload.discount_percentage = parseFloat(discountDetails.discount_percentage);
      }
      if (discountDetails.discount_start_date) {
        payload.discount_start_date = discountDetails.discount_start_date;
      }
      if (discountDetails.discount_end_date) {
        payload.discount_end_date = discountDetails.discount_end_date;
      }
      if (discountDetails.price) {
        payload.price = parseFloat(discountDetails.price);
      }

      await axios.put(
        `http://localhost:8000/api/store/products/${selectedProduct.id}/update-discount/`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      alert('Product updated successfully!');
      setDiscountDetails({
        discount_percentage: '',
        discount_start_date: '',
        discount_end_date: '',
        price: '',
      });
      setSelectedProduct(null);
    } catch (error) {
      console.error('Error updating product:', error);
    }
  };

  return (
    <div className="product-management">
      <h1>Product Management</h1>

      {/* Search Bar */}
      <input
        type="text"
        placeholder="Search products..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Product List */}
      <ul className="product-list">
  {products.map((product) => (
    <li key={product.id} className="product-card">
      <div className="product-image-wrapper">
        <img
          src={product.image}
          alt={product.name}
          className="product-image"
        />
      </div>
      <div className="product-info">
        <p className="product-name">{product.name}</p>
        <p className="product-price">${new Intl.NumberFormat('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }).format(product.price)}</p>
        <button onClick={() => setSelectedProduct(product)}>
          Set Discount / Update Price
        </button>
      </div>
    </li>
  ))}
</ul>


{/* Discount Form */}
{selectedProduct && (
  <div className="discount-form">
    <h2 className="form-header">Set Discount or Update Price for "{selectedProduct.name}"</h2>
    <div className="form-content">
      <div className="form-row">
        <div className="form-group">
          <label>New Price</label>
          <input
            type="number"
            placeholder="Enter new price"
            value={discountDetails.price || ''}
            onChange={(e) =>
              setDiscountDetails({ ...discountDetails, price: e.target.value })
            }
          />
        </div>
        <div className="form-group">
          <label>Discount Percentage</label>
          <input
            type="number"
            placeholder="Enter discount percentage"
            value={discountDetails.discount_percentage || ''}
            onChange={(e) =>
              setDiscountDetails({ ...discountDetails, discount_percentage: e.target.value })
            }
          />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Start Date</label>
          <input
            type="date"
            value={discountDetails.discount_start_date || ''}
            onChange={(e) =>
              setDiscountDetails({ ...discountDetails, discount_start_date: e.target.value })
            }
          />
        </div>
        <div className="form-group">
          <label>End Date</label>
          <input
            type="date"
            value={discountDetails.discount_end_date || ''}
            onChange={(e) =>
              setDiscountDetails({ ...discountDetails, discount_end_date: e.target.value })
            }
          />
        </div>
      </div>
    </div>
    <div className="form-actions">
      <button className="update-btn" onClick={handleProductUpdate}>Update</button>
      <button className="cancel-btn" onClick={() => setSelectedProduct(null)}>Cancel</button>
    </div>
  </div>
)}

    </div>
  );
};

export default ProductManagement;
