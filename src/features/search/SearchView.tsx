import React from 'react';
import { Box, Typography, Paper, TextField, Chip } from '@mui/material';
import { Search } from 'lucide-react';

export const SearchView: React.FC = () => {
  return (
    <Box sx={{ maxWidth: '600px', mx: 'auto', py: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justify: 'space-between', mb: 3 }}>
        <Typography variant="h5" sx={{ color: '#f4f4f5', fontWeight: 700 }}>
          Search Network
        </Typography>
        <Chip label="src/features/search" size="small" sx={{ bgcolor: 'rgba(0, 149, 246, 0.15)', color: '#38bdf8' }} />
      </Box>

      <TextField
        fullWidth
        placeholder="Search users, posts, or tags..."
        slotProps={{
          input: {
            startAdornment: (
              <Box sx={{ mr: 1, color: '#71717a', display: 'flex', alignItems: 'center' }}>
                <Search size={18} />
              </Box>
            ),
          },
        }}
        sx={{ mb: 3 }}
      />

      <Paper sx={{ p: 4, bgcolor: '#18181b', border: '1px solid #27272a', borderRadius: 3, textAlign: 'center' }}>
        <Typography variant="body2" sx={{ color: '#a1a1aa' }}>
          Search feature folder is scaffolded and ready for query indexing logic.
        </Typography>
      </Paper>
    </Box>
  );
};
