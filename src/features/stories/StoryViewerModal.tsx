import React, { useEffect, useState } from 'react';
import {
  Dialog,
  Box,
  Typography,
  Avatar,
  IconButton,
  LinearProgress,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  CircularProgress,
} from '@mui/material';
import { X, ChevronLeft, ChevronRight, Eye, Trash2 } from 'lucide-react';
import { useStoryStore } from '../../store/useStoryStore';
import { storyService } from '../../services/storyService';
import { getUserCookie } from '../../utils/authCookie';
import type { StoryViewerItem } from '../../types/story';

const STORY_DURATION_MS = 5000;

function formatRelativeTime(dateString?: string): string {
  if (!dateString) return 'Recently';
  const date = new Date(dateString);
  const now = new Date();
  if (isNaN(date.getTime())) return 'Recently';
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (seconds <= 0) return 'Just now';
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export const StoryViewerModal: React.FC = () => {
  const {
    storiesFeed,
    activeGroupIndex,
    activeStoryIndex,
    isViewerOpen,
    closeViewer,
    nextStory,
    prevStory,
    deleteStory,
  } = useStoryStore();

  const currentUser = getUserCookie();

  const [progress, setProgress] = useState(0);
  const [isViewersOpen, setIsViewersOpen] = useState(false);
  const [viewers, setViewers] = useState<StoryViewerItem[]>([]);
  const [isLoadingViewers, setIsLoadingViewers] = useState(false);

  const currentGroup =
    activeGroupIndex !== null && storiesFeed[activeGroupIndex] ? storiesFeed[activeGroupIndex] : null;
  const currentStory =
    currentGroup && activeStoryIndex !== null && currentGroup.stories[activeStoryIndex]
      ? currentGroup.stories[activeStoryIndex]
      : null;

  const isOwnStory = Boolean(currentGroup?.user?.id && currentUser?.id && currentGroup.user.id === currentUser.id);

  useEffect(() => {
    const handleLiveViewer = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail && detail.storyId === currentStory?.id) {
        if (detail.viewer) {
          setViewers((prev) => {
            const exists = prev.some((v) => v.id === detail.viewer.id);
            if (exists) return prev;
            return [
              {
                id: detail.viewer.id,
                name: detail.viewer.username,
                username: detail.viewer.username,
                avatarUrl: detail.viewer.avatarUrl,
                viewedAt: detail.viewer.viewedAt || new Date().toISOString(),
              },
              ...prev,
            ];
          });
        }
      }
    };

    window.addEventListener('story_viewed_live', handleLiveViewer);
    return () => window.removeEventListener('story_viewed_live', handleLiveViewer);
  }, [currentStory]);

  const handleDeleteStory = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentStory) return;
    if (window.confirm('Are you sure you want to delete this story?')) {
      await deleteStory(currentStory.id);
    }
  };

  useEffect(() => {
    if (!isViewerOpen || !currentStory || isViewersOpen) {
      if (!isViewersOpen) setProgress(0);
      return;
    }

    setProgress(0);
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = (elapsed / STORY_DURATION_MS) * 100;
      if (pct >= 100) {
        setProgress(100);
        clearInterval(interval);
        nextStory();
      } else {
        setProgress(pct);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [isViewerOpen, activeGroupIndex, activeStoryIndex, currentStory, isViewersOpen, nextStory]);

  const handleOpenViewers = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!currentStory) return;
    setIsViewersOpen(true);
    setIsLoadingViewers(true);
    try {
      const list = await storyService.getStoryViewers(currentStory.id);
      setViewers(Array.isArray(list) ? list : []);
    } catch {
      setViewers([]);
    } finally {
      setIsLoadingViewers(false);
    }
  };

  if (!isViewerOpen || !currentGroup || !currentStory) {
    return null;
  }

  return (
    <>
      <Dialog
        open={isViewerOpen}
        onClose={closeViewer}
        maxWidth={false}
        slotProps={{
          paper: {
            sx: {
              bgcolor: 'rgba(0,0,0,0.95)',
              color: '#ffffff',
              width: { xs: '100vw', sm: '420px' },
              height: { xs: '100vh', sm: '750px' },
              borderRadius: { xs: 0, sm: 4 },
              overflow: 'hidden',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
            },
          },
        }}
      >
        {}
        <Box
          sx={{
            position: 'absolute',
            top: 12,
            left: 12,
            right: 12,
            display: 'flex',
            gap: 0.8,
            zIndex: 10,
          }}
        >
          {currentGroup.stories.map((story, i) => {
            let value = 0;
            if (i < (activeStoryIndex || 0)) value = 100;
            else if (i === activeStoryIndex) value = progress;

            return (
              <LinearProgress
                key={story.id || i}
                variant="determinate"
                value={value}
                sx={{
                  flex: 1,
                  height: 3,
                  borderRadius: 2,
                  bgcolor: 'rgba(255, 255, 255, 0.3)',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: '#ffffff',
                    transition: i === activeStoryIndex && !isViewersOpen ? 'none' : 'transform 0.1s linear',
                  },
                }}
              />
            );
          })}
        </Box>

        {}
        <Box
          sx={{
            position: 'absolute',
            top: 24,
            left: 12,
            right: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            zIndex: 10,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar
              src={currentGroup.user.avatarUrl}
              sx={{ width: 36, height: 36, border: '2px solid #0095f6' }}
            >
              {currentGroup.user.username.charAt(0).toUpperCase()}
            </Avatar>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#ffffff', textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>
              {currentGroup.user.username}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {isOwnStory && (
              <IconButton
                onClick={handleDeleteStory}
                title="Delete Story"
                sx={{
                  color: '#ef4444',
                  bgcolor: 'rgba(239, 68, 68, 0.15)',
                  '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.3)' },
                }}
              >
                <Trash2 size={18} />
              </IconButton>
            )}
            <IconButton onClick={closeViewer} sx={{ color: '#ffffff', bgcolor: 'rgba(0,0,0,0.4)', '&:hover': { bgcolor: 'rgba(0,0,0,0.6)' } }}>
              <X size={20} />
            </IconButton>
          </Box>
        </Box>

        {}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            bgcolor: '#000000',
            overflow: 'hidden',
          }}
        >
          {currentStory.mediaType === 'VIDEO' ? (
            <video
              src={currentStory.mediaUrl}
              autoPlay
              playsInline
              muted
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          ) : (
            <img
              src={currentStory.mediaUrl}
              alt="Story"
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          )}

          <Box
            onClick={prevStory}
            sx={{
              position: 'absolute',
              left: 0,
              top: 60,
              bottom: 60,
              width: '35%',
              cursor: 'pointer',
              zIndex: 5,
            }}
          />
          <Box
            onClick={nextStory}
            sx={{
              position: 'absolute',
              right: 0,
              top: 60,
              bottom: 60,
              width: '35%',
              cursor: 'pointer',
              zIndex: 5,
            }}
          />

          <IconButton
            onClick={prevStory}
            sx={{
              position: 'absolute',
              left: 12,
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#ffffff',
              bgcolor: 'rgba(0,0,0,0.3)',
              zIndex: 8,
              '&:hover': { bgcolor: 'rgba(0,0,0,0.6)' },
            }}
          >
            <ChevronLeft size={24} />
          </IconButton>
          <IconButton
            onClick={nextStory}
            sx={{
              position: 'absolute',
              right: 12,
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#ffffff',
              bgcolor: 'rgba(0,0,0,0.3)',
              zIndex: 8,
              '&:hover': { bgcolor: 'rgba(0,0,0,0.6)' },
            }}
          >
            <ChevronRight size={24} />
          </IconButton>
        </Box>

        {}
        <Box
          sx={{
            p: 2,
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            background: 'linear-gradient(transparent, rgba(0,0,0,0.9))',
            zIndex: 10,
          }}
        >
          {currentStory.caption && (
            <Typography variant="body2" sx={{ color: '#ffffff', mb: 1, textAlign: 'center', px: 2 }}>
              {currentStory.caption}
            </Typography>
          )}

          <Box
            onClick={handleOpenViewers}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 0.8,
              cursor: 'pointer',
              py: 0.5,
              px: 1.5,
              borderRadius: 4,
              mx: 'auto',
              width: 'fit-content',
              bgcolor: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(4px)',
              transition: 'background-color 0.2s',
              '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.25)' },
            }}
          >
            <Eye size={16} color="#ffffff" />
            <Typography variant="caption" sx={{ color: '#ffffff', fontWeight: 600 }}>
              {currentStory.viewsCount ?? 0} views
            </Typography>
          </Box>
        </Box>
      </Dialog>

      {}
      <Dialog
        open={isViewersOpen}
        onClose={() => setIsViewersOpen(false)}
        maxWidth="xs"
        fullWidth
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
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #27272a' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Eye size={18} color="#0095f6" />
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              Story Viewers ({viewers.length})
            </Typography>
          </Box>
          <IconButton size="small" onClick={() => setIsViewersOpen(false)} sx={{ color: '#a1a1aa' }}>
            <X size={18} />
          </IconButton>
        </Box>

        <Box sx={{ maxHeight: '380px', overflowY: 'auto', p: 1 }}>
          {isLoadingViewers ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress size={28} sx={{ color: '#0095f6' }} />
            </Box>
          ) : viewers.length === 0 ? (
            <Box sx={{ py: 4, textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: '#71717a' }}>
                No viewers yet
              </Typography>
            </Box>
          ) : (
            <List disablePadding>
              {viewers.map((viewer) => (
                <ListItem
                  key={viewer.id}
                  sx={{
                    py: 1.2,
                    px: 1.5,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.04)' },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0, flex: 1 }}>
                    <ListItemAvatar sx={{ minWidth: 'auto' }}>
                      <Avatar
                        src={viewer.avatarUrl}
                        alt={viewer.username}
                        sx={{ width: 42, height: 42, bgcolor: '#0095f6' }}
                      >
                        {(viewer.name || viewer.username || 'U').charAt(0).toUpperCase()}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle2" noWrap sx={{ color: '#f4f4f5', fontWeight: 600 }}>
                          {viewer.name || viewer.username}
                        </Typography>
                      }
                      secondary={
                        <Typography variant="caption" noWrap sx={{ color: '#a1a1aa', display: 'block' }}>
                          @{viewer.username}
                        </Typography>
                      }
                    />
                  </Box>

                  <Typography variant="caption" sx={{ color: '#71717a', fontSize: '11px', ml: 1, whiteSpace: 'nowrap' }}>
                    {formatRelativeTime(viewer.viewedAt)}
                  </Typography>
                </ListItem>
              ))}
            </List>
          )}
        </Box>
      </Dialog>
    </>
  );
};
