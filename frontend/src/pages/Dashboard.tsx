import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, useTheme } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  Storage as StorageIcon,
  Folder as FolderIcon,
  Terminal as TerminalIcon,
  Web as WebIcon,
  CloudQueue as WHMIcon,
  Settings as SettingsIcon,
  Speed as SpeedIcon,
  Memory as MemoryIcon,
  Security as SecurityIcon,
  Backup as BackupIcon,
  Update as UpdateIcon,
  Notifications as NotificationIcon,
} from '@mui/icons-material';

import { ModernDashboardLayout } from '../layouts/ModernDashboardLayout';
import { 
  StatsCard, 
  QuickActionCard, 
  ActivityCard 
} from '../components/dashboard/DashboardWidgets';

interface SystemStats {
  totalFiles: number;
  storageUsed: string;
  storagePercent: number;
  cpuUsage: number;
  memoryUsage: number;
  activeConnections: number;
}

export default function DashboardPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const [stats, setStats] = useState<SystemStats>({
    totalFiles: 1247,
    storageUsed: '24.6 GB',
    storagePercent: 68,
    cpuUsage: 34,
    memoryUsage: 72,
    activeConnections: 12,
  });

  const quickActions = [
    {
      title: 'File Manager',
      description: 'Browse and manage your files',
      icon: <FolderIcon />,
      color: 'primary' as const,
      onClick: () => navigate('/files'),
    },
    {
      title: 'Terminal',
      description: 'Access command line interface',
      icon: <TerminalIcon />,
      color: 'secondary' as const,
      onClick: () => navigate('/terminal'),
    },
    {
      title: 'Domain Manager',
      description: 'Manage domains and DNS records',
      icon: <WebIcon />,
      color: 'success' as const,
      onClick: () => navigate('/domains'),
      badge: '3 Active',
    },
    {
      title: 'WHM Servers',
      description: 'Manage WHM/cPanel servers',
      icon: <WHMIcon />,
      color: 'info' as const,
      onClick: () => navigate('/whm'),
      badge: 'New',
    },
    {
      title: 'System Tools',
      description: 'Access system utilities',
      icon: <SettingsIcon />,
      color: 'warning' as const,
      onClick: () => navigate('/tools'),
    },
    {
      title: 'Create Domain',
      description: 'Add a new domain quickly',
      icon: <WebIcon />,
      color: 'error' as const,
      onClick: () => navigate('/domains/new'),
    },
  ];

  const recentActivities = [
    {
      title: 'System backup completed',
      subtitle: 'Daily backup finished successfully',
      time: '2 min ago',
      icon: <BackupIcon />,
      color: 'success' as const,
    },
    {
      title: 'New domain added',
      subtitle: 'example.com has been configured',
      time: '15 min ago',
      icon: <WebIcon />,
      color: 'primary' as const,
    },
    {
      title: 'System update available',
      subtitle: 'AlmaLinux security updates ready',
      time: '1 hour ago',
      icon: <UpdateIcon />,
      color: 'warning' as const,
    },
    {
      title: 'High memory usage detected',
      subtitle: 'Memory usage exceeded 80%',
      time: '2 hours ago',
      icon: <NotificationIcon />,
      color: 'error' as const,
    },
    {
      title: 'WHM server connected',
      subtitle: 'server1.example.com online',
      time: '3 hours ago',
      icon: <WHMIcon />,
      color: 'info' as const,
    },
  ];

  // Simulate real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        cpuUsage: Math.max(10, Math.min(90, prev.cpuUsage + (Math.random() - 0.5) * 10)),
        memoryUsage: Math.max(30, Math.min(95, prev.memoryUsage + (Math.random() - 0.5) * 5)),
        activeConnections: Math.max(0, prev.activeConnections + Math.floor((Math.random() - 0.5) * 4)),
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <ModernDashboardLayout>
      <Box>
        <Typography variant="h4" sx={{ mb: 1, fontWeight: 700 }}>
          Welcome back!
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary', mb: 4 }}>
          Here's what's happening with your AlmaLinux server today.
        </Typography>
        
        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              title="Total Files"
              value={stats.totalFiles.toLocaleString()}
              subtitle="Files managed"
              icon={<FolderIcon />}
              color="primary"
              trend={{ value: 12, isPositive: true, period: 'this week' }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              title="Storage"
              value={stats.storageUsed}
              subtitle="of 100 GB used"
              icon={<StorageIcon />}
              color="success"
              progress={{ value: stats.storagePercent, max: 100 }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              title="CPU Usage"
              value={`${stats.cpuUsage}%`}
              subtitle="Current load"
              icon={<SpeedIcon />}
              color="warning"
              progress={{ value: stats.cpuUsage, max: 100 }}
              trend={{ value: 5, isPositive: false, period: 'vs last hour' }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              title="Memory"
              value={`${stats.memoryUsage}%`}
              subtitle="RAM utilization"
              icon={<MemoryIcon />}
              color="error"
              progress={{ value: stats.memoryUsage, max: 100 }}
            />
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          {/* Quick Actions */}
          <Grid item xs={12} lg={8}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Quick Actions
            </Typography>
            <Grid container spacing={2}>
              {quickActions.map((action, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <QuickActionCard {...action} />
                </Grid>
              ))}
            </Grid>
          </Grid>

          {/* Recent Activity */}
          <Grid item xs={12} lg={4}>
            <ActivityCard
              title="Recent Activity"
              activities={recentActivities}
              onViewAll={() => navigate('/activity')}
            />
          </Grid>
        </Grid>
      </Box>
    </ModernDashboardLayout>
  );
}
