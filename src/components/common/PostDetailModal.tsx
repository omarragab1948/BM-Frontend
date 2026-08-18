import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  Avatar,
  Typography,
  IconButton,
  TextField,
  Divider,
  CircularProgress,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Heart,
  MessageCircle,
  X,
  Send,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Trash2,
} from 'lucide-react';
import type { Post } from '../../types/post';
import type { Comment } from '../../types/comment';
import type { FollowUser } from '../../types/follow';
import { commentService } from '../../services/commentService';
import { likeService } from '../../services/likeService';
import { postService } from '../../services/postService';
import { useAuthStore } from '../../store/useAuthStore';
import { UserListModal } from './UserListModal';

interface PostDetailModalProps {
  open: boolean;
  onClose: () => void;
  post: Post | null;
  onPostUpdated?: (updatedPost: Post) => void;
  onPostDeleted?: (postId: string) => void;
}

export const PostDetailModal: React.FC<PostDetailModalProps> = ({
  open,
  onClose,
  post,
  onPostUpdated,
  onPostDeleted,
}) => {
  const { user: currentUser } = useAuthStore();
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [newCommentText, setNewCommentText] = useState('');
  const [postingComment, setPostingComment] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [likesModalOpen, setLikesModalOpen] = useState(false);
  const [likesUsers, setLikesUsers] = useState<FollowUser[]>([]);
  const [loadingLikes, setLoadingLikes] = useState(false);

  useEffect(() => {
    if (post && open) {
      setCurrentMediaIndex(0);
      setIsLiked(!!post.isLiked);
      setLikesCount(post.likesCount);
      loadComments(post.id);
    }
  }, [post, open]);

  const loadComments = async (postId: string) => {
    setLoadingComments(true);
    try {
      const res = await commentService.getPostComments(postId);
      setComments(res.data);
    } catch {
    } finally {
      setLoadingComments(false);
    }
  };

  const handleLikeToggle = async () => {
    if (!post) return;
    const newLikedState = !isLiked;
    const newCount = newLikedState ? likesCount + 1 : Math.max(0, likesCount - 1);
    setIsLiked(newLikedState);
    setLikesCount(newCount);

    try {
      if (newLikedState) {
        await likeService.likePost(post.id);
      } else {
        await likeService.unlikePost(post.id);
      }
      onPostUpdated?.({
        ...post,
        isLiked: newLikedState,
        likesCount: newCount,
      });
    } catch {
      setIsLiked(!newLikedState);
      setLikesCount(likesCount);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!post || !newCommentText.trim() || postingComment) return;

    setPostingComment(true);
    try {
      const created = await commentService.addComment(post.id, { content: newCommentText.trim() });
      setComments((prev) => [...prev, created]);
      setNewCommentText('');
      const updatedCommentsCount = (post.commentsCount || 0) + 1;
      onPostUpdated?.({
        ...post,
        commentsCount: updatedCommentsCount,
      });
    } catch {
    } finally {
      setPostingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!post) return;
    try {
      await commentService.deleteComment(post.id, commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      const updatedCommentsCount = Math.max(0, (post.commentsCount || 0) - 1);
      onPostUpdated?.({
        ...post,
        commentsCount: updatedCommentsCount,
      });
    } catch {}
  };

  const handleDeletePost = async () => {
    if (!post) return;
    try {
      await postService.deletePost(post.id);
      onPostDeleted?.(post.id);
      onClose();
    } catch {}
  };

  const handleOpenLikesModal = async () => {
    if (!post) return;
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

  if (!post) return null;

  const currentMedia = post.media && post.media.length > 0 ? post.media[currentMediaIndex] : null;
  const isOwner = currentUser?.id === post.authorId;

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        fullWidth
        maxWidth="md"
        slotProps={{
          paper: {
            sx: {
              bgcolor: '#0f0f10',
              color: '#f4f4f5',
              borderRadius: 3,
              border: '1px solid #27272a',
              overflow: 'hidden',
              maxHeight: '90vh',
            },
          },
        }}
      >
        <DialogContent sx={{ p: 0, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, minHeight: '520px' }}>
          <Box
            sx={{
              flex: 1.3,
              bgcolor: '#000000',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              minHeight: '350px',
            }}
          >
            {currentMedia ? (
              currentMedia.type === 'VIDEO' ? (
                <video
                  src={currentMedia.url}
                  controls
                  style={{ maxWidth: '100%', maxHeight: '550px', objectFit: 'contain' }}
                />
              ) : (
                <img
                  src={currentMedia.url}
                  alt="Post content"
                  style={{ width: '100%', maxHeight: '550px', objectFit: 'contain' }}
                />
              )
            ) : (
              <Typography variant="body2" sx={{ color: '#71717a' }}>
                No media files
              </Typography>
            )}

            {post.media && post.media.length > 1 && (
              <>
                {currentMediaIndex > 0 && (
                  <IconButton
                    onClick={() => setCurrentMediaIndex((prev) => prev - 1)}
                    sx={{ position: 'absolute', left: 12, bgcolor: 'rgba(0,0,0,0.6)', color: '#fff' }}
                  >
                    <ChevronLeft size={20} />
                  </IconButton>
                )}
                {currentMediaIndex < post.media.length - 1 && (
                  <IconButton
                    onClick={() => setCurrentMediaIndex((prev) => prev + 1)}
                    sx={{ position: 'absolute', right: 12, bgcolor: 'rgba(0,0,0,0.6)', color: '#fff' }}
                  >
                    <ChevronRight size={20} />
                  </IconButton>
                )}
              </>
            )}
          </Box>

          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', bgcolor: '#18181b', minWidth: { md: '340px' } }}>
            <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #27272a' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar src={post.author.avatarUrl} sx={{ width: 36, height: 36, bgcolor: '#0095f6' }}>
                  {post.author.username.charAt(0).toUpperCase()}
                </Avatar>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#f4f4f5' }}>
                  {post.author.username}
                </Typography>
              </Box>
              <Box>
                {isOwner && (
                  <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} size="small" sx={{ color: '#a1a1aa' }}>
                    <MoreHorizontal size={18} />
                  </IconButton>
                )}
                <IconButton onClick={onClose} size="small" sx={{ color: '#a1a1aa', ml: 1 }}>
                  <X size={18} />
                </IconButton>
              </Box>
            </Box>

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

            <Box sx={{ flex: 1, p: 2, overflowY: 'auto', maxHeight: '380px' }}>
              {post.description && (
                <Box sx={{ display: 'flex', gap: 1.5, mb: 2 }}>
                  <Avatar src={post.author.avatarUrl} sx={{ width: 32, height: 32, bgcolor: '#0095f6' }}>
                    {post.author.username.charAt(0).toUpperCase()}
                  </Avatar>
                  <Box>
                    <Typography variant="body2" sx={{ color: '#f4f4f5' }}>
                      <strong>{post.author.username}</strong> {post.description}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#71717a', display: 'block', mt: 0.5 }}>
                      {new Date(post.createdAt).toLocaleDateString()}
                    </Typography>
                  </Box>
                </Box>
              )}

              <Divider sx={{ my: 1.5, borderColor: '#27272a' }} />

              {loadingComments ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                  <CircularProgress size={24} sx={{ color: '#0095f6' }} />
                </Box>
              ) : comments.length === 0 ? (
                <Typography variant="caption" sx={{ color: '#71717a', textAlign: 'center', display: 'block', py: 2 }}>
                  No comments yet. Be the first!
                </Typography>
              ) : (
                comments.map((cmt) => (
                  <Box key={cmt.id} sx={{ display: 'flex', gap: 1.5, mb: 2, alignItems: 'flex-start' }}>
                    <Avatar src={cmt.user.avatarUrl} sx={{ width: 30, height: 30, bgcolor: '#0095f6' }}>
                      {cmt.user.username.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" sx={{ color: '#f4f4f5' }}>
                        <strong>{cmt.user.username}</strong> {cmt.content}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#71717a', display: 'block', mt: 0.2 }}>
                        {new Date(cmt.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Typography>
                    </Box>
                    {(currentUser?.id === cmt.userId || isOwner) && (
                      <IconButton size="small" onClick={() => handleDeleteComment(cmt.id)} sx={{ color: '#71717a', '&:hover': { color: '#ef4444' } }}>
                        <Trash2 size={14} />
                      </IconButton>
                    )}
                  </Box>
                ))
              )}
            </Box>

            <Box sx={{ p: 2, borderTop: '1px solid #27272a' }}>
              <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                <IconButton onClick={handleLikeToggle} size="small" sx={{ color: isLiked ? '#ef4444' : '#f4f4f5' }}>
                  <Heart size={22} fill={isLiked ? '#ef4444' : 'none'} />
                </IconButton>
                <IconButton size="small" sx={{ color: '#f4f4f5' }}>
                  <MessageCircle size={22} />
                </IconButton>
              </Box>

              <Typography
                onClick={handleOpenLikesModal}
                variant="body2"
                sx={{ color: '#f4f4f5', fontWeight: 600, cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
              >
                Likes: {likesCount}
              </Typography>

              <Box component="form" onSubmit={handleAddComment} sx={{ display: 'flex', gap: 1, mt: 1.5 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Add a comment..."
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  variant="standard"
                  slotProps={{
                    input: {
                      disableUnderline: true,
                      style: { color: '#f4f4f5', fontSize: '14px' },
                    },
                  }}
                />
                <IconButton type="submit" disabled={!newCommentText.trim() || postingComment} size="small" sx={{ color: '#0095f6' }}>
                  <Send size={18} />
                </IconButton>
              </Box>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>

      <UserListModal
        open={likesModalOpen}
        onClose={() => setLikesModalOpen(false)}
        title="Likes"
        users={likesUsers}
        loading={loadingLikes}
      />
    </>
  );
};
