import React, { useState } from 'react';
import './SalesManager.css';
import RevenueProfitChart from './RevenueProfitChart';
import RefundManager from './RefundManager';
import InvoiceViewer from './InvoiceViewer';
import ProductManagement from './ProductManagement';

const SalesManager = () => {
  const [activeComponent, setActiveComponent] = useState('ProductManagement');

  const renderComponent = () => {
    switch (activeComponent) {
      case 'ProductManagement':
        return <ProductManagement />;
      case 'InvoiceViewer':
        return <InvoiceViewer />;
      case 'RefundManager':
        return <RefundManager />;
      case 'RevenueProfitChart':
        return <RevenueProfitChart />;
      default:
        return <ProductManagement />;
    }
  };

  return (
    <div className="sales-manager-dashboard">
      {/* Sidebar */}
      <div className="sidebar1">
        <h2>Sales Manager Dashboard</h2>
        <button onClick={() => setActiveComponent('ProductManagement')}>Manage Products</button>
        <button onClick={() => setActiveComponent('InvoiceViewer')}>View Invoices</button>
        <button onClick={() => setActiveComponent('RefundManager')}>Manage Refunds</button>
        <button onClick={() => setActiveComponent('RevenueProfitChart')}>Revenue and Profit Analysis</button>
      </div>

      {/* Main Content Area */}
      <div className="content">{renderComponent()}</div>
    </div>
  );
};

export default SalesManager;
