import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Avatar,
  Button,
  Paper,
  CircularProgress,
  Grid,
} from '@mui/material';
import { Settings, Lock as LockIcon, Grid as GridIcon, Heart, MessageCircle, ShieldAlert, MessageSquare } from 'lucide-react';
import { userService } from '../../services/userService';
import { followService } from '../../services/followService';
import { postService } from '../../services/postService';
import { blockService } from '../../services/blockService';
import type { UserProfile } from '../../types/user';
import type { Post } from '../../types/post';
import type { FollowUser } from '../../types/follow';
import { FollowButton } from '../../components/common/FollowButton';
import { EditProfileModal } from '../../components/common/EditProfileModal';
import { UserListModal } from '../../components/common/UserListModal';
import { PostDetailModal } from '../../components/common/PostDetailModal';
import { useAuth, useDisclosure } from '../../hooks';
import { useBlockStore } from '../../store/useBlockStore';
import { useChatStore } from '../../store/useChatStore';

export const ProfileView: React.FC = () => {
  const navigate = useNavigate();
  const { blockUser, unblockUser, isBlocked, blockedUserIds, blockedByUserIdSet } = useBlockStore();
  const { username: paramUsername } = useParams<{ username?: string }>();
  const { currentUser } = useAuth();

  const targetUsername = paramUsername || currentUser?.username || '';

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const editModal = useDisclosure(false);
  const userModal = useDisclosure(false);

  const [userModalTitle, setUserModalTitle] = useState('');
  const [userModalList, setUserModalList] = useState<FollowUser[]>([]);
  const [loadingUserModal, setLoadingUserModal] = useState(false);

  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isBlockedByTarget, setIsBlockedByTarget] = useState(false);
  const [isTargetBlockedState, setIsTargetBlockedState] = useState(false);

  useEffect(() => {
    userModal.close();
    editModal.close();
    setSelectedPost(null);
    if (targetUsername) {
      loadProfileAndPosts(targetUsername);
    }
  }, [targetUsername, blockedUserIds, blockedByUserIdSet]);

  const loadProfileAndPosts = async (username: string) => {
    setLoading(true);
    setError(null);
    setIsBlockedByTarget(false);
    setIsTargetBlockedState(false);

    try {
      const prof = await userService.getUserProfile(username);
      setProfile(prof);

      if (!prof.isSelf) {
        const blockStatus = await blockService.checkBlockStatus(prof.id);
        if (blockStatus.isBlockedBy) {
          setIsBlockedByTarget(true);
          setPosts([]);
          setLoading(false);
          return;
        }
        if (blockStatus.isBlocked || isBlocked(prof.id)) {
          setIsTargetBlockedState(true);
        }
      }

      if (!prof.isPrivate || prof.isSelf || prof.isFollowing) {
        try {
          const postsRes = await postService.getUserPosts(username);
          setPosts(postsRes.data || []);
        } catch {
          setPosts([]);
        }
      } else {
        setPosts([]);
      }
    } catch (err: any) {
      const errText = String(err?.message || err || '').toLowerCase();
      const isBlockError = errText.includes('block') || errText.includes('denied');

      if (isBlockError) {
        try {

          const blockedList = await blockService.getBlockedUsers();
          const blockedItem = (blockedList || []).find((b: any) => {
            const uName = b?.blocked?.username || b?.username;
            return uName && uName.toLowerCase() === username.toLowerCase();
          });

          if (blockedItem) {
            const blockedUser: any = blockedItem.blocked || blockedItem;
            setProfile({
              id: blockedUser.id || blockedItem.blockedId,
              username: blockedUser.username || username,
              avatarUrl: blockedUser.avatarUrl,
              bio: blockedUser.bio || '',
              email: '',
              createdAt: new Date().toISOString(),
              followersCount: 0,
              followingCount: 0,
              postsCount: 0,
              isSelf: false,
            });
            setIsTargetBlockedState(true);
            setIsBlockedByTarget(false);
            setError(null);
            setLoading(false);
            return;
          } else {

            setIsBlockedByTarget(true);
            setError(null);
            setLoading(false);
            return;
          }
        } catch {
          setIsBlockedByTarget(true);
          setError(null);
          setLoading(false);
          return;
        }
      }

      setError(err.message || 'Error loading profile');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenFollowers = async () => {
    if (!profile) return;
    setUserModalTitle('Followers');
    userModal.open();
    setLoadingUserModal(true);
    try {
      const res = await followService.getFollowers(profile.id);
      setUserModalList(res.data);
    } catch {
    } finally {
      setLoadingUserModal(false);
    }
  };

  const handleOpenFollowing = async () => {
    if (!profile) return;
    setUserModalTitle('Following');
    userModal.open();
    setLoadingUserModal(true);
    try {
      const res = await followService.getFollowing(profile.id);
      setUserModalList(res.data);
    } catch {
    } finally {
      setLoadingUserModal(false);
    }
  };

  const handlePostUpdated = (updated: Post) => {
    setPosts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  };

  const handlePostDeleted = (deletedId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== deletedId));
    setProfile((prev) => (prev ? { ...prev, postsCount: Math.max(0, prev.postsCount - 1) } : null));
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress size={40} sx={{ color: '#0095f6' }} />
      </Box>
    );
  }

  if (isBlockedByTarget) {
    return (
      <Paper sx={{ p: 6, bgcolor: '#18181b', border: '1px solid #27272a', borderRadius: 3, textAlign: 'center', my: 4 }}>
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            bgcolor: 'rgba(239, 68, 68, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 2,
          }}
        >
          <ShieldAlert size={28} color="#ef4444" />
        </Box>
        <Typography variant="h6" sx={{ color: '#f4f4f5', fontWeight: 700, mb: 1 }}>
          This user has blocked you
        </Typography>
        <Typography variant="body2" sx={{ color: '#a1a1aa', maxWidth: 400, mx: 'auto' }}>
          You cannot view this profile, follow, or message this account because this user has blocked you.
        </Typography>
      </Paper>
    );
  }

  if (error || !profile) {
    return (
      <Paper sx={{ p: 6, bgcolor: '#18181b', border: '1px solid #27272a', borderRadius: 3, textAlign: 'center', my: 4 }}>
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            bgcolor: 'rgba(239, 68, 68, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 2,
          }}
        >
          <ShieldAlert size={28} color="#ef4444" />
        </Box>
        <Typography variant="h6" sx={{ color: '#f4f4f5', fontWeight: 700, mb: 1 }}>
          User Not Found
        </Typography>
        <Typography variant="body2" sx={{ color: '#a1a1aa', maxWidth: 400, mx: 'auto' }}>
          {error || 'The link you followed may be broken or the page may have been removed.'}
        </Typography>
      </Paper>
    );
  }

  const isRestrictedPrivate = profile.isPrivate && !profile.isSelf && !profile.isFollowing;
  const isTargetBlocked = isTargetBlockedState || isBlocked(profile.id);

  const handleToggleBlock = async () => {
    if (isTargetBlocked) {
      await unblockUser(profile.id);
      setIsTargetBlockedState(false);
      loadProfileAndPosts(profile.username);
    } else {
      await blockUser(profile.id);
      setIsTargetBlockedState(true);
      loadProfileAndPosts(profile.username);
    }
  };

  const handleOpenChat = () => {
    useChatStore.getState().startConversationWithUser({
      id: profile.id,
      username: profile.username,
      avatarUrl: profile.avatarUrl,
    });
    navigate('/chat');
  };

  return (
    <Box sx={{ maxWidth: '820px', mx: 'auto', py: 3 }}>
      {}
      {isTargetBlocked && (
        <Paper
          sx={{
            p: 2,
            px: 3,
            bgcolor: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            borderRadius: 3,
            mb: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <ShieldAlert size={22} color="#ef4444" />
            <Box>
              <Typography variant="subtitle2" sx={{ color: '#f4f4f5', fontWeight: 700 }}>
                You have blocked @{profile.username}
              </Typography>
              <Typography variant="caption" sx={{ color: '#a1a1aa' }}>
                Unblock to allow them to view your posts and message you.
              </Typography>
            </Box>
          </Box>

          <Button
            variant="contained"
            size="small"
            onClick={handleToggleBlock}
            sx={{
              bgcolor: '#22c55e',
              color: '#ffffff',
              textTransform: 'none',
              fontWeight: 700,
              px: 2.5,
              py: 0.8,
              borderRadius: 2,
              '&:hover': { bgcolor: '#16a34a' },
            }}
          >
            Unblock User
          </Button>
        </Paper>
      )}

      {}
      <Paper sx={{ p: { xs: 3, sm: 4 }, bgcolor: '#18181b', border: '1px solid #27272a', borderRadius: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'center', gap: 4 }}>
          <Avatar
            src={profile.avatarUrl}
            alt={profile.username}
            sx={{ width: 110, height: 110, bgcolor: '#0095f6', border: '3px solid #0095f6' }}
          >
            {profile.username.charAt(0).toUpperCase()}
          </Avatar>

          <Box sx={{ flex: 1, textAlign: { xs: 'center', sm: 'left' } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2, justifyContent: { xs: 'center', sm: 'flex-start' }, flexWrap: 'wrap' }}>
              <Typography variant="h5" sx={{ color: '#f4f4f5', fontWeight: 700 }}>
                {profile.username}
              </Typography>

              {profile.isSelf ? (
                <Button
                  variant="outlined"
                  size="small"
                  onClick={editModal.open}
                  startIcon={<Settings size={16} />}
                  sx={{ borderColor: '#3f3f46', color: '#f4f4f5', textTransform: 'none', fontWeight: 600 }}
                >
                  Edit Profile
                </Button>
              ) : isTargetBlocked ? (

                <Button
                  variant="contained"
                  size="small"
                  onClick={handleToggleBlock}
                  startIcon={<ShieldAlert size={16} />}
                  sx={{
                    bgcolor: '#22c55e',
                    color: '#ffffff',
                    textTransform: 'none',
                    fontWeight: 700,
                    px: 2,
                    '&:hover': { bgcolor: '#16a34a' },
                  }}
                >
                  Unblock
                </Button>
              ) : (
                <>
                  <FollowButton
                    userId={profile.id}
                    isFollowing={profile.isFollowing}
                    isPending={profile.isPendingFollow}
                    onStatusChange={(status) => {
                      setProfile((prev) =>
                        prev
                          ? {
                              ...prev,
                              isFollowing: status === 'ACCEPTED',
                              isPendingFollow: status === 'PENDING',
                              followersCount: status === 'ACCEPTED' ? prev.followersCount + 1 : prev.followersCount,
                            }
                          : null
                      );
                    }}
                  />

                  <Button
                    variant="outlined"
                    size="small"
                    onClick={handleOpenChat}
                    startIcon={<MessageSquare size={16} />}
                    sx={{ borderColor: '#3f3f46', color: '#f4f4f5', textTransform: 'none', fontWeight: 600 }}
                  >
                    Message
                  </Button>

                  <Button
                    variant="outlined"
                    size="small"
                    onClick={handleToggleBlock}
                    startIcon={<ShieldAlert size={16} />}
                    sx={{
                      borderColor: '#ef4444',
                      color: '#ef4444',
                      textTransform: 'none',
                      fontWeight: 600,
                    }}
                  >
                    Block
                  </Button>
                </>
              )}
            </Box>

            <Box sx={{ display: 'flex', gap: 4, mb: 2, justifyContent: { xs: 'center', sm: 'flex-start' } }}>
              <Typography variant="body2" sx={{ color: '#a1a1aa' }}>
                <strong style={{ color: '#f4f4f5' }}>{profile.postsCount}</strong> posts
              </Typography>

              <Typography
                variant="body2"
                onClick={handleOpenFollowers}
                sx={{ color: '#a1a1aa', cursor: 'pointer', '&:hover': { color: '#0095f6' } }}
              >
                <strong style={{ color: '#f4f4f5' }}>{profile.followersCount}</strong> followers
              </Typography>

              <Typography
                variant="body2"
                onClick={handleOpenFollowing}
                sx={{ color: '#a1a1aa', cursor: 'pointer', '&:hover': { color: '#0095f6' } }}
              >
                <strong style={{ color: '#f4f4f5' }}>{profile.followingCount}</strong> following
              </Typography>
            </Box>

            {profile.bio && (
              <Typography variant="body2" sx={{ color: '#d4d4d8', mb: 0.5 }}>
                {profile.bio}
              </Typography>
            )}

            {profile.isPrivate && (
              <Typography variant="caption" sx={{ color: '#a1a1aa', display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                <LockIcon size={12} /> Private Account
              </Typography>
            )}
          </Box>
        </Box>
      </Paper>

      {}
      <Box sx={{ display: 'flex', justifyContent: 'center', borderBottom: '1px solid #27272a', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 1.5, borderBottom: '2px solid #0095f6', color: '#0095f6' }}>
          <GridIcon size={18} />
          <Typography variant="caption" sx={{ textTransform: 'uppercase', fontWeight: 600, letterSpacing: 1 }}>
            Posts
          </Typography>
        </Box>
      </Box>

      {isTargetBlocked ? (
        <Paper sx={{ p: 5, bgcolor: '#18181b', border: '1px solid #27272a', borderRadius: 3, textAlign: 'center', my: 2 }}>
          <Box sx={{ width: 48, height: 48, borderRadius: '50%', border: '2px solid #ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2, bgcolor: 'rgba(239, 68, 68, 0.1)' }}>
            <ShieldAlert size={24} color="#ef4444" />
          </Box>
          <Typography variant="subtitle1" sx={{ color: '#f4f4f5', fontWeight: 600, mb: 0.5 }}>
            You blocked @{profile.username}
          </Typography>
          <Typography variant="body2" sx={{ color: '#a1a1aa', mb: 2 }}>
            Unblock this account to see their posts and profile details.
          </Typography>
          <Button
            variant="contained"
            size="small"
            onClick={handleToggleBlock}
            sx={{ bgcolor: '#22c55e', color: '#ffffff', textTransform: 'none', fontWeight: 700, px: 3, py: 0.8, borderRadius: 2, '&:hover': { bgcolor: '#16a34a' } }}
          >
            Unblock @{profile.username}
          </Button>
        </Paper>
      ) : isRestrictedPrivate ? (
        <Paper sx={{ p: 5, bgcolor: '#18181b', border: '1px solid #27272a', borderRadius: 3, textAlign: 'center', my: 2 }}>
          <Box sx={{ width: 48, height: 48, borderRadius: '50%', border: '2px solid #3f3f46', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
            <LockIcon size={24} color="#a1a1aa" />
          </Box>
          <Typography variant="subtitle1" sx={{ color: '#f4f4f5', fontWeight: 600, mb: 0.5 }}>
            This account is private
          </Typography>
          <Typography variant="body2" sx={{ color: '#a1a1aa' }}>
            Follow to see their photos and videos.
          </Typography>
        </Paper>
      ) : posts.length === 0 ? (
        <Box sx={{ py: 6, textAlign: 'center' }}>
          <Typography variant="body2" sx={{ color: '#71717a' }}>
            No posts yet
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {posts.map((post) => {
            const imgUrl = (post as any).mediaUrl || (post.media && post.media[0]?.url) || '';
            const captionText = (post as any).caption || post.description || 'Post';
            return (
              <Grid size={{ xs: 4 }} key={post.id}>
                <Paper
                  onClick={() => setSelectedPost(post)}
                  sx={{
                    position: 'relative',
                    paddingTop: '100%',
                    bgcolor: '#27272a',
                    borderRadius: 2,
                    overflow: 'hidden',
                    cursor: 'pointer',
                    '&:hover .overlay': { opacity: 1 },
                  }}
                >
                  <img
                    src={imgUrl}
                    alt={captionText}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                  <Box
                    className="overlay"
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      bgcolor: 'rgba(0, 0, 0, 0.5)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 3,
                      opacity: 0,
                      transition: 'opacity 0.2s',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, color: '#ffffff' }}>
                      <Heart size={18} fill="#ffffff" />
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        {post.likesCount}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, color: '#ffffff' }}>
                      <MessageCircle size={18} fill="#ffffff" />
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        {post.commentsCount}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      )}

      {}
      {profile?.isSelf && (
        <EditProfileModal
          open={editModal.isOpen}
          onClose={editModal.close}
          user={profile}
          onProfileUpdated={(updated) => setProfile((prev) => (prev ? { ...prev, ...updated } : null))}
        />
      )}

      <UserListModal
        open={userModal.isOpen}
        onClose={userModal.close}
        title={userModalTitle}
        users={userModalList}
        loading={loadingUserModal}
      />

      {selectedPost && (
        <PostDetailModal
          open={Boolean(selectedPost)}
          onClose={() => setSelectedPost(null)}
          post={selectedPost}
          onPostUpdated={handlePostUpdated}
          onPostDeleted={handlePostDeleted}
        />
      )}
    </Box>
  );
};
