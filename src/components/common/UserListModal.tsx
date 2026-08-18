import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Box,
  CircularProgress,
  Divider,
} from '@mui/material';
import { X } from 'lucide-react';
import { UserListItem } from './UserListItem';
import type { FollowUser } from '../../types/follow';

interface UserListModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  users: FollowUser[];
  loading?: boolean;
}

export const UserListModal: React.FC<UserListModalProps> = ({
  open,
  onClose,
  title,
  users,
  loading = false,
}) => {
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
          {title}
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
        ) : users.length === 0 ? (
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: '#71717a' }}>
              List is empty
            </Typography>
          </Box>
        ) : (
          users.map((user) => <UserListItem key={user.id} user={user} onItemClick={onClose} />)
        )}
      </DialogContent>
    </Dialog>
  );
};
