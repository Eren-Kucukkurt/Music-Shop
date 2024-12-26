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
        sx={{ zIndex: (theme) => theme.zIndex.appBar - 1 }}
      >
        <Box
          sx={{
            width: 250,
          }}
          role="presentation"
          onClick={toggleDrawer(false)}
          onKeyDown={toggleDrawer(false)}
        >
          <List>
            <ListItem button onClick={() => navigate('/')}>
              <ListItemIcon>
                <HomeIcon />
              </ListItemIcon>
              <ListItemText primary="Home" />
            </ListItem>
            <ListItem button onClick={() => handleNavigation('/profile')}>
              <ListItemIcon>
                <AccountCircleIcon />
              </ListItemIcon>
              <ListItemText primary="Profile" />
            </ListItem>
            <ListItem button onClick={() => navigate('/orders')}>
              <ListItemIcon>
                <ShoppingCartIcon />
              </ListItemIcon>
              <ListItemText primary="Orders" />
            </ListItem>
            <ListItem button onClick={() => navigate('/settings')}>
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
