

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
                {/* Product Image */}
                <CardMedia
                  component="img"
                  alt={product.name}
                  image={product.image || 'https://via.placeholder.com/300'}
                  sx={{
                    height: '250px', // Increased height for the image
                    objectFit: 'contain',
                    borderRadius: 1,
                    backgroundColor: '#f0f0f0',
                  }}
                />
                {product.quantity_in_stock <= 0 && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: 'rgba(0, 0, 0, 0.6)',
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

                <CardContent sx={{ flexGrow: 1 }}>
                  {/* Product Name */}
                  <Typography
                    variant="h6"
                    component="div"
                    noWrap
                    sx={{
                      fontSize: '1.2rem',
                      fontWeight: 'bold',
                      textAlign: 'left',
                      marginBottom: 1,
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
                    ${new Intl.NumberFormat('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }).format(product.price)}
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