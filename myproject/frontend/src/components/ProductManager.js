import React, { useState } from 'react';
import './ProductManager.css';
import AddProductForm from './AddProductForm';
import RemoveProduct from './RemoveProduct';
import UpdateProductForm from './UpdateProductForm';
import AdminReviewManager from './AdminReviewManager';
import { useNavigate } from 'react-router-dom';
import InvoiceViewer from './InvoiceViewer';
import AddCategory from './AddCategory';  // Add this import
import DeliveryListPage from './DeliveryListPage';


const ProductManager = () => {
  const [activeComponent, setActiveComponent] = useState('AddProductForm');
  const navigate = useNavigate();

  const renderComponent = () => {
    switch (activeComponent) {
      case 'AddProductForm':
        return <AddProductForm />;
      case 'RemoveProduct':
        return <RemoveProduct />;
      case 'UpdateProductForm':
        return <UpdateProductForm />;
      case 'AdminReviewManager':
        return <AdminReviewManager />;
      case 'AddCategory':        // Add this case
        return <AddCategory />;
      case 'InvoiceViewer': 
        return <InvoiceViewer />;
      case 'DeliveryListPage':
        return <DeliveryListPage />;  
      default:
        return <AddProductForm />;
    }
  };

  return (
    <div className="product-manager-dashboard">
      {/* Sidebar */}
      <div className="sidebar1">
        <h2>Product Manager Dashboard</h2>
        <button onClick={() => setActiveComponent('AddProductForm')}>Add Products</button>
        <button onClick={() => setActiveComponent('RemoveProduct')}>Remove Products</button>
        <button onClick={() => setActiveComponent('UpdateProductForm')}>Update Products</button>
        <button onClick={() => setActiveComponent('AdminReviewManager')}>Manage Reviews</button>
        <button onClick={() => setActiveComponent('AddCategory')}>Add Category</button>  {/* Add this button */}
        <button onClick={() => setActiveComponent('InvoiceViewer')}>View Invoices</button>
        <button onClick={() => setActiveComponent('DeliveryListPage')}>View Deliveries</button>

        {/* Back to Store Button */}
        <div style={{ marginTop: 'auto', marginTop: '20px' }}>
          <button
            onClick={() => navigate('/')}
            style={{
              marginTop: '20px',
              padding: '10px 20px',
              backgroundColor: '#1ABC9C',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
            }}
          >
            Back to Store
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="content">{renderComponent()}</div>
    </div>
  );
};

export default ProductManager;
