import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Checkout = () => {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');
    const [cardNumber, setCardNumber] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [cvv, setCvv] = useState('');
    const [formError, setFormError] = useState('');
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

    // Validate credit card details
    const validateCardDetails = () => {
        const cardNumberRegex = /^\d{16}$/; // 16-digit number
        const expiryDateRegex = /^(0[1-9]|1[0-2])\/\d{2}$/; // MM/YY format
        const cvvRegex = /^\d{3}$/; // 3-digit CVV

        if (!cardNumberRegex.test(cardNumber)) {
            setFormError('Invalid card number. Please enter a 16-digit card number.');
            return false;
        }

        if (!expiryDateRegex.test(expiryDate)) {
            setFormError('Invalid expiry date. Use MM/YY format.');
            return false;
        }

        if (!cvvRegex.test(cvv)) {
            setFormError('Invalid CVV. Please enter a 3-digit CVV.');
            return false;
        }

        setFormError('');
        return true;
    };

    const handleCheckout = async () => {
        // Validate credit card details before proceeding
        if (!validateCardDetails()) return;

        try {
            const response = await axios.post('http://localhost:8000/checkout/', {}, { headers });
            console.log('Checkout successful:', response.data); // Debug log
            setSuccessMessage('Order placed successfully!');
            setCartItems([]); // Clear local cart data

            console.log('Redirecting to MockBank'); // Debug log
            navigate('/mockbank'); // Redirect to mock bank page
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

                    <h2>Payment Details</h2>
                    {formError && <p className="error-message">{formError}</p>}
                    <div className="form-group">
                        <label>Card Number</label>
                        <input
                            type="text"
                            maxLength="16"
                            value={cardNumber}
                            onChange={(e) => setCardNumber(e.target.value)}
                            placeholder="Enter 16-digit card number"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Expiry Date (MM/YY)</label>
                        <input
                            type="text"
                            maxLength="5"
                            value={expiryDate}
                            onChange={(e) => setExpiryDate(e.target.value)}
                            placeholder="MM/YY"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>CVV</label>
                        <input
                            type="text"
                            maxLength="3"
                            value={cvv}
                            onChange={(e) => setCvv(e.target.value)}
                            placeholder="3-digit CVV"
                            required
                        />
                    </div>
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
