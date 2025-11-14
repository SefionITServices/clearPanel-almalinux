import React, { useState } from 'react';
import {
  AppBar,
  Box,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Container,
  Button,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  useTheme,
  alpha,
  Badge,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Folder as FolderIcon,
  Terminal as TerminalIcon,
  Settings as SettingsIcon,
  Web as WebIcon,
  Dns as DnsIcon,
  Add as AddIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
  Notifications as NotificationsIcon,
  MoreVert as MoreVertIcon,
  CloudQueue as WHMIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { Searchbar } from '../components/searchbar';

const DRAWER_WIDTH = 280;

const navItems = [
  { title: 'Dashboard', path: '/dashboard', icon: <DashboardIcon /> },
  { title: 'File Manager', path: '/files', icon: <FolderIcon /> },
  { title: 'Terminal', path: '/terminal', icon: <TerminalIcon /> },
  { title: 'Tools', path: '/tools', icon: <SettingsIcon /> },
  { 
    title: 'Domains', 
    path: '/domains', 
    icon: <WebIcon />,
    subItems: [
      { title: 'List Domains', path: '/domains' },
      { title: 'Create Domain', path: '/domains/new' },
      { title: 'DNS Editor', path: '/dns' }
    ]
  },
  { title: 'WHM Servers', path: '/whm', icon: <WHMIcon /> },
];

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function ModernDashboardLayout({ children }: DashboardLayoutProps) {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountMenuAnchor, setAccountMenuAnchor] = useState<null | HTMLElement>(null);
  const [notificationMenuAnchor, setNotificationMenuAnchor] = useState<null | HTMLElement>(null);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleAccountMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAccountMenuAnchor(event.currentTarget);
  };

  const handleAccountMenuClose = () => {
    setAccountMenuAnchor(null);
  };

  const handleNotificationMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationMenuAnchor(event.currentTarget);
  };

  const handleNotificationMenuClose = () => {
    setNotificationMenuAnchor(null);
  };

  const handleLogout = () => {
    logout();
    handleAccountMenuClose();
    navigate('/login');
  };

  const isActivePath = (path: string) => {
    return location.pathname === path || 
           (path !== '/dashboard' && location.pathname.startsWith(path));
  };

  const renderNavItems = (items: typeof navItems) => (
    <List sx={{ px: 2 }}>
      {items.map((item) => (
        <React.Fragment key={item.title}>
          <ListItem 
            disablePadding 
            sx={{ 
              mb: 0.5,
              borderRadius: 1,
              overflow: 'hidden',
            }}
          >
            <ListItemButton
              onClick={() => navigate(item.path)}
              sx={{
                borderRadius: 1,
                py: 1.2,
                px: 2,
                minHeight: 48,
                backgroundColor: isActivePath(item.path) ? alpha(theme.palette.primary.main, 0.12) : 'transparent',
                color: isActivePath(item.path) ? theme.palette.primary.main : theme.palette.text.primary,
                '&:hover': {
                  backgroundColor: isActivePath(item.path) 
                    ? alpha(theme.palette.primary.main, 0.16)
                    : alpha(theme.palette.action.hover, 0.04),
                },
                '& .MuiListItemIcon-root': {
                  color: 'inherit',
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.title}
                primaryTypographyProps={{
                  variant: 'body2',
                  fontWeight: isActivePath(item.path) ? 600 : 400,
                }}
              />
            </ListItemButton>
          </ListItem>
          
          {/* Sub-items for domains */}
          {item.subItems && isActivePath('/domains') && (
            <Box sx={{ ml: 3, mb: 1 }}>
              {item.subItems.map((subItem) => (
                <ListItem key={subItem.title} disablePadding>
                  <ListItemButton
                    onClick={() => navigate(subItem.path)}
                    sx={{
                      borderRadius: 1,
                      py: 0.8,
                      px: 1.5,
                      minHeight: 36,
                      backgroundColor: location.pathname === subItem.path ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
                      color: location.pathname === subItem.path ? theme.palette.primary.main : theme.palette.text.secondary,
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.action.hover, 0.04),
                      },
                    }}
                  >
                    <ListItemText 
                      primary={subItem.title}
                      primaryTypographyProps={{
                        variant: 'caption',
                        fontWeight: location.pathname === subItem.path ? 600 : 400,
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </Box>
          )}
        </React.Fragment>
      ))}
    </List>
  );

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Logo Section */}
      <Box sx={{ p: 3, borderBottom: `1px solid ${theme.palette.divider}` }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
          clearPanel
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          AlmaLinux Control Panel
        </Typography>
      </Box>

      {/* Navigation */}
      <Box sx={{ flex: 1, py: 2 }}>
        {renderNavItems(navItems)}
      </Box>

      {/* Quick Actions */}
      <Box sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
        <Button
          fullWidth
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={() => navigate('/domains/new')}
          sx={{ mb: 1 }}
        >
          Quick Create
        </Button>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Header */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { lg: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { lg: `${DRAWER_WIDTH}px` },
          borderBottom: `1px solid ${theme.palette.divider}`,
          backdropFilter: 'blur(6px)',
          backgroundColor: alpha(theme.palette.background.paper, 0.8),
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', minHeight: 70 }}>
          {/* Left Section */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ 
                mr: 2, 
                display: { lg: 'none' },
                color: 'text.primary'
              }}
            >
              <MenuIcon />
            </IconButton>

            {/* Page Title */}
            <Typography variant="h6" noWrap sx={{ color: 'text.primary', fontWeight: 600 }}>
              {navItems.find(item => isActivePath(item.path))?.title || 'clearPanel'}
            </Typography>
          </Box>

          {/* Center Section */}
          <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', maxWidth: 600 }}>
            <Searchbar sx={{ maxWidth: 400, width: '100%' }} />
          </Box>

          {/* Right Section */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Notifications */}
            <IconButton
              onClick={handleNotificationMenuOpen}
              sx={{ color: 'text.primary' }}
            >
              <Badge badgeContent={3} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>

            {/* Account Menu */}
            <IconButton
              onClick={handleAccountMenuOpen}
              sx={{ p: 0, ml: 1 }}
            >
              <Avatar sx={{ width: 32, height: 32, bgcolor: theme.palette.primary.main }}>
                <PersonIcon fontSize="small" />
              </Avatar>
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Box
        component="nav"
        sx={{ width: { lg: DRAWER_WIDTH }, flexShrink: { lg: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', lg: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: DRAWER_WIDTH,
              border: 'none',
              boxShadow: theme.shadows[24],
            },
          }}
        >
          {drawer}
        </Drawer>

        {/* Desktop Drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', lg: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: DRAWER_WIDTH,
              border: 'none',
              borderRight: `1px solid ${theme.palette.divider}`,
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { lg: `calc(100% - ${DRAWER_WIDTH}px)` },
          minHeight: '100vh',
          backgroundColor: theme.palette.grey[50],
        }}
      >
        <Toolbar sx={{ minHeight: 70 }} />
        <Container maxWidth="xl" sx={{ py: 3 }}>
          {children}
        </Container>
      </Box>

      {/* Account Menu */}
      <Menu
        anchorEl={accountMenuAnchor}
        open={Boolean(accountMenuAnchor)}
        onClose={handleAccountMenuClose}
        PaperProps={{
          sx: { width: 200, mt: 1.5 }
        }}
      >
        <MenuItem onClick={() => { navigate('/profile'); handleAccountMenuClose(); }}>
          <PersonIcon sx={{ mr: 2 }} />
          Profile
        </MenuItem>
        <MenuItem onClick={() => { navigate('/settings'); handleAccountMenuClose(); }}>
          <SettingsIcon sx={{ mr: 2 }} />
          Settings
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <LogoutIcon sx={{ mr: 2 }} />
          Logout
        </MenuItem>
      </Menu>

      {/* Notifications Menu */}
      <Menu
        anchorEl={notificationMenuAnchor}
        open={Boolean(notificationMenuAnchor)}
        onClose={handleNotificationMenuClose}
        PaperProps={{
          sx: { width: 300, mt: 1.5 }
        }}
      >
        <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
          <Typography variant="h6">Notifications</Typography>
        </Box>
        <MenuItem>
          <Box>
            <Typography variant="subtitle2">System Update Available</Typography>
            <Typography variant="caption" color="text.secondary">
              New version 2.1.0 is ready to install
            </Typography>
          </Box>
        </MenuItem>
        <MenuItem>
          <Box>
            <Typography variant="subtitle2">Backup Completed</Typography>
            <Typography variant="caption" color="text.secondary">
              Daily backup finished successfully
            </Typography>
          </Box>
        </MenuItem>
        <MenuItem>
          <Box>
            <Typography variant="subtitle2">High CPU Usage</Typography>
            <Typography variant="caption" color="text.secondary">
              Server load is above 80%
            </Typography>
          </Box>
        </MenuItem>
      </Menu>
    </Box>
  );
}

export default ModernDashboardLayout;