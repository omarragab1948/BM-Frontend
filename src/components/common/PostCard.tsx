import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardHeader,
  CardMedia,
  CardContent,
  Avatar,
  IconButton,
  Typography,
  Box,
  Menu,
  MenuItem,
  TextField,
} from '@mui/material';
import {
  Heart,
  MessageCircle,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Send,
  Trash2,
} from 'lucide-react';
import type { Post } from '../../types/post';
import type { FollowUser } from '../../types/follow';
import { likeService } from '../../services/likeService';
import { commentService } from '../../services/commentService';
import { postService } from '../../services/postService';
import { useAuthStore } from '../../store/useAuthStore';
import { UserListModal } from './UserListModal';
import { PostDetailModal } from './PostDetailModal';

interface PostCardProps {
  post: Post;
  onPostUpdated?: (updated: Post) => void;
  onPostDeleted?: (postId: string) => void;
}

export const PostCard: React.FC<PostCardProps> = ({ post, onPostUpdated, onPostDeleted }) => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuthStore();
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(!!post.isLiked);
  const [likesCount, setLikesCount] = useState(post.likesCount);
  const [commentsCount, setCommentsCount] = useState(post.commentsCount);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [likesModalOpen, setLikesModalOpen] = useState(false);
  const [likesUsers, setLikesUsers] = useState<FollowUser[]>([]);
  const [loadingLikes, setLoadingLikes] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [quickComment, setQuickComment] = useState('');
  const [postingComment, setPostingComment] = useState(false);

  const isOwner = currentUser?.id === post.authorId;
  const currentMedia = post.media && post.media.length > 0 ? post.media[currentMediaIndex] : null;

  const handleLikeToggle = async () => {
    const nextState = !isLiked;
    const nextCount = nextState ? likesCount + 1 : Math.max(0, likesCount - 1);
    setIsLiked(nextState);
    setLikesCount(nextCount);

    try {
      if (nextState) {
        await likeService.likePost(post.id);
      } else {
        await likeService.unlikePost(post.id);
      }
      onPostUpdated?.({ ...post, isLiked: nextState, likesCount: nextCount });
    } catch {
      setIsLiked(!nextState);
      setLikesCount(likesCount);
    }
  };

  const handleOpenLikes = async () => {
    setLikesModalOpen(true);
    setLoadingLikes(true);
    try {
      const res = await likeService.getPostLikes(post.id);
      setLikesUsers(res.data);
    } catch {
    } finally {
      setLoadingLikes(false);
    }
  };

  const handleQuickCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickComment.trim() || postingComment) return;

    setPostingComment(true);
    try {
      await commentService.addComment(post.id, { content: quickComment.trim() });
      const nextCount = commentsCount + 1;
      setCommentsCount(nextCount);
      setQuickComment('');
      onPostUpdated?.({ ...post, commentsCount: nextCount });
    } catch {
    } finally {
      setPostingComment(false);
    }
  };

  const handleDeletePost = async () => {
    setAnchorEl(null);
    try {
      await postService.deletePost(post.id);
      onPostDeleted?.(post.id);
    } catch {}
  };

  return (
    <>
      <Card
        sx={{
          bgcolor: '#18181b',
          border: '1px solid #27272a',
          borderRadius: 3,
          mb: 3,
          color: '#f4f4f5',
          overflow: 'hidden',
        }}
      >
        <CardHeader
          avatar={
            <Avatar
              src={post.author.avatarUrl}
              onClick={() => navigate(`/profile/${post.author.username}`)}
              sx={{ cursor: 'pointer', bgcolor: '#0095f6', width: 40, height: 40 }}
            >
              {post.author.username.charAt(0).toUpperCase()}
            </Avatar>
          }
          action={
            isOwner ? (
              <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ color: '#a1a1aa' }}>
                <MoreHorizontal size={18} />
              </IconButton>
            ) : null
          }
          title={
            <Typography
              onClick={() => navigate(`/profile/${post.author.username}`)}
              variant="subtitle2"
              sx={{ color: '#f4f4f5', fontWeight: 600, cursor: 'pointer', '&:hover': { color: '#0095f6' } }}
            >
              {post.author.username}
            </Typography>
          }
          subheader={
            <Typography variant="caption" sx={{ color: '#71717a' }}>
              {new Date(post.createdAt).toLocaleDateString()}
            </Typography>
          }
        />

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
          slotProps={{ paper: { sx: { bgcolor: '#27272a', color: '#f4f4f5' } } }}
        >
          <MenuItem onClick={handleDeletePost} sx={{ color: '#ef4444', gap: 1 }}>
            <Trash2 size={16} /> Delete post
          </MenuItem>
        </Menu>

        <Box sx={{ position: 'relative', bgcolor: '#000000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {currentMedia ? (
            currentMedia.type === 'VIDEO' ? (
              <video src={currentMedia.url} controls style={{ width: '100%', maxHeight: '520px', objectFit: 'cover' }} />
            ) : (
              <CardMedia
                component="img"
                image={currentMedia.url}
                alt="Post media"
                onDoubleClick={handleLikeToggle}
                sx={{ maxHeight: '520px', width: '100%', objectFit: 'cover', cursor: 'pointer' }}
              />
            )
          ) : null}

          {post.media && post.media.length > 1 && (
            <>
              {currentMediaIndex > 0 && (
                <IconButton
                  onClick={() => setCurrentMediaIndex((prev) => prev - 1)}
                  sx={{ position: 'absolute', left: 8, bgcolor: 'rgba(0,0,0,0.6)', color: '#fff' }}
                >
                  <ChevronLeft size={20} />
                </IconButton>
              )}
              {currentMediaIndex < post.media.length - 1 && (
                <IconButton
                  onClick={() => setCurrentMediaIndex((prev) => prev + 1)}
                  sx={{ position: 'absolute', right: 8, bgcolor: 'rgba(0,0,0,0.6)', color: '#fff' }}
                >
                  <ChevronRight size={20} />
                </IconButton>
              )}
            </>
          )}
        </Box>

        <CardContent sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
            <IconButton onClick={handleLikeToggle} size="small" sx={{ color: isLiked ? '#ef4444' : '#f4f4f5' }}>
              <Heart size={22} fill={isLiked ? '#ef4444' : 'none'} />
            </IconButton>
            <IconButton onClick={() => setDetailModalOpen(true)} size="small" sx={{ color: '#f4f4f5' }}>
              <MessageCircle size={22} />
            </IconButton>
          </Box>

          <Typography
            onClick={handleOpenLikes}
            variant="body2"
            sx={{ color: '#f4f4f5', fontWeight: 600, mb: 0.5, cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
          >
            {likesCount} {likesCount === 1 ? 'like' : 'likes'}
          </Typography>

          {post.description && (
            <Typography variant="body2" sx={{ color: '#d4d4d8', mb: 1 }}>
              <strong style={{ color: '#f4f4f5', marginRight: '6px' }}>{post.author.username}</strong>
              {post.description}
            </Typography>
          )}

          {commentsCount > 0 && (
            <Typography
              onClick={() => setDetailModalOpen(true)}
              variant="caption"
              sx={{ color: '#71717a', cursor: 'pointer', display: 'block', mb: 1, '&:hover': { color: '#a1a1aa' } }}
            >
              View all comments ({commentsCount})
            </Typography>
          )}

          <Box component="form" onSubmit={handleQuickCommentSubmit} sx={{ display: 'flex', gap: 1, mt: 1, pt: 1, borderTop: '1px solid #27272a' }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Add a comment..."
              value={quickComment}
              onChange={(e) => setQuickComment(e.target.value)}
              variant="standard"
              slotProps={{
                input: {
                  disableUnderline: true,
                  style: { color: '#f4f4f5', fontSize: '13px' },
                },
              }}
            />
            <IconButton type="submit" disabled={!quickComment.trim() || postingComment} size="small" sx={{ color: '#0095f6' }}>
              <Send size={16} />
            </IconButton>
          </Box>
        </CardContent>
      </Card>

      <UserListModal
        open={likesModalOpen}
        onClose={() => setLikesModalOpen(false)}
        title="Likes"
        users={likesUsers}
        loading={loadingLikes}
      />

      <PostDetailModal
        open={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        post={post}
        onPostUpdated={onPostUpdated}
        onPostDeleted={onPostDeleted}
      />
    </>
  );
};
