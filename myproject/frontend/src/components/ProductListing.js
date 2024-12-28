

import React from 'react';
import { Grid, Card, CardContent, CardMedia, Typography, Box } from '@mui/material';
import { Star, StarHalf, StarOutline } from '@mui/icons-material';
import { Link } from 'react-router-dom';

export default function ProductListing({ products, isLoading }) {
  if (isLoading) {
    return (
      <Typography variant="h6" sx={{ textAlign: 'center', marginTop: 3 }}>
        Loading products...
      </Typography>
    );
  }

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
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

  return (
    <Grid
      container
      spacing={3}
      justifyContent="flex-start" // Left-aligns the cards
      sx={{ padding: 3 }}
    >
      {products.length === 0 ? (
        <Grid item xs={12}>
          <Typography variant="h6" sx={{ textAlign: 'center' }}>
            No products found.
          </Typography>
        </Grid>
      ) : (
        products.map((product) => {
          const rating = parseFloat(product.rating) || 0;

          return (
            <Grid
              item
              key={product.id}
              sx={{
                width: '300px', // Increased width
                height: '450px', // Increased height
              }}
            >
              <Link
                to={`/product/${product.id}`}
                style={{ textDecoration: 'none', color: 'inherit' }}
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
                {/* Fixed Image Container */}
                <Box
                  sx={{
                    height: '250px', // Fixed height for the image box
                    width: '100%', // Spans the full card width
                    display: 'flex', // Flexbox for centering the image
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: '#ffffff', // Optional background color for empty areas
                    overflow: 'hidden', // Ensure image stays contained
                    borderRadius: 1,
                  }}
                >
                  <img
                    src={product.image || 'https://via.placeholder.com/300'}
                    alt={product.name}
                    style={{
                      maxHeight: '100%', // Scale down to fit the container's height
                      maxWidth: '100%', // Scale down to fit the container's width
                      objectFit: 'contain', // Maintain aspect ratio
                    }}
                  />
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
                      backgroundColor: 'rgb(255, 255, 255)',
                      color: 'white',
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
                  {/* Product Name */}
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
                        {/* Original Price (Struck-through, smaller, gray) */}
                        <Typography
                          variant="body2"
                          sx={{
                            textDecoration: 'line-through', // Strike-through
                            color: '#615e5e', // Gray tone
                            fontSize: '1rem', // Smaller size
                            marginRight: 1,
                          }}
                          component="span"
                        >
                          ${new Intl.NumberFormat('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          }).format(product.price)}
                        </Typography>
                        {/* Discounted Price */}
                        <Typography
                          variant="h6"
                          sx={{
                            color: '#333', // Main color
                            fontWeight: 'bold', // Emphasized
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
                      // Regular Price (No discount active)
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