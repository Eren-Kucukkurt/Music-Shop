import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { useNavigate } from 'react-router-dom';

export default function WishlistHandler({ isAuthenticated }) {
  const navigate = useNavigate();

  const handleWishlistClick = () => {
    if (isAuthenticated) {
      navigate('/wishlist'); // Navigate to wishlist if authenticated
    } else {
      if (window.confirm("You need to log in to create and manage your wishlist. Do you want to log in now?")) {
        navigate('/login', { state: { from: '/wishlist' } }); // Redirect to login page
      }
    }
  };

  return (
    <Tooltip title="Wishlist">
      <IconButton
        onClick={handleWishlistClick}
        color="inherit"
        sx={{
          width: 80,
          height: 80,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <FavoriteIcon sx={{ fontSize: 32 }} />
      </IconButton>
    </Tooltip>
  );
}
