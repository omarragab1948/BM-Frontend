import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Avatar, Typography } from '@mui/material';
import { FollowButton } from './FollowButton';
import type { FollowUser } from '../../types/follow';
import { useAuthStore } from '../../store/useAuthStore';

interface UserListItemProps {
  user: FollowUser;
  showFollowButton?: boolean;
  onItemClick?: () => void;
}

export const UserListItem: React.FC<UserListItemProps> = ({ user, showFollowButton = true, onItemClick }) => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuthStore();
  const isSelf = currentUser?.id === user.id;

  const handleUserClick = () => {
    if (onItemClick) onItemClick();
    navigate(`/profile/${user.username}`);
  };

  return (
    <Box
      onClick={handleUserClick}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        p: 1.5,
        borderRadius: 2,
        cursor: 'pointer',
        transition: 'background-color 0.2s',
        '&:hover': {
          bgcolor: 'rgba(255, 255, 255, 0.05)',
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, minWidth: 0, flex: 1, mr: 2 }}>
        <Avatar
          src={user.avatarUrl}
          alt={user.username}
          sx={{ width: 44, height: 44, bgcolor: '#0095f6' }}
        >
          {user.username.charAt(0).toUpperCase()}
        </Avatar>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="subtitle2" noWrap sx={{ color: '#f4f4f5', fontWeight: 600 }}>
            {user.username}
          </Typography>
          {user.bio && (
            <Typography variant="caption" noWrap sx={{ color: '#a1a1aa', display: 'block' }}>
              {user.bio}
            </Typography>
          )}
        </Box>
      </Box>

      {showFollowButton && !isSelf && (
        <FollowButton
          userId={user.id}
          isFollowing={user.status === 'ACCEPTED'}
          isPending={user.status === 'PENDING'}
        />
      )}
    </Box>
  );
};
