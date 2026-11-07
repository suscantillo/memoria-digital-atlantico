import { createTheme } from '@mui/material/styles';

export const colores = {
  azulMarino: '#0B2A55',
  naranja: '#D9480F',
  crema: '#FFF4E3',
} as const;

export const tema = createTheme({
  palette: {
    primary: { main: colores.azulMarino, contrastText: '#FFFFFF' },
    secondary: { main: colores.naranja, contrastText: '#FFFFFF' },
    background: { default: colores.crema, paper: '#FFFFFF' },
    text: { primary: '#1A1A1A', secondary: '#4A4A4A' },
  },
  shape: { borderRadius: 8 },
  typography: {
    fontFamily:
      'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif',
    h1: { fontSize: '2rem', fontWeight: 700 },
    h2: { fontSize: '1.5rem', fontWeight: 700 },
    h3: { fontSize: '1.25rem', fontWeight: 600 },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        '*:focus-visible': {
          outline: `3px solid ${colores.naranja}`,
          outlineOffset: 2,
        },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: { root: { textTransform: 'none', fontWeight: 600 } },
    },
    MuiLink: {
      defaultProps: { underline: 'hover' },
    },
  },
});
