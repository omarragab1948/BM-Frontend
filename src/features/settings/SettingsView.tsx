import React from 'react';
import { Box, Typography, Paper, Switch, FormControlLabel, Divider, Chip } from '@mui/material';

export const SettingsView: React.FC = () => {
  return (
    <Box sx={{ maxWidth: '600px', mx: 'auto', py: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justify: 'space-between', mb: 3 }}>
        <Typography variant="h5" sx={{ color: '#f4f4f5', fontWeight: 700 }}>
          Account Settings
        </Typography>
        <Chip label="src/features/settings" size="small" sx={{ bgcolor: 'rgba(0, 149, 246, 0.15)', color: '#38bdf8' }} />
      </Box>

      <Paper sx={{ p: 4, bgcolor: '#18181b', border: '1px solid #27272a', borderRadius: 3 }}>
        <Typography variant="subtitle1" sx={{ color: '#f4f4f5', fontWeight: 600, mb: 2 }}>
          Security & Authentication
        </Typography>
        
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" sx={{ color: '#f4f4f5', fontWeight: 600 }}>
            Session Storage Strategy
          </Typography>
          <Typography variant="caption" sx={{ color: '#0095f6', display: 'block', mt: 0.5 }}>
            Active: Cookie Session Management (js-cookie)
          </Typography>
        </Box>

        <Divider sx={{ my: 2, borderColor: '#27272a' }} />

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <FormControlLabel
            control={<Switch defaultChecked sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#0095f6' } }} />}
            label={<Typography variant="body2" sx={{ color: '#d4d4d8' }}>Private Account Mode</Typography>}
          />
          <FormControlLabel
            control={<Switch defaultChecked sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#0095f6' } }} />}
            label={<Typography variant="body2" sx={{ color: '#d4d4d8' }}>Push Notifications</Typography>}
          />
        </Box>
      </Paper>
    </Box>
  );
};
