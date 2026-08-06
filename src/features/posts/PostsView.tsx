import React from 'react';
import { Box, Typography, Paper, Chip } from '@mui/material';

export const PostsView: React.FC = () => {
  return (
    <Box sx={{ maxWidth: '600px', mx: 'auto', py: 4 }}>
      <Paper sx={{ p: 4, bgcolor: '#18181b', border: '1px solid #27272a', borderRadius: 3, textAlign: 'center' }}>
        <Chip label="src/features/posts" size="small" sx={{ bgcolor: 'rgba(0, 149, 246, 0.15)', color: '#38bdf8', mb: 2 }} />
        <Typography variant="h6" sx={{ color: '#f4f4f5', fontWeight: 600, mb: 1 }}>
          Create & Manage Posts (Feature Scaffold)
        </Typography>
        <Typography variant="body2" sx={{ color: '#a1a1aa' }}>
          This folder is scaffolded for post creation modals, comment trees, and media upload features.
        </Typography>
      </Paper>
    </Box>
  );
};
