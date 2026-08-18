import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Box,
  CircularProgress,
  Divider,
  Avatar,
  Button,
} from '@mui/material';
import { X, Check } from 'lucide-react';
import { followService } from '../../services/followService';
import type { FollowUser } from '../../types/follow';

interface FollowRequestsModalProps {
  open: boolean;
  onClose: () => void;
  onRequestHandled?: () => void;
}

export const FollowRequestsModal: React.FC<FollowRequestsModalProps> = ({
  open,
  onClose,
  onRequestHandled,
}) => {
  const [requests, setRequests] = useState<FollowUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      loadRequests();
    }
  }, [open]);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const res = await followService.getPendingRequests();
      setRequests(res.data);
    } catch {
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (followerId: string) => {
    setProcessingId(followerId);
    try {
      await followService.acceptFollowRequest(followerId);
      setRequests((prev) => prev.filter((u) => u.id !== followerId));
      onRequestHandled?.();
    } catch {
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (followerId: string) => {
    setProcessingId(followerId);
    try {
      await followService.rejectFollowRequest(followerId);
      setRequests((prev) => prev.filter((u) => u.id !== followerId));
      onRequestHandled?.();
    } catch {
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xs"
      slotProps={{
        paper: {
          sx: {
            bgcolor: '#18181b',
            color: '#f4f4f5',
            borderRadius: 3,
            border: '1px solid #27272a',
          },
        },
      }}
    >
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
          Follow Requests
        </Typography>
        <IconButton onClick={onClose} size="small" sx={{ color: '#a1a1aa' }}>
          <X size={20} />
        </IconButton>
      </DialogTitle>

      <Divider sx={{ borderColor: '#27272a' }} />

      <DialogContent sx={{ p: 1, maxHeight: '420px', minHeight: '150px' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 5 }}>
            <CircularProgress size={30} sx={{ color: '#0095f6' }} />
          </Box>
        ) : !requests || requests.length === 0 ? (
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: '#71717a' }}>
              No pending follow requests
            </Typography>
          </Box>
        ) : (
          requests.map((user) => (
            <Box
              key={user.id}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justify: 'space-between',
                p: 1.5,
                borderRadius: 2,
                '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.05)' },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0, flex: 1 }}>
                <Avatar src={user.avatarUrl} sx={{ width: 40, height: 40, bgcolor: '#0095f6' }}>
                  {(user.username || 'U').charAt(0).toUpperCase()}
                </Avatar>
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="subtitle2" noWrap sx={{ color: '#f4f4f5', fontWeight: 600 }}>
                    {user.username || 'User'}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  size="small"
                  variant="contained"
                  disabled={processingId === user.id}
                  onClick={() => handleAccept(user.id)}
                  startIcon={<Check size={16} />}
                  sx={{ bgcolor: '#0095f6', color: '#fff', textTransform: 'none', px: 1.5, '&:hover': { bgcolor: '#1877f2' } }}
                >
                  Accept
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  disabled={processingId === user.id}
                  onClick={() => handleReject(user.id)}
                  startIcon={<X size={16} />}
                  sx={{ borderColor: '#3f3f46', color: '#ef4444', textTransform: 'none', px: 1.5, '&:hover': { borderColor: '#ef4444' } }}
                >
                  Reject
                </Button>
              </Box>
            </Box>
          ))
        )}
      </DialogContent>
    </Dialog>
  );
};
