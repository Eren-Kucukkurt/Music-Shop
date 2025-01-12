import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Typography } from '@mui/material';
import axios from 'axios';
import './Checkout.css';
import Footer from './Footer'; // Import Footer

const Checkout = () => {
    const [cartItems, setCartItems] = useState([]);
    const [savedCards, setSavedCards] = useState([]);
    const [selectedCardId, setSelectedCardId] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');
    const [cardNumber, setCardNumber] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [cvv, setCvv] = useState('');
    const [saveCard, setSaveCard] = useState(false);
    const [cardName, setCardName] = useState('');
    const [formError, setFormError] = useState('');
    const navigate = useNavigate();

    const accessToken = sessionStorage.getItem('access_token');
    const headers = {
        'Content-Type': 'application/json',
        Authorization: accessToken ? `Bearer ${accessToken}` : null,
    };

    // Fetch cart and saved cards
    useEffect(() => {
        if (!accessToken) {
            navigate('/login');
            return;
        }

        const fetchData = async () => {
            try {
                const [cartResponse, cardsResponse] = await Promise.all([
                    axios.get('http://localhost:8000/cart/', { headers }),
                    axios.get('http://localhost:8000/credit-cards/', { headers }),
                ]);

                const items = cartResponse.data.items.map((item) => ({
                    id: item.id,
                    productId: item.product.id,
                    productName: item.product,
                    quantity: item.quantity,
                    price: parseFloat(item.price),
                    totalPrice: parseFloat(item.total_price),
                }));

                setCartItems(items);
                setSavedCards(cardsResponse.data);
                setLoading(false);
            } catch (err) {
                setError('Failed to load data.');
                setLoading(false);
            }
        };

        fetchData();
    }, [accessToken, navigate]);

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
        let payload = {};

        if (selectedCardId) {
            payload = { credit_card: { use_saved_card: true, card_id: selectedCardId } };
        } else {
            if (!validateCardDetails()) return;

            payload = {
                credit_card: {
                    use_saved_card: false,
                    save_new_card: saveCard,
                    card_name: cardName,
                    card_number: cardNumber,
                    expiry_date: expiryDate,
                    cvv: cvv,
                },
            };
        }

        try {
            await axios.post('http://localhost:8000/checkout/', payload, { headers });
            setSuccessMessage('Order placed successfully!');
            setCartItems([]);
            navigate('/mockbank');
        } catch {
            setError('Failed to complete checkout. Please try again.');
        }
    };

    if (loading) return <Typography variant="h6" sx={{ textAlign: 'center', marginTop: 3 }}>Loading...</Typography>;
    if (error) return <p className="error-message">{error}</p>;

    return (

        <div className="checkout-container">
            <h1>&nbsp;</h1>
            {successMessage && <p className="success-message">{successMessage}</p>}
            {cartItems.length === 0 ? (
                <p>Your cart is empty.</p>
            ) : (
                <div className="checkout-content">
                {/* Cart Summary Section */}
                <div className="cart-summary">
                <h1>Checkout</h1>
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
            
                {/* Payment Details Section */}
                <div className="payment-box">
                    <div className="payment-details">
                        <h2>Payment Details</h2>
            
                        {/* Use Saved Credit Card */}
                        {savedCards.length > 0 && (
                            <div className="form-group">
                                <label htmlFor="savedCards">Use a Saved Card</label>
                                <select
                                    id="savedCards"
                                    value={selectedCardId}
                                    onChange={(e) => setSelectedCardId(e.target.value)}
                                >
                                    <option value="">Select a card</option>
                                    {savedCards.map((card) => (
                                        <option key={card.id} value={card.id}>
                                            {card.card_name} - **** **** **** {card.last4}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
            
                        {/* New Card Input */}
                        {!selectedCardId && (
                            <>
                                <div className="form-group">
                                    <label htmlFor="cardName">Name on Card</label>
                                    <input
                                        id="cardName"
                                        type="text"
                                        value={cardName}
                                        onChange={(e) => setCardName(e.target.value)}
                                        placeholder="Name on card"
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="cardNumber">Card Number</label>
                                    <input
                                        id="cardNumber"
                                        type="text"
                                        maxLength="16"
                                        value={cardNumber}
                                        onChange={(e) => setCardNumber(e.target.value)}
                                        placeholder="16-digit card number"
                                    />
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="expiryDate">Expiry Date (MM/YY)</label>
                                        <input
                                            id="expiryDate"
                                            type="text"
                                            maxLength="5"
                                            value={expiryDate}
                                            onChange={(e) => setExpiryDate(e.target.value)}
                                            placeholder="MM/YY"
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
                                        />
                                    </div>
                                </div>
                                <div className="form-group save-card-option">
                                    <label>
                                        <input
                                            type="checkbox"
                                            checked={saveCard}
                                            onChange={() => setSaveCard(!saveCard)}
                                        />
                                        Save this card for future use
                                    </label>
                                </div>
                            </>
                        )}
                    </div>
                    <div className="card-preview-container">
                        <div className="card-preview">
                            <div className="credit-card">
                                <p className="card-name">{cardName || 'Name on Card'}</p>
                                <p className="card-number">{cardNumber || '**** **** **** ****'}</p>
                                <p className="card-expiry">{expiryDate || 'MM/YY'}</p>
                            </div>
                        </div>
                        <button onClick={handleCheckout} className="checkout-button">
                            Place Order
                        </button>
                    </div>
                      

                </div>

                         <Footer />
   

                </div>

            )}

        </div>

    );
    
};
export default Checkout;
