import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Link from '@mui/material/Link';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { Link as RouterLink, NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';
import { EnlaceSaltar, ID_CONTENIDO } from '../componentes/EnlaceSaltar';

const estiloNav = {
  color: 'inherit',
  px: 1.5,
  '&.active': { textDecoration: 'underline', textUnderlineOffset: 6 },
} as const;

export function LayoutPublico() {
  const { usuario } = useAuth();
  const puedeEntrarAlPanel = usuario?.rol === 'ADMIN' || usuario?.rol === 'PERSONAL';

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <EnlaceSaltar />
      <AppBar position="static" component="header" color="primary">
        <Toolbar component="nav" aria-label="Navegación principal" sx={{ gap: 1 }}>
          <Typography
            variant="h6"
            component={RouterLink}
            to="/"
            sx={{ color: 'inherit', textDecoration: 'none', flexGrow: 1, fontWeight: 700 }}
          >
            Memoria Digital del Atlántico
          </Typography>
          <Button component={NavLink} to="/" end sx={estiloNav}>
            Inicio
          </Button>
          {puedeEntrarAlPanel ? (
            <Button component={NavLink} to="/panel" sx={estiloNav}>
              Panel
            </Button>
          ) : (
            <Button component={NavLink} to="/ingresar" variant="outlined" sx={estiloNav}>
              Ingresar
            </Button>
          )}
        </Toolbar>
      </AppBar>

      <Container component="main" id={ID_CONTENIDO} tabIndex={-1} sx={{ py: 4, flexGrow: 1 }}>
        <Outlet />
      </Container>

      <Box component="footer" sx={{ py: 2, textAlign: 'center', color: 'text.secondary' }}>
        <Typography variant="body2">
          Archivo Histórico del Atlántico ·{' '}
          <Link href="/docs" target="_blank" rel="noopener">
            Documentación de la API
          </Link>
        </Typography>
      </Box>
    </Box>
  );
}
