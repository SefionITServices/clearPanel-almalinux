import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  LinearProgress,
  Chip,
  IconButton,
  alpha,
  useTheme,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  trend?: {
    value: number;
    isPositive?: boolean;
    period?: string;
  };
  progress?: {
    value: number;
    max?: number;
    color?: string;
  };
  actions?: React.ReactNode;
}

export function StatsCard({
  title,
  value,
  subtitle,
  icon,
  color = 'primary',
  trend,
  progress,
  actions,
}: StatsCardProps) {
  const theme = useTheme();
  const colorValue = theme.palette[color];

  return (
    <Card
      sx={{
        height: '100%',
        position: 'relative',
        '&:hover': {
          boxShadow: theme.shadows[4],
        },
        transition: theme.transitions.create(['box-shadow'], {
          duration: theme.transitions.duration.shorter,
        }),
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
              {title}
            </Typography>
            
            <Typography variant="h3" sx={{ mb: 1, fontWeight: 700, color: colorValue.main }}>
              {value}
            </Typography>
            
            {subtitle && (
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                {subtitle}
              </Typography>
            )}

            {trend && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                {trend.isPositive ? (
                  <TrendingUpIcon sx={{ fontSize: 16, color: 'success.main' }} />
                ) : (
                  <TrendingDownIcon sx={{ fontSize: 16, color: 'error.main' }} />
                )}
                <Typography
                  variant="caption"
                  sx={{
                    color: trend.isPositive ? 'success.main' : 'error.main',
                    fontWeight: 600,
                  }}
                >
                  {trend.value}%
                </Typography>
                {trend.period && (
                  <Typography variant="caption" sx={{ color: 'text.secondary', ml: 0.5 }}>
                    {trend.period}
                  </Typography>
                )}
              </Box>
            )}

            {progress && (
              <Box sx={{ mt: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    Usage
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {progress.value}% of {progress.max || 100}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={progress.value}
                  sx={{
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: alpha(colorValue.main, 0.12),
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 3,
                      backgroundColor: progress.color || colorValue.main,
                    },
                  }}
                />
              </Box>
            )}
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
            {icon && (
              <Avatar
                sx={{
                  bgcolor: alpha(colorValue.main, 0.12),
                  color: colorValue.main,
                  width: 48,
                  height: 48,
                }}
              >
                {icon}
              </Avatar>
            )}
            
            {actions && (
              <Box sx={{ mt: 'auto' }}>
                {actions}
              </Box>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

interface QuickActionCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  onClick?: () => void;
  badge?: string;
}

export function QuickActionCard({
  title,
  description,
  icon,
  color = 'primary',
  onClick,
  badge,
}: QuickActionCardProps) {
  const theme = useTheme();
  const colorValue = theme.palette[color];

  return (
    <Card
      sx={{
        height: '100%',
        cursor: onClick ? 'pointer' : 'default',
        transition: theme.transitions.create(['transform', 'box-shadow'], {
          duration: theme.transitions.duration.shorter,
        }),
        '&:hover': {
          ...(onClick && {
            transform: 'translateY(-2px)',
            boxShadow: theme.shadows[8],
          }),
        },
      }}
      onClick={onClick}
    >
      <CardContent sx={{ p: 3, textAlign: 'center', position: 'relative' }}>
        {badge && (
          <Chip
            label={badge}
            size="small"
            color={color}
            sx={{
              position: 'absolute',
              top: 12,
              right: 12,
              fontSize: '0.75rem',
            }}
          />
        )}
        
        <Avatar
          sx={{
            bgcolor: alpha(colorValue.main, 0.12),
            color: colorValue.main,
            width: 64,
            height: 64,
            mx: 'auto',
            mb: 2,
          }}
        >
          {icon}
        </Avatar>
        
        <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
          {title}
        </Typography>
        
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {description}
        </Typography>
      </CardContent>
    </Card>
  );
}

interface ActivityItemProps {
  title: string;
  subtitle: string;
  time: string;
  icon?: React.ReactNode;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
}

export function ActivityItem({
  title,
  subtitle,
  time,
  icon,
  color = 'primary',
}: ActivityItemProps) {
  const theme = useTheme();
  const colorValue = theme.palette[color];

  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, py: 1.5 }}>
      {icon && (
        <Avatar
          sx={{
            bgcolor: alpha(colorValue.main, 0.12),
            color: colorValue.main,
            width: 32,
            height: 32,
          }}
        >
          {icon}
        </Avatar>
      )}
      
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="subtitle2" noWrap>
          {title}
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary' }} noWrap>
          {subtitle}
        </Typography>
      </Box>
      
      <Typography variant="caption" sx={{ color: 'text.secondary', flexShrink: 0 }}>
        {time}
      </Typography>
    </Box>
  );
}

interface ActivityCardProps {
  title: string;
  activities: {
    title: string;
    subtitle: string;
    time: string;
    icon?: React.ReactNode;
    color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  }[];
  onViewAll?: () => void;
}

export function ActivityCard({ title, activities, onViewAll }: ActivityCardProps) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {title}
          </Typography>
          {onViewAll && (
            <Typography
              variant="caption"
              sx={{ color: 'primary.main', cursor: 'pointer' }}
              onClick={onViewAll}
            >
              View All
            </Typography>
          )}
        </Box>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          {activities.map((activity, index) => (
            <ActivityItem key={index} {...activity} />
          ))}
        </Box>
      </CardContent>
    </Card>
  );
}