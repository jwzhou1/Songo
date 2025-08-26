'use client'

import React, { useState } from 'react'
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Box,
  Badge,
  useTheme,
  useMediaQuery,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material'
import {
  Menu as MenuIcon,
  LocalShipping as ShippingIcon,
  Search as SearchIcon,
  AccountCircle as AccountIcon,
  ShoppingCart as CartIcon,
  GetApp as QuoteIcon,
  Timeline as TrackIcon,
  Dashboard as DashboardIcon,
  ExitToApp as LogoutIcon
} from '@mui/icons-material'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Navbar() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const router = useRouter()
  
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const menuItems = [
    { text: 'Get Quote', icon: <QuoteIcon />, path: '/get-quote' },
    { text: 'Track Package', icon: <TrackIcon />, path: '/tracking' },
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  ]

  const drawer = (
    <Box sx={{ width: 250 }} role="presentation">
      <Box sx={{ p: 2, background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)', color: 'white' }}>
        <Typography variant="h6" component="div" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ShippingIcon />
          SonGo Enterprise
        </Typography>
      </Box>
      <List>
        {menuItems.map((item) => (
          <ListItem 
            key={item.text}
            onClick={() => {
              router.push(item.path)
              setMobileOpen(false)
            }}
            sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        <ListItem 
          onClick={() => {
            // Handle logout
            setMobileOpen(false)
          }}
          sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
        >
          <ListItemIcon><LogoutIcon /></ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItem>
      </List>
    </Box>
  )

  return (
    <>
      <AppBar position="fixed" elevation={2}>
        <Toolbar>
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <ShippingIcon sx={{ mr: 1 }} />
            <Typography
              variant="h6"
              component={Link}
              href="/"
              sx={{
                textDecoration: 'none',
                color: 'inherit',
                fontWeight: 'bold',
                '&:hover': { opacity: 0.8 }
              }}
            >
              SonGo Enterprise
            </Typography>
          </Box>

          {!isMobile && (
            <Box sx={{ display: 'flex', gap: 1, mr: 2 }}>
              <Button
                color="inherit"
                startIcon={<QuoteIcon />}
                onClick={() => router.push('/get-quote')}
                sx={{ '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
              >
                Get Quote
              </Button>
              <Button
                color="inherit"
                startIcon={<TrackIcon />}
                onClick={() => router.push('/tracking')}
                sx={{ '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
              >
                Track
              </Button>
              <Button
                color="inherit"
                startIcon={<DashboardIcon />}
                onClick={() => router.push('/dashboard')}
                sx={{ '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
              >
                Dashboard
              </Button>
            </Box>
          )}

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton
              color="inherit"
              onClick={() => router.push('/search')}
              sx={{ '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
            >
              <SearchIcon />
            </IconButton>
            
            <IconButton
              color="inherit"
              onClick={() => router.push('/cart')}
              sx={{ '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
            >
              <Badge badgeContent={0} color="error">
                <CartIcon />
              </Badge>
            </IconButton>

            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenu}
              color="inherit"
              sx={{ '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
            >
              <AccountIcon />
            </IconButton>
            
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem onClick={() => { handleClose(); router.push('/profile'); }}>
                Profile
              </MenuItem>
              <MenuItem onClick={() => { handleClose(); router.push('/settings'); }}>
                Settings
              </MenuItem>
              <MenuItem onClick={() => { handleClose(); /* handle logout */ }}>
                Logout
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 250 },
        }}
      >
        {drawer}
      </Drawer>
    </>
  )
}
