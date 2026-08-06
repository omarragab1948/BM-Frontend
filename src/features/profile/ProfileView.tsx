import React from 'react';
import { Box, Typography, Avatar, Button, Paper, Chip } from '@mui/material';
import { useAuthStore } from '../../store/useAuthStore';

export const ProfileView: React.FC = () => {
  const { user } = useAuthStore();

  return (
    <Box sx={{ maxWidth: '800px', mx: 'auto', py: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5" sx={{ color: '#f4f4f5', fontWeight: 700 }}>
          User Profile
        </Typography>
        <Chip label="src/features/profile" size="small" sx={{ bgcolor: 'rgba(0, 149, 246, 0.15)', color: '#38bdf8' }} />
      </Box>

      {/* Profile Header Card */}
      <Paper sx={{ p: 4, bgcolor: '#18181b', border: '1px solid #27272a', borderRadius: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'center', gap: 4 }}>
          <Avatar
            src={user?.avatarUrl}
            alt={user?.username}
            sx={{ width: 100, height: 100, bgcolor: '#0095f6', border: '2px solid #0095f6' }}
          >
            {user?.username.charAt(0).toUpperCase()}
          </Avatar>

          <Box sx={{ flex: 1, textAlign: { xs: 'center', sm: 'left' } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1, justifyContent: { xs: 'center', sm: 'flex-start' } }}>
              <Typography variant="h6" sx={{ color: '#f4f4f5', fontWeight: 600 }}>
                {user?.username}
              </Typography>
              <Button variant="outlined" size="small" sx={{ borderColor: '#3f3f46', color: '#f4f4f5' }}>
                Edit Profile
              </Button>
            </Box>

            <Box sx={{ display: 'flex', gap: 3, mb: 2, justifyContent: { xs: 'center', sm: 'flex-start' } }}>
              <Typography variant="body2" sx={{ color: '#a1a1aa' }}>
                <strong style={{ color: '#f4f4f5' }}>0</strong> posts
              </Typography>
              <Typography variant="body2" sx={{ color: '#a1a1aa' }}>
                <strong style={{ color: '#f4f4f5' }}>124</strong> followers
              </Typography>
              <Typography variant="body2" sx={{ color: '#a1a1aa' }}>
                <strong style={{ color: '#f4f4f5' }}>88</strong> following
              </Typography>
            </Box>

            <Typography variant="body2" sx={{ color: '#d4d4d8' }}>
              {user?.bio || 'No bio specified yet.'}
            </Typography>
            <Typography variant="caption" sx={{ color: '#71717a', display: 'block', mt: 0.5 }}>
              Account Email: {user?.email}
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Grid placeholder using CSS Grid */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
        {[1, 2, 3].map((item) => (
          <Box
            key={item}
            sx={{
              aspectRatio: '1/1',
              bgcolor: '#27272a',
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#71717a',
            }}
          >
            Post {item} Placeholder
          </Box>
        ))}
      </Box>
    </Box>
  );
};
