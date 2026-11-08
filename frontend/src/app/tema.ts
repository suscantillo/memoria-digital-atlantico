import { createTheme } from '@mui/material/styles';

export const colores = {
  azulMarino: '#0E2D6B',
  azulMedio: '#1B3F8F',
  naranja: '#CC3F14',
  amarillo: '#FFC21A',
  turquesa: '#0096A8',
  turquesaOscuro: '#00808F',
  crema: '#FFF4E0',
  papel: '#FFFAF0',
} as const;

const fuenteTitulos = '"Archivo Variable", system-ui, sans-serif';

export const tema = createTheme({
  palette: {
    primary: { main: colores.azulMarino, contrastText: '#FFFFFF' },
    secondary: { main: colores.naranja, contrastText: '#FFFFFF' },
    // el texto sobre amarillo va en azul: en blanco no alcanza el contraste mínimo de accesibilidad
    warning: { main: colores.amarillo, contrastText: colores.azulMarino },
    // el turquesa del diseño con texto blanco no llega a 4,5:1; para textos se usa el oscuro
    success: { main: colores.turquesaOscuro, contrastText: '#FFFFFF' },
    background: { default: colores.crema, paper: colores.papel },
    text: { primary: colores.azulMarino, secondary: '#4B5A73' },
  },
  shape: { borderRadius: 8 },
  typography: {
    fontFamily:
      '"Figtree Variable", system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif',
    h1: { fontFamily: fuenteTitulos, fontSize: '2.5rem', fontWeight: 900, lineHeight: 1.05 },
    h2: { fontFamily: fuenteTitulos, fontSize: '1.75rem', fontWeight: 800 },
    h3: { fontFamily: fuenteTitulos, fontSize: '1.25rem', fontWeight: 700 },
    button: { fontFamily: fuenteTitulos, fontWeight: 700 },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        // sobre fondos azules el layout cambia --color-foco a amarillo para que el contorno se vea
        '*:focus-visible': {
          outline: `3px solid var(--color-foco, ${colores.naranja})`,
          outlineOffset: 2,
        },
        // quien pide menos movimiento en su sistema no ve animaciones (mareo, distracción)
        '@media (prefers-reduced-motion: reduce)': {
          '*, *::before, *::after': {
            animationDuration: '0.01ms !important',
            animationIterationCount: '1 !important',
            transitionDuration: '0.01ms !important',
          },
        },
      },
    },
    // MUI quita el contorno de sus botones y deja solo una onda suave que con teclado casi no se ve
    MuiButtonBase: {
      styleOverrides: {
        root: {
          '&:focus-visible': {
            outline: `3px solid var(--color-foco, ${colores.naranja})`,
            outlineOffset: 2,
          },
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
