import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  List,
  ListItemButton,
  Avatar,
  Badge,
  TextField,
  InputAdornment,
  CircularProgress,
  Divider,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
  Paper,
} from '@mui/material';
import { Search, UserPlus, MessageSquare, Users, UserCheck, Sparkles } from 'lucide-react';
import type { Conversation } from '../../types/chat';
import type { User } from '../../types/user';
import type { FollowUser } from '../../types/follow';
import { userService } from '../../services/userService';
import { followService } from '../../services/followService';
import { useChatStore } from '../../store/useChatStore';
import { useAuth } from '../../hooks/useAuth';

interface Props {
  conversations: Conversation[];
  activeRecipientId: string | null;
  onSelectConversation: (recipientId: string) => void;
}

export const ConversationList: React.FC<Props> = ({
  conversations = [],
  activeRecipientId,
  onSelectConversation,
}) => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const [followers, setFollowers] = useState<FollowUser[]>([]);
  const [following, setFollowing] = useState<FollowUser[]>([]);
  const [isLoadingContacts, setIsLoadingContacts] = useState(false);

  const startConversationWithUser = useChatStore((state) => state.startConversationWithUser);

  useEffect(() => {
    if (!currentUser?.id) return;
    let isMounted = true;

    const fetchContacts = async () => {
      setIsLoadingContacts(true);
      try {
        const [followersRes, followingRes] = await Promise.all([
          followService.getFollowers(currentUser.id, 1, 100),
          followService.getFollowing(currentUser.id, 1, 100),
        ]);
        if (isMounted) {
          setFollowers(followersRes?.data || []);
          setFollowing(followingRes?.data || []);
        }
      } catch (err) {
        console.error('Failed to fetch followers or following contacts:', err);
      } finally {
        if (isMounted) {
          setIsLoadingContacts(false);
        }
      }
    };

    fetchContacts();

    return () => {
      isMounted = false;
    };
  }, [currentUser?.id]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await userService.searchUsers(searchQuery.trim());
        setSearchResults(res?.data || []);
      } catch {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const quickContacts = useMemo(() => {
    const map = new Map<string, FollowUser>();
    (followers || []).forEach((u) => u && u.id && map.set(u.id, u));
    (following || []).forEach((u) => u && u.id && map.set(u.id, u));
    return Array.from(map.values());
  }, [followers, following]);

  const safeConversations = conversations || [];
  const safeFollowers = followers || [];
  const safeFollowing = following || [];

  const filteredConversations = safeConversations.filter((c) =>
    (c?.participant?.username || '').toLowerCase().includes((searchQuery || '').toLowerCase())
  );
  const filteredFollowers = safeFollowers.filter((u) =>
    (u?.username || '').toLowerCase().includes((searchQuery || '').toLowerCase())
  );
  const filteredFollowing = safeFollowing.filter((u) =>
    (u?.username || '').toLowerCase().includes((searchQuery || '').toLowerCase())
  );

  const handleSelectUserToChat = (user: FollowUser | User) => {
    if (!user || !user.id) return;
    startConversationWithUser({
      id: user.id,
      username: user.username || 'User',
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      isPrivate: user.isPrivate,
    });
    onSelectConversation(user.id);
    setSearchQuery('');
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', borderRight: '1px solid #27272a' }}>
      {}
      <Box sx={{ p: 2, borderBottom: '1px solid #27272a' }}>
        <Typography variant="h6" sx={{ color: '#f4f4f5', fontWeight: 700, mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
          Messages
        </Typography>

        <TextField
          size="small"
          fullWidth
          placeholder="Search chats, followers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  {isSearching ? <CircularProgress size={16} sx={{ color: '#0095f6' }} /> : <Search size={18} color="#a1a1aa" />}
                </InputAdornment>
              ),
            },
          }}
          sx={{
            '& .MuiInputBase-root': { bgcolor: '#09090b', color: '#f4f4f5', fontSize: '14px', borderRadius: 2 },
            '& .MuiOutlinedInput-notchedOutline': { borderColor: '#27272a' },
          }}
        />
      </Box>

      {}
      {!searchQuery && quickContacts.length > 0 && (
        <Box sx={{ p: 1.5, borderBottom: '1px solid #27272a', bgcolor: 'rgba(24, 24, 27, 0.5)' }}>
          <Typography variant="caption" sx={{ color: '#a1a1aa', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 0.5, mb: 1, px: 0.5 }}>
            <Sparkles size={12} color="#0095f6" /> Direct Contacts ({quickContacts.length})
          </Typography>
          <Box
            sx={{
              display: 'flex',
              gap: 1.5,
              overflowX: 'auto',
              py: 0.5,
              px: 0.5,
              scrollbarWidth: 'none',
              '&::-webkit-scrollbar': { display: 'none' },
            }}
          >
            {quickContacts.map((user) => {
              const isSelected = activeRecipientId === user.id;
              return (
                <Tooltip key={user.id} title={`Chat with @${user.username}`} arrow placement="bottom">
                  <Box
                    onClick={() => handleSelectUserToChat(user)}
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      cursor: 'pointer',
                      minWidth: 56,
                      transition: 'transform 0.2s',
                      '&:hover': { transform: 'scale(1.06)' },
                    }}
                  >
                    <Avatar
                      src={user.avatarUrl}
                      alt={user.username}
                      sx={{
                        width: 44,
                        height: 44,
                        bgcolor: '#0095f6',
                        border: isSelected ? '2px solid #0095f6' : '2px solid #3f3f46',
                        boxShadow: isSelected ? '0 0 10px rgba(0, 149, 246, 0.5)' : 'none',
                      }}
                    >
                      {(user.username || 'U').charAt(0).toUpperCase()}
                    </Avatar>
                    <Typography
                      variant="caption"
                      noWrap
                      sx={{
                        color: isSelected ? '#0095f6' : '#a1a1aa',
                        fontSize: '11px',
                        fontWeight: isSelected ? 700 : 400,
                        maxWidth: 56,
                        mt: 0.5,
                        textAlign: 'center',
                      }}
                    >
                      {user.username}
                    </Typography>
                  </Box>
                </Tooltip>
              );
            })}
          </Box>
        </Box>
      )}

      {}
      {!searchQuery && (
        <Box sx={{ borderBottom: '1px solid #27272a', bgcolor: '#18181b' }}>
          <Tabs
            value={activeTab}
            onChange={(_, val) => setActiveTab(val)}
            variant="fullWidth"
            textColor="primary"
            indicatorColor="primary"
            sx={{
              minHeight: 42,
              '& .MuiTab-root': {
                color: '#a1a1aa',
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '13px',
                minHeight: 42,
                py: 1,
                '&.Mui-selected': { color: '#0095f6' },
              },
              '& .MuiTabs-indicator': { backgroundColor: '#0095f6' },
            }}
          >
            <Tab
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                  <MessageSquare size={15} />
                  <span>Chats</span>
                  {safeConversations.length > 0 && (
                    <Typography variant="caption" sx={{ bgcolor: 'rgba(0,149,246,0.15)', color: '#0095f6', px: 0.8, py: 0.1, borderRadius: 10, fontSize: '10px' }}>
                      {safeConversations.length}
                    </Typography>
                  )}
                </Box>
              }
            />
            <Tab
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                  <Users size={15} />
                  <span>Followers</span>
                  <Typography variant="caption" sx={{ bgcolor: 'rgba(255,255,255,0.08)', color: '#a1a1aa', px: 0.8, py: 0.1, borderRadius: 10, fontSize: '10px' }}>
                    {safeFollowers.length}
                  </Typography>
                </Box>
              }
            />
            <Tab
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                  <UserCheck size={15} />
                  <span>Following</span>
                  <Typography variant="caption" sx={{ bgcolor: 'rgba(255,255,255,0.08)', color: '#a1a1aa', px: 0.8, py: 0.1, borderRadius: 10, fontSize: '10px' }}>
                    {safeFollowing.length}
                  </Typography>
                </Box>
              }
            />
          </Tabs>
        </Box>
      )}

      {}
      <Box sx={{ flex: 1, overflowY: 'auto' }}>
        {searchQuery.trim() !== '' ? (

          <Box>
            {}
            {filteredConversations.length > 0 && (
              <>
                <Typography variant="caption" sx={{ color: '#a1a1aa', px: 2, pt: 1.5, pb: 0.5, display: 'block', fontWeight: 600 }}>
                  ACTIVE CHATS
                </Typography>
                <List disablePadding>
                  {filteredConversations.map((conv) => {
                    const isActive = Boolean(conv?.participant?.id && activeRecipientId === conv.participant.id);
                    const hasUnread = (conv?.unreadCount || 0) > 0;
                    return (
                      <ListItemButton
                        key={conv.id}
                        onClick={() => conv?.participant?.id && onSelectConversation(conv.participant.id)}
                        sx={{
                          px: 2,
                          py: 1.5,
                          borderBottom: '1px solid #18181b',
                          bgcolor: isActive ? 'rgba(0, 149, 246, 0.12)' : 'transparent',
                          '&:hover': { bgcolor: isActive ? 'rgba(0, 149, 246, 0.18)' : 'rgba(255, 255, 255, 0.04)' },
                        }}
                      >
                        <Badge badgeContent={conv.unreadCount} color="error" overlap="circular" sx={{ mr: 2 }}>
                          <Avatar src={conv.participant?.avatarUrl} alt={conv.participant?.username} sx={{ width: 44, height: 44, bgcolor: '#0095f6' }}>
                            {(conv.participant?.username || 'U').charAt(0).toUpperCase()}
                          </Avatar>
                        </Badge>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="subtitle2" noWrap sx={{ color: '#f4f4f5', fontWeight: hasUnread ? 700 : 500 }}>
                            {conv.participant?.username}
                          </Typography>
                          <Typography variant="caption" noWrap sx={{ color: '#a1a1aa', display: 'block' }}>
                            {conv.lastMessage?.content || 'Started a conversation'}
                          </Typography>
                        </Box>
                      </ListItemButton>
                    );
                  })}
                </List>
                <Divider sx={{ my: 1, borderColor: '#27272a' }} />
              </>
            )}

            {}
            {(filteredFollowers.length > 0 || filteredFollowing.length > 0) && (
              <>
                <Typography variant="caption" sx={{ color: '#0095f6', px: 2, pt: 1, pb: 0.5, display: 'block', fontWeight: 600 }}>
                  FOLLOWERS & FOLLOWING
                </Typography>
                <List disablePadding>
                  {Array.from(new Map([...filteredFollowers, ...filteredFollowing].map((u) => [u.id, u])).values()).map((user) => (
                    <ListItemButton
                      key={user.id}
                      onClick={() => handleSelectUserToChat(user)}
                      sx={{
                        px: 2,
                        py: 1.2,
                        borderBottom: '1px solid #18181b',
                        '&:hover': { bgcolor: 'rgba(0, 149, 246, 0.08)' },
                      }}
                    >
                      <Avatar src={user.avatarUrl} alt={user.username} sx={{ width: 40, height: 40, mr: 1.5, bgcolor: '#0095f6' }}>
                        {(user.username || 'U').charAt(0).toUpperCase()}
                      </Avatar>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="subtitle2" noWrap sx={{ color: '#f4f4f5', fontWeight: 600 }}>
                          {user.username}
                        </Typography>
                        {user.bio && (
                          <Typography variant="caption" noWrap sx={{ color: '#a1a1aa', display: 'block' }}>
                            {user.bio}
                          </Typography>
                        )}
                      </Box>
                      <IconButton size="small" sx={{ color: '#0095f6' }}>
                        <MessageSquare size={16} />
                      </IconButton>
                    </ListItemButton>
                  ))}
                </List>
                <Divider sx={{ my: 1, borderColor: '#27272a' }} />
              </>
            )}

            {}
            <Typography variant="caption" sx={{ color: '#a1a1aa', px: 2, pt: 1, pb: 0.5, display: 'block', fontWeight: 600 }}>
              OTHER USERS
            </Typography>
            {searchResults.length === 0 && !isSearching ? (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="body2" sx={{ color: '#71717a' }}>
                  No other users found matching "{searchQuery}"
                </Typography>
              </Box>
            ) : (
              <List disablePadding>
                {searchResults.map((user) => (
                  <ListItemButton
                    key={user.id}
                    onClick={() => handleSelectUserToChat(user)}
                    sx={{
                      px: 2,
                      py: 1.2,
                      borderBottom: '1px solid #18181b',
                      '&:hover': { bgcolor: 'rgba(0, 149, 246, 0.08)' },
                    }}
                  >
                    <Avatar src={user.avatarUrl} alt={user.username} sx={{ width: 40, height: 40, mr: 1.5, bgcolor: '#0095f6' }}>
                      {(user.username || 'U').charAt(0).toUpperCase()}
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="subtitle2" noWrap sx={{ color: '#f4f4f5', fontWeight: 600 }}>
                        {user.username}
                      </Typography>
                      {user.bio && (
                        <Typography variant="caption" noWrap sx={{ color: '#a1a1aa', display: 'block' }}>
                          {user.bio}
                        </Typography>
                      )}
                    </Box>
                    <UserPlus size={16} color="#0095f6" />
                  </ListItemButton>
                ))}
              </List>
            )}
          </Box>
        ) : activeTab === 0 ? (

          safeConversations.length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Paper sx={{ p: 3, bgcolor: 'rgba(255,255,255,0.02)', border: '1px solid #27272a', borderRadius: 2 }}>
                <Typography variant="subtitle2" sx={{ color: '#f4f4f5', fontWeight: 600, mb: 1 }}>
                  No active conversations yet
                </Typography>
                <Typography variant="caption" sx={{ color: '#a1a1aa', display: 'block', mb: 2 }}>
                  Start chatting with any of your followers or users you follow!
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                  <IconButton
                    onClick={() => setActiveTab(1)}
                    sx={{
                      bgcolor: '#0095f6',
                      color: '#fff',
                      fontSize: '12px',
                      px: 2,
                      borderRadius: 2,
                      '&:hover': { bgcolor: '#0077c5' },
                    }}
                  >
                    View Followers
                  </IconButton>
                </Box>
              </Paper>
            </Box>
          ) : (
            <List disablePadding>
              {safeConversations.map((conv) => {
                const isActive = Boolean(conv?.participant?.id && activeRecipientId === conv.participant.id);
                const hasUnread = (conv?.unreadCount || 0) > 0;

                return (
                  <ListItemButton
                    key={conv.id}
                    onClick={() => conv?.participant?.id && onSelectConversation(conv.participant.id)}
                    sx={{
                      px: 2,
                      py: 1.5,
                      borderBottom: '1px solid #18181b',
                      bgcolor: isActive ? 'rgba(0, 149, 246, 0.12)' : 'transparent',
                      '&:hover': { bgcolor: isActive ? 'rgba(0, 149, 246, 0.18)' : 'rgba(255, 255, 255, 0.04)' },
                    }}
                  >
                    <Badge
                      badgeContent={conv.unreadCount}
                      color="error"
                      overlap="circular"
                      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                      sx={{ mr: 2 }}
                    >
                      <Avatar
                        src={conv.participant?.avatarUrl}
                        alt={conv.participant?.username}
                        sx={{ width: 48, height: 48, bgcolor: '#0095f6' }}
                      >
                        {(conv.participant?.username || 'U').charAt(0).toUpperCase()}
                      </Avatar>
                    </Badge>

                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.3 }}>
                        <Typography
                          variant="subtitle2"
                          noWrap
                          sx={{ color: '#f4f4f5', fontWeight: hasUnread ? 700 : 500 }}
                        >
                          {conv.participant?.username}
                        </Typography>
                        {conv.lastMessage && (
                          <Typography variant="caption" sx={{ color: '#71717a', fontSize: '11px' }}>
                            {new Date(conv.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </Typography>
                        )}
                      </Box>

                      <Typography
                        variant="caption"
                        noWrap
                        sx={{
                          color: hasUnread ? '#0095f6' : '#a1a1aa',
                          fontWeight: hasUnread ? 600 : 400,
                          display: 'block',
                        }}
                      >
                        {conv.lastMessage?.content || 'Started a conversation'}
                      </Typography>
                    </Box>
                  </ListItemButton>
                );
              })}
            </List>
          )
        ) : activeTab === 1 ? (

          isLoadingContacts ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
              <CircularProgress size={32} sx={{ color: '#0095f6' }} />
            </Box>
          ) : safeFollowers.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: '#71717a' }}>
                You have no followers yet
              </Typography>
            </Box>
          ) : (
            <List disablePadding>
              {safeFollowers.map((user) => {
                const isActive = activeRecipientId === user.id;
                return (
                  <ListItemButton
                    key={user.id}
                    onClick={() => handleSelectUserToChat(user)}
                    sx={{
                      px: 2,
                      py: 1.5,
                      borderBottom: '1px solid #18181b',
                      bgcolor: isActive ? 'rgba(0, 149, 246, 0.12)' : 'transparent',
                      '&:hover': { bgcolor: 'rgba(0, 149, 246, 0.08)' },
                    }}
                  >
                    <Avatar src={user.avatarUrl} alt={user.username} sx={{ width: 44, height: 44, mr: 1.8, bgcolor: '#0095f6' }}>
                      {(user.username || 'U').charAt(0).toUpperCase()}
                    </Avatar>

                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="subtitle2" noWrap sx={{ color: '#f4f4f5', fontWeight: 600 }}>
                        {user.username}
                      </Typography>
                      <Typography variant="caption" noWrap sx={{ color: '#a1a1aa', display: 'block' }}>
                        {user.bio || 'Follower'}
                      </Typography>
                    </Box>

                    <Tooltip title="Start chat" arrow>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectUserToChat(user);
                        }}
                        sx={{
                          bgcolor: 'rgba(0, 149, 246, 0.15)',
                          color: '#0095f6',
                          '&:hover': { bgcolor: '#0095f6', color: '#fff' },
                        }}
                      >
                        <MessageSquare size={16} />
                      </IconButton>
                    </Tooltip>
                  </ListItemButton>
                );
              })}
            </List>
          )
        ) : (

          isLoadingContacts ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
              <CircularProgress size={32} sx={{ color: '#0095f6' }} />
            </Box>
          ) : safeFollowing.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: '#71717a' }}>
                You are not following anyone yet
              </Typography>
            </Box>
          ) : (
            <List disablePadding>
              {safeFollowing.map((user) => {
                const isActive = activeRecipientId === user.id;
                return (
                  <ListItemButton
                    key={user.id}
                    onClick={() => handleSelectUserToChat(user)}
                    sx={{
                      px: 2,
                      py: 1.5,
                      borderBottom: '1px solid #18181b',
                      bgcolor: isActive ? 'rgba(0, 149, 246, 0.12)' : 'transparent',
                      '&:hover': { bgcolor: 'rgba(0, 149, 246, 0.08)' },
                    }}
                  >
                    <Avatar src={user.avatarUrl} alt={user.username} sx={{ width: 44, height: 44, mr: 1.8, bgcolor: '#0095f6' }}>
                      {(user.username || 'U').charAt(0).toUpperCase()}
                    </Avatar>

                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="subtitle2" noWrap sx={{ color: '#f4f4f5', fontWeight: 600 }}>
                        {user.username}
                      </Typography>
                      <Typography variant="caption" noWrap sx={{ color: '#a1a1aa', display: 'block' }}>
                        {user.bio || 'Following'}
                      </Typography>
                    </Box>

                    <Tooltip title="Start chat" arrow>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectUserToChat(user);
                        }}
                        sx={{
                          bgcolor: 'rgba(0, 149, 246, 0.15)',
                          color: '#0095f6',
                          '&:hover': { bgcolor: '#0095f6', color: '#fff' },
                        }}
                      >
                        <MessageSquare size={16} />
                      </IconButton>
                    </Tooltip>
                  </ListItemButton>
                );
              })}
            </List>
          )
        )}
      </Box>
    </Box>
  );
};
