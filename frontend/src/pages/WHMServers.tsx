import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Avatar,
  Card,
  CardContent,
  useTheme,
  alpha,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  CloudQueue as WHMIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Storage as StorageIcon,
  Speed as SpeedIcon,
  Person as PersonIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';

import { ModernDashboardLayout } from '../layouts/ModernDashboardLayout';
import { DataTable, TableColumn } from '../components/data-table';
import { StatsCard } from '../components/dashboard/DashboardWidgets';

interface WHMServer {
  id: string;
  name: string;
  hostname: string;
  port: number;
  username: string;
  apiToken: string;
  status: 'online' | 'offline' | 'error';
  lastChecked: Date;
  version?: string;
  accounts?: number;
  diskUsage?: {
    used: number;
    total: number;
    percentage: number;
  };
  loadAverage?: number;
}

interface WHMAccount {
  user: string;
  domain: string;
  email: string;
  diskUsed: number;
  diskLimit: number;
  suspended: boolean;
}

const mockServers: WHMServer[] = [
  {
    id: '1',
    name: 'Main Production Server',
    hostname: 'whm1.example.com',
    port: 2087,
    username: 'root',
    apiToken: 'XXXXXXXXXXXXX',
    status: 'online',
    lastChecked: new Date(),
    version: '102.0.15',
    accounts: 45,
    diskUsage: { used: 120, total: 500, percentage: 24 },
    loadAverage: 1.2,
  },
  {
    id: '2',
    name: 'Development Server',
    hostname: 'whm-dev.example.com',
    port: 2087,
    username: 'root',
    apiToken: 'YYYYYYYYYYYYY',
    status: 'online',
    lastChecked: new Date(Date.now() - 300000),
    version: '102.0.14',
    accounts: 12,
    diskUsage: { used: 80, total: 200, percentage: 40 },
    loadAverage: 0.8,
  },
  {
    id: '3',
    name: 'Backup Server',
    hostname: 'whm-backup.example.com',
    port: 2087,
    username: 'root',
    apiToken: 'ZZZZZZZZZZZZZ',
    status: 'error',
    lastChecked: new Date(Date.now() - 3600000),
    version: '101.0.22',
    accounts: 0,
    diskUsage: { used: 300, total: 1000, percentage: 30 },
    loadAverage: 0.1,
  },
];

