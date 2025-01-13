import React, { useState, useEffect } from 'react';
import { Grid, Card, CardContent, Box, Typography, Button } from '@mui/material';
import { Star, StarHalf, StarOutline, Favorite, FavoriteBorder } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import axios from 'axios';

export default function ProductListing({ products, isLoading }) {
  const [wishlist, setWishlist] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [cartMessage, setCartMessage] = useState(null); // For feedback messages

  useEffect(() => {
    const accessToken = sessionStorage.getItem('access_token');
    if (accessToken) {
      setIsLoggedIn(true);
      const fetchWishlist = async () => {
        try {
          const response = await axios.get('http://localhost:8000/api/wishlist/', {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });
          const wishlistProductIds = response.data.products.map((product) => product.id);
          setWishlist(wishlistProductIds);
        } catch (error) {
          console.error('Error fetching wishlist:', error);
          setWishlist([]);
        }
      };

      fetchWishlist();
    }
  }, []);

  const generateGuestToken = () => {
    const token = Math.random().toString(36).substring(2);
    sessionStorage.setItem('guest_token', token);
    return token;
  };

  const handleAddToCart = async (productId) => {
    try {
      const accessToken = sessionStorage.getItem('access_token');
      const guestToken = sessionStorage.getItem('guest_token') || generateGuestToken();
  
      const headers = {
        'Content-Type': 'application/json',
      };
  
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      } else {
        headers['Guest-Token'] = guestToken;
      }
  
      const response = await axios.post(
        'http://localhost:8000/cart/add_item/',
        { product_id: productId, quantity: 1 },
        { headers }
      );
  
      const message = response.data.message || 'Product added to cart!';
      setCartMessage(message);
      window.alert(message); // Display success alert
    } catch (error) {
      console.error('Error adding product to cart:', error);
      const errorMessage = 'Failed to add product to cart. Please try again.';
      setCartMessage(errorMessage);
      window.alert(errorMessage); // Display error alert
    }
  };
  

  const handleToggleWishlist = async (productId) => {
    if (!isLoggedIn) {
      alert('Please log in to add products to your wishlist.');
      return;
    }

    if (wishlist.includes(productId)) {
      const updatedWishlist = wishlist.filter((id) => id !== productId);
      setWishlist(updatedWishlist);

      try {
        await axios.delete(`http://localhost:8000/api/wishlist/`, {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem('access_token')}`,
          },
          data: { product_id: productId },
        });

        alert('Product removed from your wishlist.');
      } catch (error) {
        console.error('Error removing product from wishlist:', error);
        setWishlist([...updatedWishlist, productId]);
      }
    } else {
      const updatedWishlist = [...wishlist, productId];
      setWishlist(updatedWishlist);

      try {
        await axios.post(
          `http://localhost:8000/api/wishlist/`,
          { product_id: productId },
          {
            headers: {
              Authorization: `Bearer ${sessionStorage.getItem('access_token')}`,
            },
          }
        );

        alert('Product added to your wishlist!');
      } catch (error) {
        console.error('Error adding product to wishlist:', error);
        setWishlist(wishlist);
      }
    }
  };

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const fractionalPart = Math.round((rating % 1) * 10) / 10;
    const hasHalfStar = fractionalPart === 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        {[...Array(fullStars)].map((_, index) => (
          <Star key={`full-${index}`} sx={{ color: '#ffc107', fontSize: '1.5rem' }} />
        ))}
        {hasHalfStar && <StarHalf sx={{ color: '#ffc107', fontSize: '1.5rem' }} />}
        {[...Array(emptyStars)].map((_, index) => (
          <StarOutline key={`empty-${index}`} sx={{ color: '#ccc', fontSize: '1.5rem' }} />
        ))}
      </Box>
    );
  };

  if (isLoading) {
    return (
      <Typography variant="h6" sx={{ textAlign: 'center', marginTop: 3 }}>
        Loading products...
      </Typography>
    );
  }

  return (
    <Grid container spacing={3} justifyContent="flex-start" sx={{ padding: 3 }}>
      {products.length === 0 ? (
        <Grid item xs={12}>
          <Typography variant="h6" sx={{ textAlign: 'center' }}>
            No products found.
          </Typography>
        </Grid>
      ) : (
        products.map((product) => {
          const rating = parseFloat(product.rating) || 0;
          const isWishlisted = isLoggedIn && wishlist.includes(product.id);
  
          return (
            <Grid
              item
              key={product.id}
              sx={{
                width: '300px',
                height: '525px',
              }}
            >
              <Card
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  height: '100%',
                  position: 'relative',
                  padding: 2,
                  boxShadow: 3,
                  transition: 'transform 0.3s',
                  '&:hover': { transform: 'scale(1.05)' },
                }}
              >
                {/* Link for product details (excluding the button) */}
                <Link
                  to={`/product/${product.id}`}
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <Box
                    sx={{
                      height: '250px',
                      width: '100%',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      backgroundColor: '#ffffff',
                      overflow: 'hidden',
                      borderRadius: 1,
                      position: 'relative',
                    }}
                  >
                    <img
                      src={product.image_url || 'https://via.placeholder.com/300'}
                      alt={product.name}
                      style={{
                        maxHeight: '100%',
                        maxWidth: '100%',
                        objectFit: 'contain',
                      }}
                    />
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        cursor: 'pointer',
                      }}
                      onClick={(e) => {
                        e.preventDefault();
                        handleToggleWishlist(product.id);
                      }}
                    >
                      {isWishlisted ? (
                        <Favorite sx={{ color: 'red', fontSize: '2rem' }} />
                      ) : (
                        <FavoriteBorder sx={{ color: '#ccc', fontSize: '2rem' }} />
                      )}
                    </Box>
                  </Box>
  
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography
                      variant="h6"
                      component="div"
                      sx={{
                        fontSize: '1.2rem',
                        fontWeight: 'bold',
                        textAlign: 'left',
                        marginBottom: 1,
                        display: '-webkit-box',
                        WebkitBoxOrient: 'vertical',
                        WebkitLineClamp: 2, // Limit to 2 lines
                        overflow: 'hidden', // Hide overflow text
                        height: '3.2em', // Fixed height for 2 lines of text
                      }}
                    >
                      {product.name}
                    </Typography>
  
                    {rating > 0 ? (
                      <Box sx={{ display: 'flex', alignItems: 'left', justifyContent: 'left' }}>
                        {renderStars(rating)}
                        <Typography variant="body2" sx={{ marginLeft: 1 }}>
                          ({rating.toFixed(1)})
                        </Typography>
                      </Box>
                    ) : (
                      <Typography
                        variant="body2"
                        color="textSecondary"
                        sx={{ textAlign: 'left' }}
                      >
                        No ratings yet
                      </Typography>
                    )}
  
                    {/* Price */}
                    <Typography
                      variant="h6"
                      sx={{
                        marginTop: 2,
                        textAlign: 'left',
                        fontWeight: 'bold',
                        color: '#333',
                      }}
                    >
                      {product.is_discount_active ? (
                        <>
                          <Typography
                            variant="body2"
                            sx={{
                              textDecoration: 'line-through',
                              color: '#615e5e',
                              fontSize: '1rem',
                              marginRight: 1,
                            }}
                            component="span"
                          >
                            ${new Intl.NumberFormat('en-US', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            }).format(product.price)}
                          </Typography>
                          <Typography
                            variant="h6"
                            sx={{
                              color: '#333',
                              fontWeight: 'bold',
                            }}
                            component="span"
                          >
                            ${new Intl.NumberFormat('en-US', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            }).format(product.discounted_price)}
                          </Typography>
                        </>
                      ) : (
                        <>
                          ${new Intl.NumberFormat('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          }).format(product.price)}
                        </>
                      )}
                    </Typography>
                  </CardContent>
                </Link>
  
                {/* Add to Cart Button (outside the Link) */}
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  onClick={(e) => {
                    e.stopPropagation(); // Stop event propagation to prevent navigation
                    if (product.quantity_in_stock > 0) {
                      handleAddToCart(product.id);
                    }
                  }}
                  disabled={product.quantity_in_stock <= 0}
                  sx={{
                    marginTop: '8px',
                    backgroundColor: product.quantity_in_stock <= 0 ? '#ccc' : 'primary.main',
                    color: product.quantity_in_stock <= 0 ? '#666' : '#fff',
                    cursor: product.quantity_in_stock <= 0 ? 'not-allowed' : 'pointer',
                    '&:hover': {
                      backgroundColor: product.quantity_in_stock <= 0 ? '#ccc' : 'primary.dark',
                    },
                  }}
                >
                  {product.quantity_in_stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                </Button>
              </Card>
            </Grid>
          );
        })
      )}
    </Grid>
  );
  
}
