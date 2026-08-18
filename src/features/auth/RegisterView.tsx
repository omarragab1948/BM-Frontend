import React, { useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
  CircularProgress,
  Divider,
} from '@mui/material';
import { Mail, User as UserIcon, Lock, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { BmLogoAnimation } from '../../components/BmLogoAnimation';
import { registerSchema, type RegisterFormData } from './schemas/authSchemas';

export const RegisterView: React.FC = () => {
  const navigate = useNavigate();
  const { register: registerAuth, isLoading, registerError, clearErrors } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      username: '',
      password: '',
    },
  });

  useEffect(() => {
    clearErrors();
  }, [clearErrors]);

  const onSubmit = async (data: RegisterFormData) => {
    clearErrors();
    const success = await registerAuth({
      email: data.email,
      username: data.username,
      password: data.password,
    });
    if (success) {
      navigate('/');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#0f0f10',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          maxWidth: '460px',
          width: '100%',
          bgcolor: '#18181b',
          borderRadius: 3,
          p: { xs: 4, sm: 5 },
          border: '1px solid #27272a',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.4)',
        }}
      >
        <Box sx={{ mb: 3 }}>
          <Button
            component={RouterLink}
            to="/login"
            startIcon={<ArrowLeft size={18} />}
            sx={{ color: '#a1a1aa', pl: 0, '&:hover': { color: '#f4f4f5', bgcolor: 'transparent' } }}
          >
            Back to sign in
          </Button>
        </Box>

        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Box sx={{ display: 'inline-block', mb: 2 }}>
            <BmLogoAnimation variant="header" autoPlay />
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#f4f4f5', mb: 1 }}>
            Sign up for BM
          </Typography>
          <Typography variant="body2" sx={{ color: '#a1a1aa' }}>
            Sign up to see photos and videos from your friends.
          </Typography>
        </Box>

        {registerError && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2, bgcolor: 'rgba(239, 68, 68, 0.15)', color: '#fca5a5' }}>
            {registerError}
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Box>
              <Typography variant="body2" sx={{ color: '#f4f4f5', fontWeight: 600, mb: 0.8 }}>
                Email Address
              </Typography>
              <TextField
                fullWidth
                placeholder="name@example.com"
                {...register('email')}
                error={!!errors.email}
                helperText={errors.email?.message}
                slotProps={{
                  input: {
                    startAdornment: (
                      <Box sx={{ mr: 1, color: '#71717a', display: 'flex', alignItems: 'center' }}>
                        <Mail size={18} />
                      </Box>
                    ),
                  },
                }}
              />
            </Box>

            <Box>
              <Typography variant="body2" sx={{ color: '#f4f4f5', fontWeight: 600, mb: 0.8 }}>
                Username
              </Typography>
              <TextField
                fullWidth
                placeholder="username"
                {...register('username')}
                error={!!errors.username}
                helperText={errors.username?.message}
                slotProps={{
                  input: {
                    startAdornment: (
                      <Box sx={{ mr: 1, color: '#71717a', display: 'flex', alignItems: 'center' }}>
                        <UserIcon size={18} />
                      </Box>
                    ),
                  },
                }}
              />
            </Box>

            <Box>
              <Typography variant="body2" sx={{ color: '#f4f4f5', fontWeight: 600, mb: 0.8 }}>
                Password
              </Typography>
              <TextField
                fullWidth
                type="password"
                placeholder="Create a strong password"
                {...register('password')}
                error={!!errors.password}
                helperText={errors.password?.message}
                slotProps={{
                  input: {
                    startAdornment: (
                      <Box sx={{ mr: 1, color: '#71717a', display: 'flex', alignItems: 'center' }}>
                        <Lock size={18} />
                      </Box>
                    ),
                  },
                }}
              />
            </Box>

            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={isLoading}
              sx={{
                mt: 1,
                py: 1.5,
                fontSize: '15px',
                bgcolor: '#0095f6',
                '&:hover': { bgcolor: '#1877f2' },
              }}
            >
              {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Sign Up'}
            </Button>
          </Box>
        </form>

        <Divider sx={{ my: 3, borderColor: '#27272a' }} />

        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" sx={{ color: '#a1a1aa', mb: 1.5 }}>
            Already have an account?
          </Typography>
          <Button
            component={RouterLink}
            to="/login"
            variant="outlined"
            fullWidth
            sx={{ py: 1.2 }}
          >
            I already have an account
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};
