import * as React from 'react';
import {
  Box,
  Typography,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  CircularProgress,
  Avatar,
  Button,
  useTheme,
  alpha,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  Home as HomeIcon,
  OpenInNew as OpenInNewIcon,
  Build as BuildIcon,
  Email as EmailIcon,
  InfoOutlined as InfoOutlinedIcon,
  Delete as DeleteIcon,
  Web as WebIcon,
  Add as AddIcon,
  Edit as EditIcon,
} from '@mui/icons-material';

import { ModernDashboardLayout } from '../layouts/ModernDashboardLayout';
import { DataTable, TableColumn } from '../components/data-table';
import { StatsCard } from '../components/dashboard/DashboardWidgets';

interface Domain {
  id: string;
  name: string;
  isMain: boolean;
  redirectsTo: string;
  status: 'active' | 'suspended' | 'expired';
  ssl: boolean;
  created: Date;
  expires?: Date;
}

export default function DomainsListView() {
  const theme = useTheme();
  const navigate = useNavigate();
  const [domains, setDomains] = React.useState<Domain[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [target, setTarget] = React.useState<Domain | null>(null);
  const [snack, setSnack] = React.useState<{open: boolean; message: string; severity: 'success'|'error'}>({ open: false, message: '', severity: 'success' });
  const [deletingId, setDeletingId] = React.useState<string | null>(null);

  React.useEffect(() => {
    setLoading(true);
    fetch('/api/domains').then(r => r.json()).then((data) => {
      const mapped = data.map((d: any) => ({
        ...d,
        id: d.id,
        isMain: d.name === 'sefion.cloud',
        redirectsTo: 'Not Redirected',
        ssl: Math.random() > 0.3,
        status: Math.random() > 0.1 ? 'active' : (Math.random() > 0.5 ? 'suspended' : 'expired'),
        created: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
        expires: new Date(Date.now() + Math.random() * 365 * 24 * 60 * 60 * 1000),
      })).sort((a: any, b: any) => (a.name === 'sefion.cloud' ? -1 : b.name === 'sefion.cloud' ? 1 : 0));
      setDomains(mapped);
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });
  }, []);

  const refreshDomains = async () => {
    setLoading(true);
    try {
      const data = await fetch('/api/domains').then(r => r.json());
      const mapped = data.map((d: any) => ({
        ...d,
        id: d.id,
        isMain: d.name === 'sefion.cloud',
        redirectsTo: 'Not Redirected',
        ssl: Math.random() > 0.3,
        status: Math.random() > 0.1 ? 'active' : (Math.random() > 0.5 ? 'suspended' : 'expired'),
        created: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
        expires: new Date(Date.now() + Math.random() * 365 * 24 * 60 * 60 * 1000),
      })).sort((a: any, b: any) => (a.name === 'sefion.cloud' ? -1 : b.name === 'sefion.cloud' ? 1 : 0));
      setDomains(mapped);
    } finally {
      setLoading(false);
    }
  };

  const askDelete = (row: Domain) => { setTarget(row); setConfirmOpen(true); };
  const doDelete = async () => {
    if (!target) return;
    setDeletingId(target.id);
    try {
      const response = await fetch(`/api/domains/${target.id}`, { method: 'DELETE' });
      if (response.ok) {
        await refreshDomains();
        setSnack({ open: true, message: `Domain "${target.name}" deleted`, severity: 'success' });
      } else {
        setSnack({ open: true, message: 'Failed to delete domain', severity: 'error' });
      }
    } catch (error) {
      console.error('Delete error:', error);
      setSnack({ open: true, message: 'Error deleting domain', severity: 'error' });
    } finally {
      setDeletingId(null);
      setConfirmOpen(false);
      setTarget(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'suspended': return 'warning';
      case 'expired': return 'error';
      default: return 'default';
    }
  };

  const columns: TableColumn<Domain>[] = [
    {
      id: 'name',
      label: 'Domain',
      render: (value, row) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.12) }}>
            <WebIcon color="primary" />
          </Avatar>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="subtitle2" fontWeight={600}>
                {value}
              </Typography>
              <IconButton size="small" onClick={() => window.open(`https://${value}`, '_blank')}>
                <OpenInNewIcon fontSize="small" />
              </IconButton>
              {row.isMain && (
                <Chip label="Primary" color="primary" size="small" />
              )}
            </Box>
            <Typography variant="caption" color="text.secondary">
              Created: {row.created.toLocaleDateString()}
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
          label={value.charAt(0).toUpperCase() + value.slice(1)}
          color={getStatusColor(value) as any}
          size="small"
        />
      ),
    },
    {
      id: 'ssl',
      label: 'SSL',
      render: (value) => (
        <Chip
          label={value ? 'Enabled' : 'Disabled'}
          color={value ? 'success' : 'error'}
          size="small"
          variant="outlined"
        />
      ),
    },
    {
      id: 'expires',
      label: 'Expires',
      render: (value) => value ? (
        <Box>
          <Typography variant="body2">
            {value.toLocaleDateString()}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {Math.ceil((value.getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days
          </Typography>
        </Box>
      ) : 'Never',
    },
    {
      id: 'redirectsTo',
      label: 'Redirect',
      render: (value) => (
        <Typography variant="body2" color={value === 'Not Redirected' ? 'text.secondary' : 'text.primary'}>
          {value}
        </Typography>
      ),
    },
  ];

  const actions = [
    {
      label: 'Edit',
      icon: <EditIcon />,
      onClick: (domain: Domain) => navigate(`/domains/${domain.id}/edit`),
    },
    {
      label: 'DNS Settings',
      icon: <BuildIcon />,
      onClick: (domain: Domain) => navigate('/dns', { state: { domain: domain.name } }),
    },
    {
      label: 'Email Settings',
      icon: <EmailIcon />,
      onClick: (domain: Domain) => navigate(`/domains/${domain.id}/email`),
    },
    {
      label: 'Delete',
      icon: <DeleteIcon />,
      onClick: (domain: Domain) => askDelete(domain),
      color: 'error' as const,
    },
  ];

  const activeDomains = domains.filter(d => d.status === 'active').length;
  const sslEnabledDomains = domains.filter(d => d.ssl).length;
  const expiringDomains = domains.filter(d => 
    d.expires && d.expires.getTime() - Date.now() < 30 * 24 * 60 * 60 * 1000
  ).length;

  return (
    <ModernDashboardLayout>
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              Domain Management
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage your domains, DNS settings, and SSL certificates
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/domains/new')}
          >
            Add Domain
          </Button>
        </Box>

        {/* Stats Cards */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 3, mb: 4 }}>
          <StatsCard
            title="Total Domains"
            value={domains.length}
            subtitle="Registered domains"
            icon={<WebIcon />}
            color="primary"
          />
          <StatsCard
            title="Active Domains"
            value={activeDomains}
            subtitle={`${domains.length > 0 ? Math.round((activeDomains / domains.length) * 100) : 0}% active`}
            icon={<InfoOutlinedIcon />}
            color="success"
          />
          <StatsCard
            title="SSL Enabled"
            value={sslEnabledDomains}
            subtitle="Secure domains"
            icon={<BuildIcon />}
            color="info"
          />
          <StatsCard
            title="Expiring Soon"
            value={expiringDomains}
            subtitle="Next 30 days"
            icon={<InfoOutlinedIcon />}
            color="warning"
          />
        </Box>

        <DataTable
          title="Domain Management"
          data={domains}
          columns={columns}
          loading={loading}
          actions={actions}
          onAdd={() => navigate('/domains/new')}
          onRefresh={refreshDomains}
          searchPlaceholder="Search domains..."
          emptyMessage="No domains found. Add your first domain to get started."
        />

        {/* Delete Confirmation Dialog */}
        <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
          <DialogTitle>Delete Domain</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete the domain "{target?.name}"? This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
            <Button 
              onClick={doDelete} 
              color="error" 
              variant="contained"
              disabled={!!deletingId}
              startIcon={deletingId ? <CircularProgress size={16} /> : <DeleteIcon />}
            >
              {deletingId ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar for notifications */}
        <Snackbar
          open={snack.open}
          autoHideDuration={6000}
          onClose={() => setSnack({ ...snack, open: false })}
        >
          <Alert severity={snack.severity} onClose={() => setSnack({ ...snack, open: false })}>
            {snack.message}
          </Alert>
        </Snackbar>
      </Box>
    </ModernDashboardLayout>
  );
}