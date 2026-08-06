import React from 'react';
import { Box, Typography, Card, CardHeader, CardMedia, CardContent, Avatar, IconButton, Chip } from '@mui/material';
import { Heart, MessageCircle, Share2, Bookmark } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

export const FeedView: React.FC = () => {
  const { user } = useAuthStore();

  return (
    <Box sx={{ maxWidth: '600px', mx: 'auto', py: 2 }}>
      {/* Welcome Banner */}
      <Card sx={{ bgcolor: '#18181b', border: '1px solid #27272a', borderRadius: 3, mb: 3, p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar src={user?.avatarUrl} sx={{ width: 56, height: 56, bgcolor: '#0095f6' }} />
          <Box>
            <Typography variant="h6" sx={{ color: '#f4f4f5', fontWeight: 600 }}>
              Welcome back, {user?.username}! 👋
            </Typography>
            <Typography variant="body2" sx={{ color: '#a1a1aa' }}>
              Your session is authenticated via secure cookies. Feed module ready for features.
            </Typography>
          </Box>
        </Box>
      </Card>

      {/* Feature Folder Indicator */}
      <Box sx={{ display: 'flex', alignItems: 'center', justify: 'space-between', mb: 2 }}>
        <Typography variant="subtitle1" sx={{ color: '#f4f4f5', fontWeight: 600 }}>
          Home Feed (Feature Scaffold)
        </Typography>
        <Chip label="src/features/feed" size="small" sx={{ bgcolor: 'rgba(0, 149, 246, 0.15)', color: '#38bdf8' }} />
      </Box>

      {/* Sample Post Card */}
      <Card sx={{ bgcolor: '#18181b', border: '1px solid #27272a', borderRadius: 3, mb: 3 }}>
        <CardHeader
          avatar={<Avatar src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100" />}
          title={<Typography variant="subtitle2" sx={{ color: '#f4f4f5', fontWeight: 600 }}>alexandra_art</Typography>}
          subheader={<Typography variant="caption" sx={{ color: '#71717a' }}>2 hours ago</Typography>}
        />
        <CardMedia
          component="img"
          height="380"
          image="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80"
          alt="Sample post"
        />
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton size="small" sx={{ color: '#f4f4f5' }}><Heart size={20} /></IconButton>
              <IconButton size="small" sx={{ color: '#f4f4f5' }}><MessageCircle size={20} /></IconButton>
              <IconButton size="small" sx={{ color: '#f4f4f5' }}><Share2 size={20} /></IconButton>
            </Box>
            <IconButton size="small" sx={{ color: '#f4f4f5' }}><Bookmark size={20} /></IconButton>
          </Box>
          <Typography variant="body2" sx={{ color: '#f4f4f5', fontWeight: 600, mb: 0.5 }}>
            1,248 likes
          </Typography>
          <Typography variant="body2" sx={{ color: '#d4d4d8' }}>
            <strong>alexandra_art</strong> Exploring generative minimal aesthetics. What do you think? ✨
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};
