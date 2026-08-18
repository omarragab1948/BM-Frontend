import React, { useEffect } from 'react';
import {
  Popover,
  Box,
  Typography,
  List,
  ListItemButton,
  Avatar,
  Button,
  Divider,
} from '@mui/material';
import { CheckCheck, Heart, UserPlus, MessageSquare, Eye } from 'lucide-react';
import { useNotificationStore } from '../../store/useNotificationStore';
import { useNavigate } from 'react-router-dom';
import type { Notification } from '../../types/notification';

import { useChatStore } from '../../store/useChatStore';

interface Props {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
}

export const NotificationPopover: React.FC<Props> = ({ anchorEl, open, onClose }) => {
  const navigate = useNavigate();
  const { notifications, fetchNotifications, markAsRead, markAllAsRead } =
    useNotificationStore();

  useEffect(() => {
    if (open) {
      fetchNotifications();
    }
  }, [open, fetchNotifications]);

  const handleNotificationClick = (notif: Notification) => {
    markAsRead(notif.id);
    onClose();

    if (notif.type === 'FOLLOW') {
      navigate(`/profile/${notif.actor.username}`);
    } else if (notif.type === 'CHAT_MESSAGE') {
      if (notif.actor?.id) {
        useChatStore.getState().startConversationWithUser({
          id: notif.actor.id,
          username: notif.actor.username,
          avatarUrl: notif.actor.avatarUrl,
        });
      }
      navigate('/chat');
    } else if (notif.actor?.username) {
      navigate(`/profile/${notif.actor.username}`);
    }
  };

  const renderIcon = (type: string) => {
    switch (type) {
      case 'FOLLOW':
        return <UserPlus size={14} color="#0095f6" />;
      case 'LIKE':
        return <Heart size={14} color="#ef4444" fill="#ef4444" />;
      case 'COMMENT':
        return <MessageSquare size={14} color="#10b981" />;
      case 'STORY_VIEW':
        return <Eye size={14} color="#a855f7" />;
      default:
        return <UserPlus size={14} color="#0095f6" />;
    }
  };

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      slotProps={{
        paper: {
          sx: {
            width: 360,
            maxHeight: 480,
            bgcolor: '#18181b',
            color: '#f4f4f5',
            border: '1px solid #27272a',
            borderRadius: 3,
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          },
        },
      }}
    >
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          Notifications
        </Typography>
        <Button
          size="small"
          onClick={() => {
            markAllAsRead();
            onClose();
          }}
          startIcon={<CheckCheck size={14} />}
          sx={{ color: '#0095f6', textTransform: 'none', fontSize: '12px' }}
        >
          Mark all read
        </Button>
      </Box>

      <Divider sx={{ borderColor: '#27272a' }} />

      <Box sx={{ flex: 1, overflowY: 'auto' }}>
        {notifications.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: '#71717a' }}>
              No notifications yet
            </Typography>
          </Box>
        ) : (
          <List disablePadding>
            {notifications.map((notif) => (
              <ListItemButton
                key={notif.id}
                onClick={() => handleNotificationClick(notif)}
                sx={{
                  px: 2,
                  py: 1.5,
                  borderBottom: '1px solid #27272a',
                  bgcolor: !notif.isRead ? 'rgba(0, 149, 246, 0.08)' : 'transparent',
                  '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.04)' },
                }}
              >
                <Box sx={{ position: 'relative', mr: 1.5 }}>
                  <Avatar
                    src={notif.actor?.avatarUrl}
                    sx={{ width: 40, height: 40, bgcolor: '#0095f6' }}
                  >
                    {notif.actor?.username?.charAt(0).toUpperCase()}
                  </Avatar>
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: -2,
                      right: -2,
                      bgcolor: '#18181b',
                      borderRadius: '50%',
                      p: 0.3,
                      display: 'flex',
                    }}
                  >
                    {renderIcon(notif.type)}
                  </Box>
                </Box>

                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="body2" sx={{ color: '#f4f4f5', fontSize: '13px', lineHeight: 1.3 }}>
                    <strong>{notif.actor?.username}</strong>{' '}
                    {notif.type === 'FOLLOW' && 'started following you.'}
                    {notif.type === 'LIKE' && 'liked your post.'}
                    {notif.type === 'COMMENT' && 'commented on your post.'}
                    {notif.type === 'STORY_VIEW' && 'viewed your story.'}
                    {notif.type === 'CHAT_MESSAGE' && 'sent you a message.'}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#71717a', fontSize: '11px', display: 'block', mt: 0.3 }}>
                    {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Typography>
                </Box>
              </ListItemButton>
            ))}
          </List>
        )}
      </Box>
    </Popover>
  );
};
