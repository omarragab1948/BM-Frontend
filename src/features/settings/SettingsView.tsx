import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Switch,
  FormControlLabel,
  Button,
  TextField,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Lock, Shield, LogOut, Key, CheckCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '../../store/useAuthStore';
import { userService } from '../../services/userService';
import { setUserCookie } from '../../utils/authCookie';
import { useNavigate } from 'react-router-dom';
import { BlockedUsersList } from './BlockedUsersList';

const changePasswordSchema = z.object({
  currentPassword: z.string().optional(),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
});

type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

export const SettingsView: React.FC = () => {
  const navigate = useNavigate();
  const { user: currentUser, logout } = useAuthStore();

  const [isPrivate, setIsPrivate] = useState(currentUser?.isPrivate || false);
  const [updatingPrivacy, setUpdatingPrivacy] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
    },
  });

  const handlePrivacyToggle = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setIsPrivate(checked);
    setUpdatingPrivacy(true);
    setError(null);
    setSuccess(null);

    try {
      const updated = await userService.updateProfile({ isPrivate: checked });
      setUserCookie(updated);
      useAuthStore.setState({ user: updated });
      setSuccess('Privacy settings updated');
    } catch (err: any) {
      setError(err.message || 'Error updating privacy settings');
      setIsPrivate(!checked);
    } finally {
      setUpdatingPrivacy(false);
    }
  };

  const onChangePassword = async (data: ChangePasswordFormData) => {
    setChangingPassword(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await userService.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      setSuccess(res.message || 'Password changed successfully');
      reset();
    } catch (err: any) {
      setError(err.message || 'Error changing password');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Box sx={{ maxWidth: '640px', mx: 'auto', py: 3 }}>
      <Typography variant="h5" sx={{ color: '#f4f4f5', fontWeight: 700, mb: 3 }}>
        Account Settings
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Paper sx={{ p: 3, bgcolor: '#18181b', border: '1px solid #27272a', borderRadius: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ color: '#f4f4f5', fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Shield size={20} color="#0095f6" /> Account Privacy
        </Typography>

        <FormControlLabel
          control={
            <Switch
              checked={isPrivate}
              onChange={handlePrivacyToggle}
              disabled={updatingPrivacy}
              sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#0095f6' } }}
            />
          }
          label={
            <Box>
              <Typography variant="body2" sx={{ color: '#f4f4f5', fontWeight: 600 }}>
                Private Account
              </Typography>
              <Typography variant="caption" sx={{ color: '#a1a1aa', display: 'block' }}>
                When your account is private, only people you approve can see your photos and videos.
              </Typography>
            </Box>
          }
        />
      </Paper>

      <Paper sx={{ p: 3, bgcolor: '#18181b', border: '1px solid #27272a', borderRadius: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ color: '#f4f4f5', fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Key size={20} color="#0095f6" /> Change Password
        </Typography>

        <Box component="form" onSubmit={handleSubmit(onChangePassword)}>
          <TextField
            fullWidth
            type="password"
            size="small"
            label="Current Password"
            {...register('currentPassword')}
            error={Boolean(errors.currentPassword)}
            helperText={errors.currentPassword?.message}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            type="password"
            size="small"
            label="New Password"
            {...register('newPassword')}
            error={Boolean(errors.newPassword)}
            helperText={errors.newPassword?.message}
            sx={{ mb: 2 }}
          />

          <Button
            type="submit"
            variant="contained"
            disabled={changingPassword}
            startIcon={changingPassword ? <CircularProgress size={16} color="inherit" /> : <Lock size={16} />}
            sx={{ bgcolor: '#0095f6', color: '#fff', textTransform: 'none', fontWeight: 600, '&:hover': { bgcolor: '#1877f2' } }}
          >
            Change Password
          </Button>
        </Box>
      </Paper>

      <Box sx={{ mb: 3 }}>
        <BlockedUsersList />
      </Box>

      <Paper sx={{ p: 3, bgcolor: '#18181b', border: '1px solid #27272a', borderRadius: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="subtitle1" sx={{ color: '#f4f4f5', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
              <CheckCircle size={18} color="#22c55e" /> Current Session
            </Typography>
            <Typography variant="caption" sx={{ color: '#a1a1aa' }}>
              Logged in as <strong>{currentUser?.email}</strong>
            </Typography>
          </Box>

          <Button
            variant="outlined"
            onClick={handleLogout}
            startIcon={<LogOut size={16} />}
            sx={{ borderColor: '#ef4444', color: '#ef4444', textTransform: 'none', fontWeight: 600, '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.1)', borderColor: '#ef4444' } }}
          >
            Log Out
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};
