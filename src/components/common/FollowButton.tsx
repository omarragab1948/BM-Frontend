import React, { useState } from 'react';
import { Button, CircularProgress } from '@mui/material';
import { UserPlus, UserCheck, Clock } from 'lucide-react';
import { followService } from '../../services/followService';
import type { FollowStatus } from '../../types/follow';

interface FollowButtonProps {
  userId: string;
  isFollowing?: boolean;
  isPending?: boolean;
  onStatusChange?: (newStatus: FollowStatus) => void;
  size?: 'small' | 'medium';
  fullWidth?: boolean;
}

export const FollowButton: React.FC<FollowButtonProps> = ({
  userId,
  isFollowing = false,
  isPending = false,
  onStatusChange,
  size = 'small',
  fullWidth = false,
}) => {
  const [loading, setLoading] = useState(false);
  const [following, setFollowing] = useState(isFollowing);
  const [pending, setPending] = useState(isPending);

  const handleToggleFollow = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    try {
      if (following || pending) {
        await followService.unfollowUser(userId);
        setFollowing(false);
        setPending(false);
        onStatusChange?.('NONE');
      } else {
        const res = await followService.followUser(userId);
        if (res.status === 'PENDING') {
          setPending(true);
          onStatusChange?.('PENDING');
        } else {
          setFollowing(true);
          onStatusChange?.('ACCEPTED');
        }
      }
    } catch {
    } finally {
      setLoading(false);
    }
  };

  if (following) {
    return (
      <Button
        variant="outlined"
        size={size}
        fullWidth={fullWidth}
        onClick={handleToggleFollow}
        disabled={loading}
        startIcon={loading ? <CircularProgress size={14} color="inherit" /> : <UserCheck size={16} />}
        sx={{
          borderColor: '#3f3f46',
          color: '#f4f4f5',
          textTransform: 'none',
          fontWeight: 600,
          '&:hover': {
            borderColor: '#ef4444',
            color: '#ef4444',
            bgcolor: 'rgba(239, 68, 68, 0.08)',
          },
        }}
      >
        Following
      </Button>
    );
  }

  if (pending) {
    return (
      <Button
        variant="outlined"
        size={size}
        fullWidth={fullWidth}
        onClick={handleToggleFollow}
        disabled={loading}
        startIcon={loading ? <CircularProgress size={14} color="inherit" /> : <Clock size={16} />}
        sx={{
          borderColor: '#3f3f46',
          color: '#a1a1aa',
          textTransform: 'none',
          fontWeight: 600,
          '&:hover': {
            borderColor: '#ef4444',
            color: '#ef4444',
          },
        }}
      >
        Requested
      </Button>
    );
  }

  return (
    <Button
      variant="contained"
      size={size}
      fullWidth={fullWidth}
      onClick={handleToggleFollow}
      disabled={loading}
      startIcon={loading ? <CircularProgress size={14} color="inherit" /> : <UserPlus size={16} />}
      sx={{
        bgcolor: '#0095f6',
        color: '#ffffff',
        textTransform: 'none',
        fontWeight: 600,
        boxShadow: 'none',
        '&:hover': {
          bgcolor: '#1877f2',
          boxShadow: 'none',
        },
      }}
    >
      Follow
    </Button>
  );
};
