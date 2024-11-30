
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2 } from 'lucide-react';
import axios from 'axios';

export default function ShoppingCartComponent() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Helper function to generate a guest token
  const generateGuestToken = () => {
    const token = Math.random().toString(36).substring(2);
    sessionStorage.setItem('guest_token', token);
    return token;
  };


  const accessToken = sessionStorage.getItem('access_token'); // For logged-in users
  const guestToken = sessionStorage.getItem('guest_token') || generateGuestToken(); // For guest users

  const headers = {
    'Content-Type': 'application/json',
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  } else {
    headers['Guest-Token'] = guestToken;
  }



  // Fetch cart data when the component loads
  useEffect(() => {
    
    const fetchCartData = async () => {
      
      try {
        
        const response = await axios.get('http://localhost:8000/cart/', { headers });
        setCartItems(response.data.items); // Populate cart items
        setLoading(false);

      } catch (err) {

        console.error('Error fetching cart:', err);
        setError('Failed to fetch cart data. Please try again.');
        setLoading(false);

      }
    };


    fetchCartData();
  }, []);
  
  // Function to update quantity
  const updateQuantity = async (id, change) => {
    try {
      
      const updatedItem = cartItems.find(item => item.id === id);
      const newQuantity = Math.max(0, updatedItem.quantity + change);

      if (newQuantity === 0) {
        
        // If quantity becomes 0, remove the item
        await axios.post(`http://localhost:8000/cart/${id}/remove_item/`, {}, { headers });
        setCartItems(prevItems => prevItems.filter(item => item.id !== id));
      
      } else {
        
        // Otherwise, update the quantity
        await axios.post(`http://localhost:8000/cart/${id}/update_item/`, {
          quantity: newQuantity,
        }, 
        { headers });
        
        setCartItems(prevItems =>
          prevItems.map(item =>
            item.id === id ? { ...item, quantity: newQuantity, total_price: newQuantity * item.price } : item
          )
        );
      }
    } catch (err) {
      console.error('Error updating quantity:', err);
      setError('Failed to update item quantity. Please try again.');
    }
  };
  

  const removeItem = async (id) => {
    try {

      await axios.post(
        `http://localhost:8000/cart/${id}/remove_item/`,
        {}, // Empty payload
        { headers }
      );
      // Update the cart items locally
      setCartItems(prevItems => prevItems.filter(item => item.id !== id));
    } catch (err) {

      console.error('Error removing item:', err);
      setError('Failed to remove item. Please try again.');

    }
  };
  

  
  const totalPrice = cartItems.reduce((sum, item) => sum + item.total_price, 0);

  if (loading) {
    return <div>Loading your cart...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto p-4 bg-white">
      {/* Return/Back Button */}
      <button
        onClick={() => navigate('/')}
        className="text-blue-500 mb-4"
        aria-label="Return to home"
      >
        ← Back to Home
      </button>

      <h1 className="text-2xl font-bold mb-4">Shopping Cart</h1>
      {cartItems.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <div>
          {cartItems.map(item => (
            <div key={item.id} className="flex items-center justify-between border-b py-4 bg-white border-[1.2px] rounded-[8px] border-gray">
              {/* Product Name and Price */}
              <div>
                <h2 className="font-semibold">{item.product}</h2>
                <p className="text-gray-600">
                  Price: ${item.price ? item.price.toFixed(2) : '0.00'}
                </p>
                <p className="text-gray-600">
                  Total: ${item.total_price ? item.total_price.toFixed(2) : '0.00'}
                </p>
              </div>

              {/* Quantity Controls */}
              <div className="flex items-center">
                <button
                  variant="outline"
                  size="icon"
                  onClick={() => updateQuantity(item.id, -1)}
                  aria-label="Decrease quantity"
                  className="border p-2 rounded"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="mx-2 w-8 text-center">{item.quantity}</span>
                <button
                  variant="outline"
                  size="icon"
                  onClick={() => updateQuantity(item.id, 1)}
                  aria-label="Increase quantity"
                  className="border p-2 rounded"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              {/* Remove Button (Trash Bin) */}
              <button
                variant="outline"
                size="icon"
                className="ml-4 text-red-500"
                onClick={() => removeItem(item.id)}
                aria-label="Remove item"
              >
                <Trash2 className="h-6 w-6" />
              </button>
            </div>
          ))}
          {/* Total Price and Checkout */}
          <div className="mt-4 flex justify-between items-center">
            <p className="text-xl font-semibold">Total: ${totalPrice.toFixed(2)}</p>
            <button
              onClick={() => navigate('/checkout')}
              className="bg-blue-500 text-white py-2 px-4 rounded"
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
