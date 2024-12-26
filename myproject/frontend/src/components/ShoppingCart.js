import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Minus, Plus} from 'lucide-react';
import axios from 'axios';
import {Typography,Row,Col, Button,Space} from 'antd';
import {DeleteOutlined} from '@ant-design/icons';

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
        setCartItems(response.data.items);
        // Populate cart items

        //print the response data
        //console.log(response.data.items);
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

        // Fetch the updated cart data to ensure the frontend reflects the correct state
        const response = await axios.get('http://localhost:8000/cart/', { headers });
        setCartItems(response.data.items);
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
    return <Typography variant="h6" sx={{ textAlign: 'center', marginTop: 3 }}>
    Loading your cart...
  </Typography>;;
  }

  if (error) {
    return <Typography variant="h6" sx={{ textAlign: 'center', marginTop: 3 }}> {error}
  </Typography>;
  }

  
  
  return ( 

    <div style={{
      height: '100%',
      width: '100%',
      padding: '40px 60px',

    }} > 
    <Typography.Title level={1}>Shopping Cart</Typography.Title>
    {cartItems.length!=0 ? (<><>
    {cartItems.slice() // Create a shallow copy to avoid mutating the original array
            .sort((a, b) => a.product.localeCompare(b.product)) // Sort by product name
            .map(item => (
              
                <Row key={item.id} style={{borderBottom: '1px solid #f0f0f0', padding: '20px 0',backgroundColor: "white",borderRadius:"20px",margin:"10px 0 10px 0"}} align="middle">
              <Col span={4} style={{padding:"10px 15px"}}>
                <img
                  src={`http://localhost:8000` + item.product_image}
                  alt={item.product}
                  style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                />
                </Col>
                <Col span={4} style={{padding:"10px 15px"}}>
                <Typography.Title level={5}>{item.product}</Typography.Title>
                </Col>
                <Col span={4}style={{padding:"10px 15px"}}>
                <Typography.Title level={5}>${item.price ? item.price.toFixed(2) : '0.00'}</Typography.Title>
                </Col>
                <Col span={4}style={{padding:"10px 15px"}}>

                                {/* Quantity Controls */}
                <div className="flex flex-col items-center">
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
                      disabled={item.is_at_max_stock}
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                </Col>
                <Col span={4}style={{padding:"10px 15px"}}>
                <Typography.Title level={5}>${item.price ? (item.price*item.quantity).toFixed(2) : '0.00'}</Typography.Title>
                </Col>
                <Col span={4}style={{padding:"10px 15px"}}>
                <Button
                  color='danger'
                  variant="solid"
                  size="icon"
                  icon={<DeleteOutlined />}
                  onClick={() => updateQuantity(item.id, -item.quantity)}
                  ></Button>
                  </Col>
                  </Row>
              ))}
    </>
    <Space direction="vertical" style={{float:"right"}}>
    <Typography.Title  level={3}>Total Price: ${totalPrice.toFixed(2)}</Typography.Title>
    <Button variant='outline'onClick={() => navigate('/checkout')} style={{borderColor:"black",float:"right"}}>Checkout</Button>
    </Space> </>):(<Typography.Title level={3}>Your cart is empty</Typography.Title>)}
    </div>


  );
}
