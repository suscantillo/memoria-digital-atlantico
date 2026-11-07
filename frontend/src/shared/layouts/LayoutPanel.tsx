import LogoutIcon from '@mui/icons-material/Logout';
import PlaceIcon from '@mui/icons-material/Place';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';
import { EnlaceSaltar, ID_CONTENIDO } from '../componentes/EnlaceSaltar';

const ANCHO_MENU = 240;

const secciones = [{ etiqueta: 'Ubicaciones', ruta: '/panel/ubicaciones', Icono: PlaceIcon }];

export function LayoutPanel() {
  const { usuario, salir } = useAuth();
  const navegar = useNavigate();

  const cerrarSesion = async () => {
    await salir();
    navegar('/', { replace: true });
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <EnlaceSaltar />
      <AppBar position="fixed" component="header" sx={{ zIndex: (t) => t.zIndex.drawer + 1 }}>
        <Toolbar sx={{ gap: 2 }}>
          <Typography variant="h6" component="h1" sx={{ flexGrow: 1, fontWeight: 700 }}>
            Panel · Memoria Digital del Atlántico
          </Typography>
          {usuario && (
            <Typography variant="body2" aria-label={`Sesión de ${usuario.nombre}`}>
              {usuario.nombre} ({usuario.rol})
            </Typography>
          )}
          <Button color="inherit" startIcon={<LogoutIcon />} onClick={cerrarSesion}>
            Salir
          </Button>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        component="nav"
        aria-label="Secciones del panel"
        sx={{
          width: ANCHO_MENU,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: ANCHO_MENU, boxSizing: 'border-box' },
        }}
      >
        <Toolbar />
        <List>
          {secciones.map(({ etiqueta, ruta, Icono }) => (
            <ListItem key={ruta} disablePadding>
              <ListItemButton
                component={NavLink}
                to={ruta}
                sx={{ '&.active': { bgcolor: 'action.selected', fontWeight: 700 } }}
              >
                <ListItemIcon>
                  <Icono aria-hidden />
                </ListItemIcon>
                <ListItemText primary={etiqueta} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>

      <Box component="main" id={ID_CONTENIDO} tabIndex={-1} sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
}
