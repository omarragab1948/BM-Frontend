import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, CircularProgress, Paper, Avatar, Chip } from '@mui/material';
import { PlusSquare, Sparkles, ArrowUp } from 'lucide-react';
import { PostCard } from '../../components/common/PostCard';
import { CreatePostModal } from '../../components/common/CreatePostModal';
import { StoriesTray } from '../stories/StoriesTray';
import { postService } from '../../services/postService';
import { userService } from '../../services/userService';
import { useNotificationStore } from '../../store/useNotificationStore';
import type { Post } from '../../types/post';
import type { User } from '../../types/user';
import { useAuth, useDisclosure } from '../../hooks';
import { useNavigate } from 'react-router-dom';

export const FeedView: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [suggestedUsers, setSuggestedUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const createModal = useDisclosure(false);

  useEffect(() => {
    loadFeed(1);
    loadSuggestedUsers();
  }, []);

  const loadFeed = async (targetPage: number) => {
    if (targetPage === 1) setLoading(true);
    else setLoadingMore(true);

    try {
      const res = await postService.getFeed(targetPage, 5);
      if (targetPage === 1) {
        setPosts(res.data);
      } else {
        setPosts((prev) => [...prev, ...res.data]);
      }
      setHasMore(res.hasMore);
      setPage(targetPage);
    } catch {
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadSuggestedUsers = async () => {
    try {
      const res = await userService.searchUsers('', 1, 6);
      setSuggestedUsers(res.data);
    } catch {}
  };

  const handlePostCreated = (newPost: Post) => {
    setPosts((prev) => [newPost, ...prev]);
  };

  const handlePostUpdated = (updated: Post) => {
    setPosts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  };

  const handlePostDeleted = (postId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  };

  const { newPostsAvailable, newPostsCount, clearNewPostsBanner } = useNotificationStore();

  const handleRefreshFeed = () => {
    clearNewPostsBanner();
    loadFeed(1);
  };

  return (
    <Box sx={{ maxWidth: '640px', mx: 'auto', py: 2 }}>
      <StoriesTray />

      {newPostsAvailable && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <Chip
            icon={<ArrowUp size={16} color="#ffffff" />}
            label={`${newPostsCount} New Post${newPostsCount > 1 ? 's' : ''} available — Click to refresh`}
            onClick={handleRefreshFeed}
            sx={{
              bgcolor: '#0095f6',
              color: '#ffffff',
              fontWeight: 600,
              px: 1,
              py: 2.2,
              borderRadius: 5,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0, 149, 246, 0.4)',
              '&:hover': { bgcolor: '#1877f2' },
            }}
          />
        </Box>
      )}

      <Paper
        sx={{
          p: 2.5,
          bgcolor: '#18181b',
          border: '1px solid #27272a',
          borderRadius: 3,
          mb: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar
            src={currentUser?.avatarUrl}
            onClick={() => navigate('/profile')}
            sx={{ width: 48, height: 48, bgcolor: '#0095f6', cursor: 'pointer' }}
          >
            {currentUser?.username.charAt(0).toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="subtitle1" sx={{ color: '#f4f4f5', fontWeight: 600 }}>
              Hello, {currentUser?.username}! 👋
            </Typography>
            <Typography variant="caption" sx={{ color: '#a1a1aa' }}>
              Posts & news feed
            </Typography>
          </Box>
        </Box>

        <Button
          variant="contained"
          onClick={createModal.open}
          startIcon={<PlusSquare size={18} />}
          sx={{ bgcolor: '#0095f6', color: '#fff', textTransform: 'none', fontWeight: 600, '&:hover': { bgcolor: '#1877f2' } }}
        >
          Create
        </Button>
      </Paper>

      {suggestedUsers.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="caption" sx={{ color: '#a1a1aa', fontWeight: 600, px: 0.5, mb: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Sparkles size={14} color="#0095f6" /> Suggested for you
          </Typography>
          <Box sx={{ display: 'flex', gap: 1.5, overflowX: 'auto', pb: 1 }}>
            {suggestedUsers.map((usr) => (
              <Paper
                key={usr.id}
                onClick={() => navigate(`/profile/${usr.username}`)}
                sx={{
                  minWidth: 100,
                  p: 1.5,
                  bgcolor: '#18181b',
                  border: '1px solid #27272a',
                  borderRadius: 2,
                  textAlign: 'center',
                  cursor: 'pointer',
                  '&:hover': { borderColor: '#0095f6' },
                }}
              >
                <Avatar src={usr.avatarUrl} sx={{ width: 44, height: 44, mx: 'auto', mb: 1, bgcolor: '#0095f6' }}>
                  {usr.username.charAt(0).toUpperCase()}
                </Avatar>
                <Typography variant="caption" noWrap sx={{ color: '#f4f4f5', fontWeight: 600, display: 'block' }}>
                  {usr.username}
                </Typography>
              </Paper>
            ))}
          </Box>
        </Box>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress size={36} sx={{ color: '#0095f6' }} />
        </Box>
      ) : posts.length === 0 ? (
        <Paper sx={{ p: 4, bgcolor: '#18181b', border: '1px solid #27272a', borderRadius: 3, textAlign: 'center' }}>
          <Typography variant="h6" sx={{ color: '#f4f4f5', mb: 1 }}>
            No posts yet
          </Typography>
          <Typography variant="body2" sx={{ color: '#a1a1aa', mb: 2 }}>
            Follow other users or share your first post.
          </Typography>
          <Button variant="contained" onClick={createModal.open} sx={{ bgcolor: '#0095f6' }}>
            Create Post
          </Button>
        </Paper>
      ) : (
        <>
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onPostUpdated={handlePostUpdated}
              onPostDeleted={handlePostDeleted}
            />
          ))}

          {hasMore && (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
              <Button
                variant="outlined"
                onClick={() => loadFeed(page + 1)}
                disabled={loadingMore}
                sx={{ borderColor: '#3f3f46', color: '#f4f4f5' }}
              >
                {loadingMore ? <CircularProgress size={18} color="inherit" /> : 'Load More'}
              </Button>
            </Box>
          )}
        </>
      )}

      <CreatePostModal
        open={createModal.isOpen}
        onClose={createModal.close}
        onPostCreated={handlePostCreated}
      />
    </Box>
  );
};
