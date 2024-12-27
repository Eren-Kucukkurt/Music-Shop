import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import ShoppingCartComponent from './components/ShoppingCart';
import ProductDetails from './components/ProductDetails';
import AdminRoute from './components/AdminRoute';
import AddProductForm from './components/AddProductForm';
import AdminReviewManager from './components/AdminReviewManager.js';
import Checkout from './components/Checkout';
import OrdersPage from './components/OrdersPage';
import MockBank from './components/Mockbank';
import Invoice from './components/Invoice';
import RoleAssignment from './components/RoleAssignment.js';
import ProductManager from './components/ProductManager';
import SalesManager from './components/SalesManager';
import withRoleGuard from './hoc/withRoleGuard'; // Import the role guard HOC
import ProductManagement from './components/ProductManagement';
import UnauthorizedPage from './components/UnauthorizedPage'; // Page for unauthorized users
import Wishlist from './components/Wishlist.js'; // Update the path if Wishlist is in a different directory
import RequireAuth from './middleware'; // Assuming `RequireAuth` is in the middleware folder
import InvoiceViewer from './components/InvoiceViewer';
import RefundManager from './components/RefundManager.js';
import RemoveProduct from './components/RemoveProduct.js'; // Update the path if RemoveProduct is in a different directory
import RevenueProfitChart from './components/RevenueProfitChart.js'; // Update the path if RevenueProfitChart is in a different directory
import UpdateProductForm from './components/UpdateProductForm.js'; // Update the path if UpdateProductForm is in a different directory
import ProfilePage from './components/ProfilePage.js';


// Wrap the components with the role guard
const ProtectedProductManager = withRoleGuard(ProductManager, ['PRODUCT_MANAGER']);
const ProtectedSalesManager = withRoleGuard(SalesManager, ['SALES_MANAGER']);

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
    // Global state for authentication
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };
 
  return (
    <Router>
      <div className="App">
      <Navbar
        isAuthenticated={isAuthenticated}
        setIsAuthenticated={setIsAuthenticated}
        username={username}
        setUsername={setUsername}
      />
        <Routes>
          <Route path="/" element={            <Dashboard
              isAuthenticated={isAuthenticated}
              setIsAuthenticated={setIsAuthenticated}
              username={username}
              setUsername={setUsername}
            />} />
          <Route path="/shoppingcart" element={<ShoppingCartComponent />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />
          <Route path="/product/:productId" element={<ProductDetails />} />
          <Route path="/productManager/addProduct" element={<AdminRoute><AddProductForm /></AdminRoute>} />
          <Route path="/productManager/reviews" element={<AdminRoute><AdminReviewManager /></AdminRoute>} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/mockbank" element={<MockBank />} />
          <Route path="/invoice" element={<Invoice />} />
          <Route path="/assign-role" element={<RoleAssignment />} />
          <Route path="/productManager" element={<ProtectedProductManager />} />
          <Route path="/salesManager" element={<ProtectedSalesManager />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/product-management" element={<ProductManagement />} />
          <Route path="/invoice-viewer" element={<InvoiceViewer />} />
          <Route path="/refund-management" element={<RefundManager />} />
          <Route path="/productManager/removeProduct" element={<RemoveProduct />} />
          <Route path="/salesManager/revenue-analysis" element={<RevenueProfitChart />} />
          <Route path= "/productManager/updateProduct" element={<UpdateProductForm />} />
          <Route path="/profile" element={<ProfilePage />} />


        </Routes>
      </div>
      
    </Router>
  );
}

export default App;
