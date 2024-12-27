import React, { useState } from 'react';
import { AppBar, Toolbar, IconButton, Box, TextField, Menu, MenuItem, Drawer, List, ListItem, ListItemText, ListItemIcon } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import SettingsIcon from '@mui/icons-material/Settings';
import SearchIcon from '@mui/icons-material/Search';
import WishlistHandler from './WishlistHandler'; // Import WishlistHandler
import { Link, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import axios from 'axios';

export default function Navbar({ isAuthenticated, setIsAuthenticated, username, setUsername, onSearch }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  
  const handleSearchChange = (e) => {
    //console.log('search:', e.target.value);
    setSearchQuery(e.target.value);
  };
  
  const handleSearchSubmit = () => {
    // Allow empty searchQuery to reset products
    //console.log('query:', searchQuery);
    if (window.location.pathname === '/') {
      navigate('.', { state: { searchQuery } }); // Use relative navigation to update the state
    } else {
      navigate('/', { state: { searchQuery } }); // Navigate to Dashboard with search query
    }
  };
  
  const token = sessionStorage.getItem('access_token');

  useEffect(() => {

    setIsAuthenticated(!!token); // Update state after render
  
    if (token) {
      const storedUsername = sessionStorage.getItem('username');
      if (storedUsername) {
        setUsername(storedUsername);
      }
    }
  }, []); // Empty dependency array ensures this runs once after the component mounts
  

  const toggleDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setIsDrawerOpen(open);
  };

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('refresh_token');
    sessionStorage.removeItem('username');
    setIsAuthenticated(false);
    setUsername('');
    handleMenuClose();
    navigate('/');
  };

  const handleNavigation = (path) => {
    if (path === '/profile' && !isAuthenticated) {
      if (window.confirm("You need to log in to access your profile. Do you want to log in now?")) {
        navigate('/login', { state: { from: '/profile' } });
      }
    } else {
      navigate(path);
    }
  };

  const handleWishlistClick = () => {
    if (token) {
      navigate('/wishlist');
    } else {
      if (window.confirm('You need to log in to create and manage your wishlist. Do you want to log in now?')) {
        navigate('/login', { state: { from: '/wishlist' } });
      }
    }
  };

  const fetchUserProfile = async () => {
    try {
      const token = sessionStorage.getItem('access_token'); // Fetch token from sessionStorage
      if (!token) {
        // If no token, user is not logged in
        return { loggedIn: false };
      }
  
      const headers = {
        Authorization: `Bearer ${token}`,
      };
  
      // Make API call to fetch the user profile
      const response = await axios.get('http://localhost:8000/api/profile/', { headers });
  
      //console.log('response:', response); // Debugging to verify structure
  
      // Extract role and return it along with loggedIn status
      return {
        loggedIn: true,
        role: response.data.role, // Ensure `role` field is used from the response data
      };
    } catch (error) {
      console.error('Error fetching profile:', error);
  
      // Handle specific HTTP errors (e.g., 401 Unauthorized)
      if (error.response && error.response.status === 401) {
        return { loggedIn: false }; // Token might be invalid or expired
      }
  
      return { loggedIn: false };
    }
  };
  

  return (
    <>
      {/* Top Bar */}
      <AppBar
        position="static"
        color="primary"
        sx={{
          height: 80,
          display: 'flex',
          justifyContent: 'center',
          backgroundColor: '#2168BA',
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            height: '100%',
          }}
        >
          {/* Section 1: Menu Icon and Logo */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              sx={{
                width: 50,
                height: 80,
                display: 'flex',
                justifyContent: 'left',
                alignItems: 'left',
              }}
              onClick={toggleDrawer(true)}
            >
              <MenuIcon />
            </IconButton>

            <Box
              component={Link}
              to="/"
              sx={{
                width: 130,
                height: 80,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                textDecoration: 'none',
                color: 'inherit',
                marginLeft: '16px',
              }}
            >
              <img
                src="/sequence-music-high-resolution-logo.png"
                alt="Logo"
                style={{
                  height: '100%',
                  width: 'auto',
                  objectFit: 'contain',
                }}
              />
            </Box>
          </Box>

          {/* Section 2: Search Bar */}
          <Box
            sx={{
              width: 882,
              height: 80,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <TextField
              value={searchQuery}
              onChange={handleSearchChange}
              onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit()}
              placeholder="Find your sequence..."
              variant="outlined"
              sx={{
                width: '100%',
                '& .MuiOutlinedInput-root': {
                  height: 48,
                  borderRadius: 5,
                  backgroundColor: '#fff',
                  borderBlockColor: '#ffffff',
                  border: 'none',

                  '& fieldset': {
                    borderColor: 'none', // Set border color to white
                  },
                  '&:hover fieldset': {
                    borderColor: 'none', // Ensure the border remains white on hover
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: 'none', // Ensure the border remains white when focused
                  },
                  '& .MuiInputBase-input': {
                    border: 'none', // Removes the inner input border
                    boxShadow: 'none', // Ensures no shadow
                  },
                  
                },
              }}
            />
            <IconButton onClick={handleSearchSubmit} sx={{ marginLeft: 1 }}>
              <SearchIcon />
            </IconButton>
          </Box>

          {/* Section 3: Wishlist, Login, and Cart */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <WishlistHandler isAuthenticated={isAuthenticated} />
            <IconButton
              color="inherit"
              component={Link}
              to="/shoppingcart"
              sx={{
                width: 80,
                height: 80,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <ShoppingCartIcon sx={{ fontSize: 32 }} />
            </IconButton>
            <IconButton
              color="inherit"
              onClick={handleMenuClick}
              sx={{
                width: 80,
                height: 80,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <AccountCircleIcon sx={{ fontSize: 32 }} />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
            >
              {!token ? (
                <>
                  <MenuItem component={Link} to="/login" onClick={handleMenuClose}>
                    Login
                  </MenuItem>
                  <MenuItem component={Link} to="/register" onClick={handleMenuClose}>
                    Register
                  </MenuItem>
                </>
              ) : (
                <>
                  <MenuItem component={Link} to="/profile" onClick={handleMenuClose}>
                    Profile
                  </MenuItem>
                  <MenuItem component={Link} to="/wishlist" onClick={handleWishlistClick}>
                    Wishlist
                  </MenuItem>
                  <MenuItem onClick={handleLogout}>Logout</MenuItem>
                </>
              )}
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Drawer */}
      <Drawer
  anchor="left"
  open={isDrawerOpen}
  onClose={toggleDrawer(false)}
  sx={{
    zIndex: (theme) => theme.zIndex.drawer,
    '& .MuiDrawer-paper': {
      width: 300, // Wider drawer
      height: '100vh', // Full height
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
    },
  }}
>
  {/* Drawer Header with Button and Logo */}
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      padding: '8px 16px',
      borderBottom: '1px solid #ddd', // Divider
      height: '80px', // Match AppBar height
      backgroundColor: '#2168BA', // Match AppBar background color
    }}
  >
    {/* Close Button */}
    <IconButton
      onClick={toggleDrawer(false)}
      sx={{
        color: 'white',
      }}
    >
      <MenuIcon />
    </IconButton>

    {/* Logo */}
    <Box
      component={Link}
      to="/"
      sx={{
        height: '100%',
        width: 'auto',
        textDecoration: 'none',
        color: 'inherit',
        marginLeft: '16px', // Add spacing between button and logo
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <img
        src="/sequence-music-high-resolution-logo.png"
        alt="Logo"
        style={{
          height: '100%',
          width: 'auto',
          objectFit: 'contain',
        }}
      />
    </Box>
  </Box>
{/* Drawer Content */}
<Box
  sx={{
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'start',
    alignItems: 'start', // Ensures proper alignment of content
  }}
>
  <List sx={{ width: '100%' }}> {/* Ensure List spans the full width */}
    <ListItem
      button
      onClick={() => navigate('/')}
      sx={{ width: '100%' }} // Make ListItem span full width
    >
      <ListItemIcon>
        <HomeIcon />
      </ListItemIcon>
      <ListItemText primary="Home" />
    </ListItem>

    <ListItem
      button
      onClick={() => handleNavigation('/profile')}
      sx={{ width: '100%' }} // Make ListItem span full width
    >
      <ListItemIcon>
        <AccountCircleIcon />
      </ListItemIcon>
      <ListItemText primary="Profile" />
    </ListItem>

    <ListItem
      button
      onClick={() => navigate('/orders')}
      sx={{ width: '100%' }} // Make ListItem span full width
    >
      <ListItemIcon>
        <ShoppingCartIcon />
      </ListItemIcon>
      <ListItemText primary="Orders" />
    </ListItem>

    <ListItem
      button
      onClick={async () => {
        try {
          const result = await fetchUserProfile();

          if (!result.loggedIn) {
            if (window.confirm('You need to log in to access this page. Do you want to log in now?')) {
              navigate('/login');
            }
          } else if (result.role === 'SALES_MANAGER') {
            navigate('/salesManager');
          } else if (result.role === 'PRODUCT_MANAGER') {
            navigate('/productManager');
          } else if (result.role === 'CUSTOMER') {
            alert('You are not authorized to access this page.');
          } else {
            console.error('Unknown role:', result.role);
            alert('Unexpected role detected. Please contact support.');
          }
        } catch (error) {
          console.error('Error handling Settings button click:', error);
          alert('An error occurred while trying to access this page. Please try again.');
        }
      }}
      sx={{ width: '100%' }} // Make ListItem span full width
    >
      <ListItemIcon>
        <SettingsIcon />
      </ListItemIcon>
      <ListItemText primary="Settings" />
    </ListItem>
  </List>
</Box>
</Drawer>

    </>
  );
}
