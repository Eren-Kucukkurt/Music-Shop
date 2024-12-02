import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Checkout = () => {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');
    const navigate = useNavigate();

    // Check for authentication
    const accessToken = sessionStorage.getItem('access_token');
    const headers = {
        'Content-Type': 'application/json',
        Authorization: accessToken ? `Bearer ${accessToken}` : null,
    };

    useEffect(() => {
        // Redirect to login if not authenticated
        if (!accessToken) {
            navigate('/login');
            return;
        }

        const fetchCart = async () => {
            try {
                const response = await axios.get('http://localhost:8000/cart/', { headers });
                const items = response.data.items.map(item => ({
                    id: item.id,
                    productId: item.product.id,
                    productName: item.product.name,
                    quantity: item.quantity,
                    price: parseFloat(item.price),
                    totalPrice: parseFloat(item.total_price),
                }));
                setCartItems(items);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching cart:', err);
                setError('Failed to load cart data.');
                setLoading(false);
            }
        };

        fetchCart();
    }, [accessToken, navigate, headers]);

    const handleCheckout = async () => {
        try {
            const response = await axios.post('http://localhost:8000/checkout/', {}, { headers });
            console.log('Checkout successful:', response.data); // Debug log
            setSuccessMessage('Order placed successfully!');
            setCartItems([]); // Clear local cart data

            console.log('Redirecting to /orders'); // Debug log
            navigate('/orders'); // Redirect to orders page
        } catch (err) {
            console.error('Checkout error:', err);
            setError('Failed to complete checkout. Please try again.');
        }
    };

    if (loading) return <p>Loading your cart...</p>;
    if (error) return <p className="error-message">{error}</p>;

    return (
        <div className="checkout-container">
            <h1>Checkout</h1>
            {successMessage && <p className="success-message">{successMessage}</p>}
            {cartItems.length === 0 ? (
                <p>Your cart is empty.</p>
            ) : (
                <div>
                    <h2>Cart Summary</h2>
                    {cartItems.map((item) => (
                        <div key={item.id} className="cart-item">
                            <p>
                                <strong>{item.productName}</strong> - {item.quantity} x ${item.price.toFixed(2)}
                            </p>
                            <p>Total: ${item.totalPrice.toFixed(2)}</p>
                        </div>
                    ))}
                    <div className="checkout-actions">
                        <button onClick={handleCheckout} className="checkout-button">
                            Place Order
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Checkout;
