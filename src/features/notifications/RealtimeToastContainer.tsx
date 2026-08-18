import React from 'react';
import { Box, Paper, Typography, Avatar, IconButton } from '@mui/material';
import { X, Bell } from 'lucide-react';
import { useNotificationStore } from '../../store/useNotificationStore';

export const RealtimeToastContainer: React.FC = () => {
  const { toasts, removeToast } = useNotificationStore();

  if (toasts.length === 0) return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: 1.5,
        maxWidth: 360,
        pointerEvents: 'none',
      }}
    >
      {toasts.map((toast) => (
        <Paper
          key={toast.id}
          elevation={8}
          sx={{
            p: 2,
            bgcolor: '#18181b',
            color: '#f4f4f5',
            border: '1px solid #0095f6',
            borderRadius: 3,
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            pointerEvents: 'auto',
            animation: 'fadeInUp 0.3s ease-out',
            '@keyframes fadeInUp': {
              from: { opacity: 0, transform: 'translateY(20px)' },
              to: { opacity: 1, transform: 'translateY(0)' },
            },
          }}
        >
          {toast.avatarUrl ? (
            <Avatar src={toast.avatarUrl} sx={{ width: 38, height: 38, bgcolor: '#0095f6' }} />
          ) : (
            <Avatar sx={{ width: 38, height: 38, bgcolor: '#0095f6' }}>
              <Bell size={20} />
            </Avatar>
          )}

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="subtitle2" noWrap sx={{ fontWeight: 700, color: '#ffffff' }}>
              {toast.title}
            </Typography>
            <Typography variant="caption" noWrap sx={{ color: '#a1a1aa', display: 'block' }}>
              {toast.message}
            </Typography>
          </Box>

          <IconButton
            size="small"
            onClick={() => removeToast(toast.id)}
            sx={{ color: '#a1a1aa', '&:hover': { color: '#ffffff' } }}
          >
            <X size={16} />
          </IconButton>
        </Paper>
      ))}
    </Box>
  );
};
