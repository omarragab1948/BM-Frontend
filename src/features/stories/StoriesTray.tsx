import React, { useEffect } from 'react';
import { Box, Typography, Avatar, IconButton } from '@mui/material';
import { Plus } from 'lucide-react';
import { useStoryStore } from '../../store/useStoryStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useDisclosure } from '../../hooks';
import { CreateStoryModal } from './CreateStoryModal';
import { StoryViewerModal } from './StoryViewerModal';

export const StoriesTray: React.FC = () => {
  const { user } = useAuthStore();
  const { storiesFeed, fetchStories, openViewer } = useStoryStore();
  const createModal = useDisclosure(false);

  useEffect(() => {
    fetchStories();
  }, [fetchStories]);

  const currentUserGroupIndex = storiesFeed.findIndex((g) => g.user.id === user?.id);
  const currentUserGroup = currentUserGroupIndex >= 0 ? storiesFeed[currentUserGroupIndex] : null;

  return (
    <Box sx={{ mb: 3 }}>
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          overflowX: 'auto',
          py: 1,
          px: 0.5,
          '&::-webkit-scrollbar': { display: 'none' },
          msOverflowStyle: 'none',
          scrollbarWidth: 'none',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            minWidth: 72,
            cursor: 'pointer',
          }}
          onClick={() => {
            if (currentUserGroup && currentUserGroup.stories.length > 0) {
              openViewer(currentUserGroupIndex, 0);
            } else {
              createModal.open();
            }
          }}
        >
          <Box sx={{ position: 'relative' }}>
            <Box
              sx={{
                p: '2px',
                borderRadius: '50%',
                background: currentUserGroup && !currentUserGroup.allViewed
                  ? 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)'
                  : currentUserGroup
                  ? 'linear-gradient(45deg, #3f3f46, #27272a)'
                  : 'transparent',
              }}
            >
              <Avatar
                src={user?.avatarUrl}
                alt={user?.username}
                sx={{
                  width: 62,
                  height: 62,
                  bgcolor: '#0095f6',
                  border: '2px solid #0f0f10',
                }}
              >
                {user?.username?.charAt(0).toUpperCase()}
              </Avatar>
            </Box>

            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                createModal.open();
              }}
              sx={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                bgcolor: '#0095f6',
                color: '#ffffff',
                width: 22,
                height: 22,
                p: 0,
                border: '2px solid #0f0f10',
                '&:hover': { bgcolor: '#1877f2' },
              }}
            >
              <Plus size={14} />
            </IconButton>
          </Box>
          <Typography
            variant="caption"
            noWrap
            sx={{ color: '#f4f4f5', mt: 0.8, fontSize: '11px', fontWeight: 500, maxWidth: 70, textAlign: 'center' }}
          >
            Your story
          </Typography>
        </Box>

        {storiesFeed.map((group, index) => {
          if (group.user.id === user?.id) return null;

          const isUnviewed = !group.allViewed;

          return (
            <Box
              key={group.user.id}
              onClick={() => openViewer(index, 0)}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                minWidth: 72,
                cursor: 'pointer',
                transition: 'transform 0.15s ease',
                '&:hover': { transform: 'scale(1.04)' },
              }}
            >
              <Box
                sx={{
                  p: '2.5px',
                  borderRadius: '50%',
                  background: isUnviewed
                    ? 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)'
                    : 'linear-gradient(45deg, #3f3f46, #27272a)',
                }}
              >
                <Avatar
                  src={group.user.avatarUrl}
                  alt={group.user.username}
                  sx={{
                    width: 60,
                    height: 60,
                    bgcolor: '#0095f6',
                    border: '2px solid #0f0f10',
                  }}
                >
                  {group.user.username.charAt(0).toUpperCase()}
                </Avatar>
              </Box>
              <Typography
                variant="caption"
                noWrap
                sx={{
                  color: isUnviewed ? '#f4f4f5' : '#a1a1aa',
                  mt: 0.8,
                  fontSize: '11px',
                  fontWeight: isUnviewed ? 600 : 400,
                  maxWidth: 70,
                  textAlign: 'center',
                }}
              >
                {group.user.username}
              </Typography>
            </Box>
          );
        })}
      </Box>

      <CreateStoryModal open={createModal.isOpen} onClose={createModal.close} />
      <StoryViewerModal />
    </Box>
  );
};
