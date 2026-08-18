import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Avatar,
  IconButton,
  Tooltip,
  Divider,
} from '@mui/material';
import {
  Home,
  Search,
  User as UserIcon,
  Settings,
  PlusSquare,
  LogOut,
  UserCheck,
  MessageSquare,
  Bell,
} from 'lucide-react';
import { Badge } from '@mui/material';
import { useAuthStore } from '../store/useAuthStore';
import { useChatStore } from '../store/useChatStore';
import { useNotificationStore } from '../store/useNotificationStore';
import { useSocket } from '../hooks/useSocket';
import { BmLogoAnimation } from './BmLogoAnimation';
import { FollowRequestsModal } from './common/FollowRequestsModal';
import { NotificationPopover } from '../features/notifications/NotificationPopover';
import { RealtimeToastContainer } from '../features/notifications/RealtimeToastContainer';

const drawerWidth = 240;

export const LayoutShell: React.FC = () => {
  useSocket();
  const { user, logout } = useAuthStore();
  const unreadChatTotal = useChatStore((s) => s.unreadTotal);
  const unreadNotifCount = useNotificationStore((s) => s.unreadCount);

  const navigate = useNavigate();
  const [requestsModalOpen, setRequestsModalOpen] = React.useState(false);
  const [notifAnchorEl, setNotifAnchorEl] = React.useState<HTMLElement | null>(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Home', path: '/', icon: <Home size={22} /> },
    { label: 'Search', path: '/search', icon: <Search size={22} /> },
    {
      label: 'Messages',
      path: '/chat',
      icon: (
        <Badge badgeContent={unreadChatTotal} color="error" max={99}>
          <MessageSquare size={22} />
        </Badge>
      ),
    },
    {
      label: 'Notifications',
      path: '#notifications',
      icon: (
        <Badge badgeContent={unreadNotifCount} color="error" max={99}>
          <Bell size={22} />
        </Badge>
      ),
      isNotifAction: true,
    },
    { label: 'Create', path: '/create', icon: <PlusSquare size={22} /> },
    { label: 'Requests', path: '#requests', icon: <UserCheck size={22} />, isAction: true },
    { label: 'Profile', path: '/profile', icon: <UserIcon size={22} /> },
    { label: 'Settings', path: '/settings', icon: <Settings size={22} /> },
  ];

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            bgcolor: '#121212',
            borderRight: '1px solid #27272a',
            px: 2,
            py: 3,
            display: 'flex',
            flexDirection: 'column',
            justify: 'space-between',
          },
        }}
      >
        <Box>
          <Box sx={{ mb: 4, px: 1 }}>
            <BmLogoAnimation variant="header" autoPlay />
          </Box>

          <List disablePadding>
            {navItems.map((item) => (
              <ListItem key={item.label} disablePadding sx={{ mb: 1 }}>
                {item.isAction ? (
                  <ListItemButton
                    onClick={() => setRequestsModalOpen(true)}
                    sx={{
                      width: '100%',
                      borderRadius: 2,
                      color: '#f4f4f5',
                      '&:hover': {
                        bgcolor: 'rgba(255, 255, 255, 0.05)',
                      },
                    }}
                  >
                    <ListItemIcon sx={{ color: '#a1a1aa', minWidth: 40 }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText primary={item.label} disableTypography sx={{ fontSize: '15px' }} />
                  </ListItemButton>
                ) : item.isNotifAction ? (
                  <ListItemButton
                    onClick={(e) => setNotifAnchorEl(e.currentTarget)}
                    sx={{
                      width: '100%',
                      borderRadius: 2,
                      color: '#f4f4f5',
                      '&:hover': {
                        bgcolor: 'rgba(255, 255, 255, 0.05)',
                      },
                    }}
                  >
                    <ListItemIcon sx={{ color: '#a1a1aa', minWidth: 40 }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText primary={item.label} disableTypography sx={{ fontSize: '15px' }} />
                  </ListItemButton>
                ) : (
                  <NavLink
                    to={item.path}
                    style={({ isActive }) => ({
                      width: '100%',
                      textDecoration: 'none',
                      color: isActive ? '#0095f6' : '#f4f4f5',
                      fontWeight: isActive ? 600 : 400,
                    })}
                  >
                    {({ isActive }) => (
                      <ListItemButton
                        sx={{
                          borderRadius: 2,
                          bgcolor: isActive ? 'rgba(0, 149, 246, 0.1)' : 'transparent',
                          '&:hover': {
                            bgcolor: 'rgba(255, 255, 255, 0.05)',
                          },
                        }}
                      >
                        <ListItemIcon sx={{ color: isActive ? '#0095f6' : '#a1a1aa', minWidth: 40 }}>
                          {item.icon}
                        </ListItemIcon>
                        <ListItemText primary={item.label} disableTypography sx={{ fontSize: '15px' }} />
                      </ListItemButton>
                    )}
                  </NavLink>
                )}
              </ListItem>
            ))}
          </List>
        </Box>

        <Box>
          <Divider sx={{ mb: 2, borderColor: '#27272a' }} />
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              p: 1,
              borderRadius: 2,
              bgcolor: '#18181b',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, overflow: 'hidden' }}>
              <Avatar
                src={user?.avatarUrl}
                alt={user?.username}
                sx={{ width: 36, height: 36, bgcolor: '#0095f6' }}
              >
                {user?.username?.charAt(0).toUpperCase()}
              </Avatar>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="body2" noWrap sx={{ fontWeight: 600, color: '#f4f4f5' }}>
                  {user?.username}
                </Typography>
                <Typography variant="caption" noWrap sx={{ color: '#a1a1aa', display: 'block' }}>
                  {user?.email}
                </Typography>
              </Box>
            </Box>

            <Tooltip title="Log Out">
              <IconButton onClick={handleLogout} size="small" sx={{ color: '#ef4444', '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.1)' } }}>
                <LogOut size={18} />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          bgcolor: '#0f0f10',
          minHeight: '100vh',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <Box sx={{ maxWidth: '935px', width: '100%' }}>
          <Outlet />
        </Box>
      </Box>

      <FollowRequestsModal
        open={requestsModalOpen}
        onClose={() => setRequestsModalOpen(false)}
      />

      <NotificationPopover
        anchorEl={notifAnchorEl}
        open={Boolean(notifAnchorEl)}
        onClose={() => setNotifAnchorEl(null)}
      />

      <RealtimeToastContainer />
    </Box>
  );
};
