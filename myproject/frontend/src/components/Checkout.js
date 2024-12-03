import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Checkout.css'; // Import a dedicated CSS file

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

    const accessToken = sessionStorage.getItem('access_token');
    const headers = {
        'Content-Type': 'application/json',
        Authorization: accessToken ? `Bearer ${accessToken}` : null,
    };

    useEffect(() => {
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
                    productName: item.product, // Use product name directly
                    quantity: item.quantity,
                    price: parseFloat(item.price),
                    totalPrice: parseFloat(item.total_price),
                }));
                setCartItems(items);
                setLoading(false);
            } catch (err) {
                setError('Failed to load cart data.');
                setLoading(false);
            }
        };

        fetchCart();
    }, [accessToken, navigate, headers]);

    const validateCardDetails = () => {
        const cardNumberRegex = /^\d{16}$/;
        const expiryDateRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
        const cvvRegex = /^\d{3}$/;

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
        if (!validateCardDetails()) return;

        try {
            await axios.post('http://localhost:8000/checkout/', {}, { headers });
            setSuccessMessage('Order placed successfully!');
            setCartItems([]);
            navigate('/mockbank');
        } catch {
            setError('Failed to complete checkout. Please try again.');
        }
    };

    if (loading) return <p className="loader">Loading your cart...</p>;
    if (error) return <p className="error-message">{error}</p>;

    return (
        <div className="checkout-container">
            <h1>Checkout</h1>
            {successMessage && <p className="success-message">{successMessage}</p>}
            {cartItems.length === 0 ? (
                <p>Your cart is empty.</p>
            ) : (
                <div className="checkout-content">
                    <div className="cart-summary">
                        <h2>Cart Summary</h2>
                        {cartItems.map((item) => (
                            <div key={item.id} className="cart-item">
                                <p>
                                    <strong>{item.quantity} x {item.productName}</strong> @ ${item.price.toFixed(2)}
                                </p>
                                <p>Total: ${item.totalPrice.toFixed(2)}</p>
                            </div>
                        ))}
                    </div>
                    <div className="payment-form">
                        <h2>Payment Details</h2>
                        {formError && <p className="form-error">{formError}</p>}
                        <div className="form-group">
                            <label htmlFor="cardNumber">Card Number</label>
                            <input
                                id="cardNumber"
                                type="text"
                                maxLength="16"
                                value={cardNumber}
                                onChange={(e) => setCardNumber(e.target.value)}
                                placeholder="Enter 16-digit card number"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="expiryDate">Expiry Date (MM/YY)</label>
                            <input
                                id="expiryDate"
                                type="text"
                                maxLength="5"
                                value={expiryDate}
                                onChange={(e) => setExpiryDate(e.target.value)}
                                placeholder="MM/YY"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="cvv">CVV</label>
                            <input
                                id="cvv"
                                type="text"
                                maxLength="3"
                                value={cvv}
                                onChange={(e) => setCvv(e.target.value)}
                                placeholder="3-digit CVV"
                                required
                            />
                        </div>
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
