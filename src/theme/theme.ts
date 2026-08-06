import { createTheme } from '@mui/material/styles';

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#0f0f10',
      paper: '#18181b',
    },
    primary: {
      main: '#0095f6',
      light: '#38bdf8',
      dark: '#0284c7',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#e1306c',
    },
    text: {
      primary: '#f4f4f5',
      secondary: '#a1a1aa',
    },
    divider: '#27272a',
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h4: {
      fontWeight: 700,
      letterSpacing: '-0.5px',
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
      borderRadius: '8px',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          padding: '10px 16px',
          fontWeight: 600,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
        contained: {
          backgroundColor: '#0095f6',
          '&:hover': {
            backgroundColor: '#1877f2',
          },
        },
        outlined: {
          borderColor: '#3f3f46',
          color: '#f4f4f5',
          '&:hover': {
            borderColor: '#71717a',
            backgroundColor: 'rgba(255, 255, 255, 0.04)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: '#27272a',
            borderRadius: '8px',
            '& fieldset': {
              borderColor: '#3f3f46',
            },
            '&:hover fieldset': {
              borderColor: '#71717a',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#0095f6',
              borderWidth: '1px',
            },
          },
          '& .MuiInputBase-input': {
            padding: '12px 14px',
            fontSize: '14px',
            color: '#f4f4f5',
          },
          '& .MuiInputLabel-root': {
            fontSize: '14px',
            color: '#a1a1aa',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          borderColor: '#27272a',
        },
      },
    },
  },
});
