import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import PlaceIcon from '@mui/icons-material/Place';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';
import { EnlaceSaltar, ID_CONTENIDO } from '../componentes/EnlaceSaltar';

const ANCHO_MENU = 240;
const ID_MENU = 'menu-panel';

const secciones = [{ etiqueta: 'Ubicaciones', ruta: '/panel/ubicaciones', Icono: PlaceIcon }];

export function LayoutPanel() {
  const { usuario, salir } = useAuth();
  const navegar = useNavigate();
  const [menuAbierto, setMenuAbierto] = useState(false);

  const cerrarSesion = async () => {
    await salir();
    navegar('/', { replace: true });
  };

  const listaSecciones = (
    <List>
      {secciones.map(({ etiqueta, ruta, Icono }) => (
        <ListItem key={ruta} disablePadding>
          <ListItemButton
            component={NavLink}
            to={ruta}
            onClick={() => setMenuAbierto(false)}
            sx={{
              mx: 1,
              borderRadius: 2,
              '&.active': { bgcolor: 'secondary.main', color: 'secondary.contrastText' },
              '&.active .MuiListItemIcon-root': { color: 'inherit' },
            }}
          >
            <ListItemIcon>
              <Icono aria-hidden />
            </ListItemIcon>
            <ListItemText primary={etiqueta} />
          </ListItemButton>
        </ListItem>
      ))}
    </List>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <EnlaceSaltar />
      <AppBar position="fixed" component="header" sx={{ zIndex: (t) => t.zIndex.drawer + 1 }}>
        <Toolbar sx={{ gap: 1 }}>
          <IconButton
            color="inherit"
            edge="start"
            aria-label="Abrir menú del panel"
            aria-controls={ID_MENU}
            aria-expanded={menuAbierto}
            onClick={() => setMenuAbierto(true)}
            sx={{ display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="h1" noWrap sx={{ flexGrow: 1, fontWeight: 800 }}>
            Panel
            <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
              {' '}
              · Memoria Digital del Atlántico
            </Box>
          </Typography>
          {usuario && (
            <Typography
              variant="body2"
              noWrap
              aria-label={`Sesión de ${usuario.nombre}`}
              sx={{ display: { xs: 'none', sm: 'block' } }}
            >
              {usuario.nombre} ({usuario.rol})
            </Typography>
          )}
          <Button color="inherit" startIcon={<LogoutIcon />} onClick={cerrarSesion}>
            Salir
          </Button>
        </Toolbar>
      </AppBar>

      {/* en el celular el menú se abre encima: uno fijo de 240 px no cabe en 360 px */}
      <Box
        component="nav"
        aria-label="Secciones del panel"
        sx={{ width: { md: ANCHO_MENU }, flexShrink: { md: 0 } }}
      >
        <Drawer
          id={ID_MENU}
          variant="temporary"
          open={menuAbierto}
          onClose={() => setMenuAbierto(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { width: ANCHO_MENU, boxSizing: 'border-box' },
          }}
        >
          <Toolbar />
          {listaSecciones}
        </Drawer>
        <Drawer
          variant="permanent"
          open
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { width: ANCHO_MENU, boxSizing: 'border-box' },
          }}
        >
          <Toolbar />
          {listaSecciones}
        </Drawer>
      </Box>

      <Box
        component="main"
        id={ID_CONTENIDO}
        tabIndex={-1}
        sx={{ flexGrow: 1, minWidth: 0, p: { xs: 2, sm: 3 } }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
}