export default function WHMServers() {
  const theme = useTheme();
  const [servers, setServers] = useState<WHMServer[]>(mockServers);
  const [loading, setLoading] = useState(false);
  const [selectedServerId, setSelectedServerId] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
  const [accounts, setAccounts] = useState<WHMAccount[]>([]);
  const [viewAccountsDialog, setViewAccountsDialog] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    hostname: '',
    port: 2087,
    username: 'root',
    apiToken: '',
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'success';
      case 'offline': return 'warning';
      case 'error': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return <CheckCircleIcon />;
      case 'offline': return <WarningIcon />;
      case 'error': return <ErrorIcon />;
      default: return <WHMIcon />;
    }
  };

  const handleOpenDialog = (mode: 'add' | 'edit', server?: WHMServer) => {
    setDialogMode(mode);
    if (mode === 'edit' && server) {
      setFormData({
        name: server.name,
        hostname: server.hostname,
        port: server.port,
        username: server.username,
        apiToken: server.apiToken,
      });
      setSelectedServerId(server.id);
    } else {
      setFormData({
        name: '',
        hostname: '',
        port: 2087,
        username: 'root',
        apiToken: '',
      });
      setSelectedServerId(null);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData({
      name: '',
      hostname: '',
      port: 2087,
      username: 'root',
      apiToken: '',
    });
  };

  const handleSaveServer = () => {
    if (dialogMode === 'add') {
      const newServer: WHMServer = {
        id: Date.now().toString(),
        ...formData,
        status: 'offline',
        lastChecked: new Date(),
      };
      setServers([...servers, newServer]);
    } else if (selectedServerId) {
      setServers(servers.map(server => 
        server.id === selectedServerId 
          ? { ...server, ...formData }
          : server
      ));
    }
    handleCloseDialog();
  };

  const handleDeleteServer = (server: WHMServer) => {
    setServers(servers.filter(s => s.id !== server.id));
  };

  const handleRefreshServer = async (server: WHMServer) => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setServers(servers.map(s => 
        s.id === server.id 
          ? { ...s, lastChecked: new Date(), status: Math.random() > 0.2 ? 'online' : 'error' }
          : s
      ));
      setLoading(false);
    }, 1000);
  };

  const handleViewAccounts = (server: WHMServer) => {
    // Mock account data
    const mockAccounts: WHMAccount[] = [
      { user: 'user1', domain: 'example1.com', email: 'admin@example1.com', diskUsed: 256, diskLimit: 1024, suspended: false },
      { user: 'user2', domain: 'example2.com', email: 'admin@example2.com', diskUsed: 512, diskLimit: 2048, suspended: false },
      { user: 'user3', domain: 'example3.com', email: 'admin@example3.com', diskUsed: 128, diskLimit: 512, suspended: true },
    ];
    setAccounts(mockAccounts);
    setSelectedServerId(server.id);
    setViewAccountsDialog(true);
  };

  const refreshAllServers = () => {
    setLoading(true);
    setTimeout(() => {
      setServers(servers.map(server => ({
        ...server,
        lastChecked: new Date(),
        status: Math.random() > 0.1 ? 'online' : 'error',
      })));
      setLoading(false);
    }, 2000);
  };

  const columns: TableColumn<WHMServer>[] = [
    {
      id: 'name',
      label: 'Server Name',
      render: (value, row) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.12) }}>
            <WHMIcon color="primary" />
          </Avatar>
          <Box>
            <Typography variant="subtitle2" fontWeight={600}>
              {value}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {row.hostname}:{row.port}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      id: 'status',
      label: 'Status',
      render: (value) => (
        <Chip
          icon={getStatusIcon(value)}
          label={value.charAt(0).toUpperCase() + value.slice(1)}
          color={getStatusColor(value) as any}
          size="small"
        />
      ),
    },
    {
      id: 'version',
      label: 'Version',
      render: (value) => value || 'Unknown',
    },
    {
      id: 'accounts',
      label: 'Accounts',
      render: (value) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PersonIcon fontSize="small" color="action" />
          <Typography variant="body2">{value || 0}</Typography>
        </Box>
      ),
    },
    {
      id: 'diskUsage',
      label: 'Disk Usage',
      render: (value) => value ? (
        <Box>
          <Typography variant="body2">
            {value.used}GB / {value.total}GB
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {value.percentage}% used
          </Typography>
        </Box>
      ) : 'N/A',
    },
    {
      id: 'loadAverage',
      label: 'Load Avg',
      render: (value) => value ? (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SpeedIcon fontSize="small" color="action" />
          <Typography variant="body2">{value}</Typography>
        </Box>
      ) : 'N/A',
    },
    {
      id: 'lastChecked',
      label: 'Last Checked',
      render: (value) => (
        <Typography variant="caption" color="text.secondary">
          {new Date(value).toLocaleString()}
        </Typography>
      ),
    },
  ];

  const actions = [
    {
      label: 'Edit',
      icon: <EditIcon />,
      onClick: (server: WHMServer) => handleOpenDialog('edit', server),
    },
    {
      label: 'Refresh',
      icon: <RefreshIcon />,
      onClick: (server: WHMServer) => handleRefreshServer(server),
    },
    {
      label: 'View Accounts',
      icon: <ViewIcon />,
      onClick: (server: WHMServer) => handleViewAccounts(server),
    },
    {
      label: 'Delete',
      icon: <DeleteIcon />,
      onClick: (server: WHMServer) => handleDeleteServer(server),
      color: 'error' as const,
    },
  ];

  const accountColumns: TableColumn<WHMAccount>[] = [
    { id: 'user', label: 'Username' },
    { id: 'domain', label: 'Domain' },
    { id: 'email', label: 'Email' },
    {
      id: 'diskUsed',
      label: 'Disk Usage',
      render: (value, row) => `${value}MB / ${row.diskLimit}MB`,
    },
    {
      id: 'suspended',
      label: 'Status',
      render: (value) => (
        <Chip
          label={value ? 'Suspended' : 'Active'}
          color={value ? 'error' : 'success'}
          size="small"
        />
      ),
    },
  ];

  const totalServers = servers.length;
  const onlineServers = servers.filter(s => s.status === 'online').length;
  const totalAccounts = servers.reduce((sum, server) => sum + (server.accounts || 0), 0);
  const avgLoadAverage = servers.reduce((sum, server) => sum + (server.loadAverage || 0), 0) / servers.length;

  return (
    <ModernDashboardLayout>
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              WHM Servers
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage your WHM/cPanel servers from one central dashboard
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog('add')}
          >
            Add Server
          </Button>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatsCard
              title="Total Servers"
              value={totalServers}
              subtitle="Configured servers"
              icon={<WHMIcon />}
              color="primary"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatsCard
              title="Online Servers"
              value={onlineServers}
              subtitle={`${Math.round((onlineServers / totalServers) * 100)}% uptime`}
              icon={<CheckCircleIcon />}
              color="success"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatsCard
              title="Total Accounts"
              value={totalAccounts}
              subtitle="Across all servers"
              icon={<PersonIcon />}
              color="info"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatsCard
              title="Avg Load"
              value={avgLoadAverage.toFixed(2)}
              subtitle="System load average"
              icon={<SpeedIcon />}
              color="warning"
            />
          </Grid>
        </Grid>

        <Card>
          <DataTable
            title="Server Management"
            data={servers}
            columns={columns}
            loading={loading}
            actions={actions}
            onAdd={() => handleOpenDialog('add')}
            onRefresh={refreshAllServers}
            searchPlaceholder="Search servers..."
            emptyMessage="No WHM servers configured. Add your first server to get started."
          />
        </Card>

        {/* Add/Edit Server Dialog */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            {dialogMode === 'add' ? 'Add New WHM Server' : 'Edit WHM Server'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
              <TextField
                label="Server Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                fullWidth
                required
                placeholder="e.g., Production Server"
              />
              <TextField
                label="Hostname"
                value={formData.hostname}
                onChange={(e) => setFormData({ ...formData, hostname: e.target.value })}
                fullWidth
                required
                placeholder="e.g., whm.example.com"
              />
              <TextField
                label="Port"
                type="number"
                value={formData.port}
                onChange={(e) => setFormData({ ...formData, port: parseInt(e.target.value) })}
                fullWidth
                required
              />
              <TextField
                label="Username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                fullWidth
                required
              />
              <TextField
                label="API Token"
                value={formData.apiToken}
                onChange={(e) => setFormData({ ...formData, apiToken: e.target.value })}
                fullWidth
                required
                type="password"
                placeholder="Enter your WHM API token"
              />
              <Alert severity="info">
                To generate an API token, log into your WHM, go to Development → Manage API Tokens, and create a new token.
              </Alert>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button 
              onClick={handleSaveServer} 
              variant="contained"
              disabled={!formData.name || !formData.hostname || !formData.apiToken}
            >
              {dialogMode === 'add' ? 'Add Server' : 'Save Changes'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* View Accounts Dialog */}
        <Dialog open={viewAccountsDialog} onClose={() => setViewAccountsDialog(false)} maxWidth="lg" fullWidth>
          <DialogTitle>cPanel Accounts</DialogTitle>
          <DialogContent>
            <DataTable
              data={accounts}
              columns={accountColumns}
              pagination={false}
              searchable={false}
              emptyMessage="No accounts found on this server."
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setViewAccountsDialog(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </ModernDashboardLayout>
  );
}