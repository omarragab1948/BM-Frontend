import React, { useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Button,
  CircularProgress,
} from '@mui/material';
import { ShieldOff } from 'lucide-react';
import { useBlockStore } from '../../store/useBlockStore';

export const BlockedUsersList: React.FC = () => {
  const { blockedUsers, isLoading, fetchBlockedUsers, unblockUser } = useBlockStore();

  useEffect(() => {
    fetchBlockedUsers();
  }, [fetchBlockedUsers]);

  const handleUnblock = async (userId: string) => {
    await unblockUser(userId);
  };

  return (
    <Paper sx={{ p: 3, bgcolor: '#18181b', border: '1px solid #27272a', borderRadius: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
        <ShieldOff size={22} color="#ef4444" />
        <Typography variant="h6" sx={{ color: '#f4f4f5', fontWeight: 700 }}>
          Blocked Accounts
        </Typography>
      </Box>

      <Typography variant="body2" sx={{ color: '#a1a1aa', mb: 3 }}>
        Once you block someone, that person can no longer see your profile, posts, or stories, nor message or follow you.
      </Typography>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress size={32} sx={{ color: '#0095f6' }} />
        </Box>
      ) : blockedUsers.length === 0 ? (
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <Typography variant="body2" sx={{ color: '#71717a' }}>
            You haven't blocked any users.
          </Typography>
        </Box>
      ) : (
        <List disablePadding>
          {blockedUsers.map((item) => (
            <ListItem
              key={item.id}
              sx={{
                px: 2,
                py: 1.5,
                mb: 1,
                bgcolor: '#09090b',
                border: '1px solid #27272a',
                borderRadius: 2,
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <ListItemAvatar sx={{ minWidth: 0 }}>
                  <Avatar
                    src={item.blocked.avatarUrl}
                    sx={{ width: 42, height: 42, bgcolor: '#0095f6' }}
                  >
                    {item.blocked.username.charAt(0).toUpperCase()}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={item.blocked.username}
                  secondary={`Blocked on ${new Date(item.createdAt).toLocaleDateString()}`}
                  slotProps={{
                    primary: { sx: { color: '#f4f4f5', fontWeight: 600 } },
                    secondary: { sx: { color: '#71717a', fontSize: '12px' } },
                  }}
                />
              </Box>

              <Button
                variant="outlined"
                size="small"
                onClick={() => handleUnblock(item.blockedId)}
                sx={{
                  borderColor: '#ef4444',
                  color: '#ef4444',
                  textTransform: 'none',
                  fontWeight: 600,
                  '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.1)', borderColor: '#ef4444' },
                }}
              >
                Unblock
              </Button>
            </ListItem>
          ))}
        </List>
      )}
    </Paper>
  );
};
