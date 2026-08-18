import React, { useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Divider,
} from '@mui/material';
import { Lock, User as UserIcon } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { BmLogoAnimation } from '../../components/BmLogoAnimation';
import { loginSchema, type LoginFormData } from './schemas/authSchemas';

export const LoginView: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading, loginError, clearErrors } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      loginIdentifier: '',
      password: '',
    },
  });

  useEffect(() => {
    clearErrors();
  }, [clearErrors]);

  const onSubmit = async (data: LoginFormData) => {
    clearErrors();
    const success = await login({
      loginIdentifier: data.loginIdentifier,
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
      <Box
        sx={{
          display: 'flex',
          maxWidth: '920px',
          width: '100%',
          bgcolor: '#121212',
          borderRadius: 3,
          overflow: 'hidden',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.4)',
          border: '1px solid #27272a',
        }}
      >
        <Box
          sx={{
            flex: 1.1,
            display: { xs: 'none', md: 'flex' },
            flexDirection: 'column',
            justify: 'center',
            alignItems: 'center',
            p: 6,
            background: 'radial-gradient(circle at 30% 30%, #1e1b4b 0%, #09090b 100%)',
            position: 'relative',
            borderRight: '1px solid #27272a',
          }}
        >
          <Box sx={{ mb: 4 }}>
            <BmLogoAnimation variant="hero" autoPlay />
          </Box>

          <Typography
            variant="h4"
            align="center"
            sx={{
              color: '#ffffff',
              fontWeight: 700,
              mb: 2,
              lineHeight: 1.25,
            }}
          >
            Be{' '}
            <Box
              component="span"
              sx={{
                background: 'linear-gradient(45deg, #0095f6, #d946ef, #e1306c)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: 900,
              }}
            >
              IN THE WORLD
            </Box>
            <br />
            of bright moments and friends.
          </Typography>

          <Typography variant="body2" align="center" sx={{ color: '#a1a1aa', maxWidth: '340px' }}>
            BM social network — share photos, chat and stay connected.
          </Typography>
        </Box>

        <Box
          sx={{
            flex: 1,
            p: { xs: 4, sm: 6 },
            display: 'flex',
            flexDirection: 'column',
            justify: 'center',
            bgcolor: '#18181b',
          }}
        >
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#f4f4f5', mb: 1 }}>
              Sign in to BM
            </Typography>
            <Typography variant="body2" sx={{ color: '#a1a1aa' }}>
              Enter your account credentials
            </Typography>
          </Box>

          {loginError && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2, bgcolor: 'rgba(239, 68, 68, 0.15)', color: '#fca5a5' }}>
              {loginError}
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <TextField
                fullWidth
                placeholder="Email or Username"
                {...register('loginIdentifier')}
                error={!!errors.loginIdentifier}
                helperText={errors.loginIdentifier?.message}
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

              <TextField
                fullWidth
                type="password"
                placeholder="Password"
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

              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={isLoading}
                sx={{
                  py: 1.5,
                  fontSize: '15px',
                  bgcolor: '#0095f6',
                  '&:hover': { bgcolor: '#1877f2' },
                }}
              >
                {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
              </Button>
            </Box>
          </form>

          <Divider sx={{ my: 3, borderColor: '#27272a' }}>
            <Typography variant="caption" sx={{ color: '#71717a' }}>
              OR
            </Typography>
          </Divider>

          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: '#a1a1aa', mb: 2 }}>
              Don't have an account?
            </Typography>
            <Button
              component={RouterLink}
              to="/register"
              variant="outlined"
              fullWidth
              sx={{ py: 1.2 }}
            >
              Create Account
            </Button>
          </Box>

          <Typography
            variant="caption"
            align="center"
            sx={{ color: '#71717a', mt: 4, display: 'block' }}
          >
            Protected by secure session Cookies
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};
