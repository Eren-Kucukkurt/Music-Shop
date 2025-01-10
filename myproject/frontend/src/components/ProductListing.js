import React, { useState, useEffect } from 'react';
import { Grid, Card, CardContent, Box, Typography } from '@mui/material';
import { Star, StarHalf, StarOutline, Favorite, FavoriteBorder } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import axios from 'axios';

export default function ProductListing({ products, isLoading }) {
  const [wishlist, setWishlist] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Track login status

  useEffect(() => {
    const accessToken = sessionStorage.getItem('access_token');
    if (accessToken) {
      setIsLoggedIn(true);
      // Fetch wishlist from the backend when the user is logged in
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
          setWishlist([]); // Fallback to an empty wishlist on error
        }
      };

      fetchWishlist();
    }
  }, []);

  const handleToggleWishlist = async (productId) => {
    if (!isLoggedIn) {
      alert('Please log in to add products to your wishlist.');
      return;
    }

    if (wishlist.includes(productId)) {
      // Optimistically update the state before making the API request
      const updatedWishlist = wishlist.filter((id) => id !== productId);
      setWishlist(updatedWishlist);

      try {
        // Remove product from wishlist (DELETE request)
        await axios.delete(`http://localhost:8000/api/wishlist/`, {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem('access_token')}`,
          },
          data: { product_id: productId },
        });

        alert('Product removed from your wishlist.');
      } catch (error) {
        console.error('Error removing product from wishlist:', error);
        alert('Failed to remove product from wishlist. Please try again.');

        // Revert the optimistic update in case of an error
        setWishlist([...updatedWishlist, productId]);
      }
    } else {
      // Optimistically update the state before making the API request
      const updatedWishlist = [...wishlist, productId];
      setWishlist(updatedWishlist);

      try {
        // Add product to wishlist (POST request)
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
        alert('Failed to add product to wishlist. Please try again.');

        // Revert the optimistic update in case of an error
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
          const isWishlisted = isLoggedIn && wishlist.includes(product.id); // Only show filled hearts if logged in

          return (
            <Grid
              item
              key={product.id}
              sx={{
                width: '300px',
                height: '450px',
              }}
            >
              <Link to={`/product/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
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
                  {/* Image Container with Heart Icon */}
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
                      src={product.image || 'https://via.placeholder.com/300'}
                      alt={product.name}
                      style={{
                        maxHeight: '100%',
                        maxWidth: '100%',
                        objectFit: 'contain',
                      }}
                    />
                    {/* Heart Icon */}
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        cursor: 'pointer',
                      }}
                      onClick={(e) => {
                        e.preventDefault(); // Prevent navigation on heart click
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

                  {/* Out of Stock Overlay */}
                  {product.quantity_in_stock <= 0 && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                        color: 'black',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        fontWeight: 'bold',
                        fontSize: '1.2rem',
                        borderRadius: 1,
                      }}
                    >
                      Out of Stock
                    </Box>
                  )}

                  {/* Product Details */}
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
                        WebkitLineClamp: 2,
                        overflow: 'hidden',
                        height: '3.2em',
                      }}
                    >
                      {product.name}
                    </Typography>

                    {/* Rating */}
                    {rating > 0 ? (
                      <Box sx={{ display: 'flex', alignItems: 'left', justifyContent: 'left' }}>
                        {renderStars(rating)}
                        <Typography variant="body2" sx={{ marginLeft: 1 }}>
                          ({rating.toFixed(1)})
                        </Typography>
                      </Box>
                    ) : (
                      <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'left' }}>
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
                </Card>
              </Link>
            </Grid>
          );
        })
      )}
    </Grid>
  );
}
