import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  IconButton,
  Dialog,
  MenuItem,
  InputBase,
  Typography,
  Chip,
  useTheme,
  useMediaQuery,
} from '@mui/material';

import { 
  Search as SearchIcon, 
  Close as CloseIcon,
  Dashboard as DashboardIcon,
  Folder as FolderIcon,
  Terminal as TerminalIcon,
  Settings as SettingsIcon,
  Web as WebIcon,
  Dns as DnsIcon
} from '@mui/icons-material';

// ----------------------------------------------------------------------

interface SearchItem {
  title: string;
  path: string;
  description?: string;
  icon?: React.ReactNode;
  keywords?: string[];
}

const searchData: SearchItem[] = [
  {
    title: 'Dashboard',
    path: '/dashboard',
    description: 'System overview and statistics',
    icon: <DashboardIcon />,
    keywords: ['dashboard', 'home', 'overview', 'stats']
  },
  {
    title: 'File Manager',
    path: '/files',
    description: 'Browse and manage files',
    icon: <FolderIcon />,
    keywords: ['files', 'folder', 'upload', 'download', 'browse']
  },
  {
    title: 'Terminal',
    path: '/terminal',
    description: 'Command line interface',
    icon: <TerminalIcon />,
    keywords: ['terminal', 'console', 'command', 'shell', 'cli']
  },
  {
    title: 'Tools',
    path: '/tools',
    description: 'System tools and utilities',
    icon: <SettingsIcon />,
    keywords: ['tools', 'utilities', 'system', 'manage']
  },
  {
    title: 'Domains',
    path: '/domains',
    description: 'Manage domains and DNS',
    icon: <WebIcon />,
    keywords: ['domains', 'website', 'manage', 'list']
  },
  {
    title: 'DNS Editor',
    path: '/dns',
    description: 'Edit DNS records',
    icon: <DnsIcon />,
    keywords: ['dns', 'records', 'editor', 'nameserver']
  },
  {
    title: 'Create Domain',
    path: '/domains/new',
    description: 'Add a new domain',
    icon: <WebIcon />,
    keywords: ['create', 'add', 'new', 'domain']
  },
  {
    title: 'WHM Servers',
    path: '/whm',
    description: 'Manage WHM/cPanel servers',
    icon: <SettingsIcon />,
    keywords: ['whm', 'cpanel', 'servers', 'hosting']
  }
];

interface SearchbarProps {
  placeholder?: string;
  sx?: any;
}

export function Searchbar({ placeholder = 'Search...', sx, ...other }: SearchbarProps) {
  const theme = useTheme();
  const navigate = useNavigate();
  const smUp = useMediaQuery(theme.breakpoints.up('sm'));

  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleClose = useCallback(() => {
    setOpen(false);
    setSearchQuery('');
  }, []);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setOpen(!open);
        setSearchQuery('');
      }
      if (event.key === 'Escape') {
        handleClose();
      }
    },
    [open, handleClose]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  const handleSearch = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  }, []);

  const filteredData = useMemo(() => {
    if (!searchQuery) return searchData;
    
    const query = searchQuery.toLowerCase();
    return searchData.filter(item => 
      item.title.toLowerCase().includes(query) ||
      item.description?.toLowerCase().includes(query) ||
      item.keywords?.some(keyword => keyword.toLowerCase().includes(query))
    );
  }, [searchQuery]);

  const handleItemClick = (path: string) => {
    navigate(path);
    handleClose();
  };

  const renderButton = () => (
    <Box
      onClick={() => setOpen(true)}
      sx={{
        display: 'flex',
        alignItems: 'center',
        cursor: 'pointer',
        borderRadius: 1.5,
        bgcolor: theme.palette.grey[100],
        transition: theme.transitions.create(['background-color', 'box-shadow'], {
          easing: theme.transitions.easing.easeInOut,
          duration: theme.transitions.duration.shortest,
        }),
        '&:hover': {
          bgcolor: theme.palette.grey[200],
        },
        ...(smUp && {
          pr: 1,
          minWidth: 260,
          height: 40,
        }),
        ...(!smUp && {
          minWidth: 'auto',
          p: 1,
        }),
        ...sx,
      }}
      {...other}
    >
      <IconButton size="small" sx={{ color: 'text.secondary' }}>
        <SearchIcon />
      </IconButton>

      {smUp && (
        <>
          <Typography variant="body2" sx={{ color: 'text.secondary', flex: 1 }}>
            {placeholder}
          </Typography>
          <Chip
            size="small"
            label="Ctrl+K"
            sx={{
              height: 20,
              fontSize: 11,
              color: 'text.secondary',
              bgcolor: 'transparent',
              border: `1px solid ${theme.palette.divider}`,
            }}
          />
        </>
      )}
    </Box>
  );

  const renderDialog = () => (
    <Dialog
      fullWidth
      maxWidth="sm"
      open={open}
      onClose={handleClose}
      PaperProps={{
        sx: {
          mt: 15,
          overflow: 'unset',
        },
      }}
      sx={{
        '& .MuiDialog-container': {
          alignItems: 'flex-start',
        },
      }}
    >
      <Box sx={{ p: 3, borderBottom: `1px solid ${theme.palette.divider}` }}>
        <InputBase
          fullWidth
          autoFocus
          placeholder="Search for pages, features..."
          value={searchQuery}
          onChange={handleSearch}
          startAdornment={
            <IconButton sx={{ mr: 1 }}>
              <SearchIcon sx={{ color: 'text.secondary' }} />
            </IconButton>
          }
          endAdornment={
            <IconButton onClick={handleClose} edge="end">
              <CloseIcon />
            </IconButton>
          }
          sx={{
            '& .MuiInputBase-input': {
              fontSize: '1.25rem',
              fontWeight: 600,
            },
          }}
        />
      </Box>

      <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
        {filteredData.length > 0 ? (
          <Box>
            {filteredData.map((item, index) => (
              <MenuItem
                key={index}
                onClick={() => handleItemClick(item.path)}
                sx={{
                  gap: 2,
                  py: 1.5,
                  px: 2.5,
                  '&:hover': {
                    bgcolor: 'action.hover',
                  },
                }}
              >
                {item.icon && (
                  <Box sx={{ color: 'text.secondary', minWidth: 24 }}>
                    {item.icon}
                  </Box>
                )}
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" noWrap>
                    {item.title}
                  </Typography>
                  {item.description && (
                    <Typography 
                      variant="caption" 
                      sx={{ color: 'text.secondary' }}
                      noWrap
                    >
                      {item.description}
                    </Typography>
                  )}
                </Box>
              </MenuItem>
            ))}
          </Box>
        ) : (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              No results found
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Try searching for something else
            </Typography>
          </Box>
        )}
      </Box>
    </Dialog>
  );

  return (
    <>
      {renderButton()}
      {renderDialog()}
    </>
  );
}