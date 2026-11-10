import FactCheckIcon from '@mui/icons-material/FactCheck';
import GroupIcon from '@mui/icons-material/Group';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import MenuIcon from '@mui/icons-material/Menu';
import PlaceIcon from '@mui/icons-material/Place';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import type { SvgIconComponent } from '@mui/icons-material';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { NavLink, Outlet, Link as RouterLink, useNavigate } from 'react-router-dom';
import { colores } from '../../app/tema';
import { useAuth } from '../auth/useAuth';
import { EnlaceSaltar, ID_CONTENIDO } from '../componentes/EnlaceSaltar';
import { Isotipo } from '../componentes/Isotipo';
import type { RolUsuario } from '../tipos/usuario';

const ANCHO_MENU = 260;
const ID_MENU = 'menu-panel';

interface Seccion {
  etiqueta: string;
  ruta: string;
  Icono: SvgIconComponent;
  soloAdmin?: boolean;
}

const secciones: Seccion[] = [
  { etiqueta: 'Inventario', ruta: '/panel/inventario', Icono: Inventory2Icon },
  { etiqueta: 'Control de calidad', ruta: '/panel/calidad', Icono: FactCheckIcon },
  { etiqueta: 'Ubicaciones', ruta: '/panel/ubicaciones', Icono: PlaceIcon },
  { etiqueta: 'Etiquetas QR', ruta: '/panel/etiquetas', Icono: QrCode2Icon },
  { etiqueta: 'Usuarios', ruta: '/panel/usuarios', Icono: GroupIcon, soloAdmin: true },
];

const NOMBRE_ROL: Record<RolUsuario, string> = {
  ADMIN: 'Administrador',
  PERSONAL: 'Personal del archivo',
  PUBLICO: 'Cuenta pública',
};

const estiloSeccion = {
  minHeight: 48,
  borderRadius: 3.5,
  color: '#DDE3EE',
  transition: 'transform .2s, background-color .2s',
} as const;

function iniciales(nombre: string) {
  return nombre
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0]?.toUpperCase())
    .join('');
}

export function LayoutPanel() {
  const { usuario, salir } = useAuth();
  const navegar = useNavigate();
  const [menuAbierto, setMenuAbierto] = useState(false);

  const cerrarSesion = async () => {
    await salir();
    navegar('/', { replace: true });
  };

  const contenidoMenu = (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, height: '100%', p: 2 }}>
      <Link
        component={RouterLink}
        to="/"
        underline="none"
        aria-label="Memoria Digital del Atlántico, ir al portal público"
        sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: '#FFFFFF', px: 1, pt: 1 }}
      >
        <Isotipo color={colores.amarillo} tamano={34} />
        <Box>
          <Typography sx={{ fontFamily: 'h1.fontFamily', fontWeight: 900, lineHeight: 1.1 }}>
            Memoria{' '}
            <Box component="span" sx={{ color: colores.amarillo }}>
              Digital
            </Box>
          </Typography>
          <Typography
            sx={{
              fontFamily: 'monospace',
              fontSize: '0.75rem',
              color: '#B9C3D6',
              letterSpacing: 1,
            }}
          >
            PANEL DEL PERSONAL
          </Typography>
        </Box>
      </Link>

      <List disablePadding sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
        {secciones
          .filter((s) => !s.soloAdmin || usuario?.rol === 'ADMIN')
          .map(({ etiqueta, ruta, Icono, soloAdmin }) => (
            <ListItem key={etiqueta} disablePadding>
              <ListItemButton
                component={NavLink}
                to={ruta}
                onClick={() => setMenuAbierto(false)}
                sx={{
                  ...estiloSeccion,
                  '&:hover': {
                    bgcolor: colores.azulMedio,
                    color: '#FFFFFF',
                    transform: 'translateX(4px)',
                  },
                  '&.active': {
                    bgcolor: colores.naranja,
                    color: '#FFFFFF',
                    fontWeight: 700,
                    boxShadow: '0 5px 0 #8F2A0C',
                  },
                }}
              >
                <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
                  <Icono aria-hidden />
                </ListItemIcon>
                <ListItemText
                  primary={etiqueta}
                  secondary={soloAdmin ? 'Solo administrador' : undefined}
                  primaryTypographyProps={{ fontWeight: 'inherit' }}
                  secondaryTypographyProps={{ sx: { color: '#B9C3D6', fontSize: 12 } }}
                />
              </ListItemButton>
            </ListItem>
          ))}
      </List>

      {usuario && (
        <Box
          sx={{
            mt: 'auto',
            p: 1.75,
            borderRadius: 4.5,
            bgcolor: colores.azulMedio,
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
          }}
        >
          <Box
            aria-hidden
            sx={{
              flex: 'none',
              width: 44,
              height: 44,
              borderRadius: '50%',
              bgcolor: colores.amarillo,
              color: colores.azulMarino,
              display: 'grid',
              placeItems: 'center',
              fontFamily: 'h1.fontFamily',
              fontWeight: 900,
            }}
          >
            {iniciales(usuario.nombre)}
          </Box>
          <Box sx={{ minWidth: 0, fontSize: '0.875rem', lineHeight: 1.3 }}>
            <Typography sx={{ color: '#FFFFFF', fontWeight: 700, fontSize: 'inherit' }}>
              {usuario.nombre}
            </Typography>
            <Typography sx={{ fontSize: 'inherit', overflowWrap: 'anywhere' }}>
              {usuario.correo}
            </Typography>
            <Typography
              sx={{
                fontSize: 12,
                fontWeight: 700,
                color: colores.amarillo,
                letterSpacing: '0.02em',
              }}
            >
              {NOMBRE_ROL[usuario.rol]}
            </Typography>
            <Button
              onClick={cerrarSesion}
              sx={{
                p: 0,
                minWidth: 0,
                color: colores.amarillo,
                textDecoration: 'underline',
                fontFamily: 'inherit',
                fontWeight: 600,
              }}
            >
              Cerrar sesión
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );

  const estiloMenu = {
    '& .MuiDrawer-paper': {
      width: ANCHO_MENU,
      boxSizing: 'border-box',
      bgcolor: colores.azulMarino,
      color: '#DDE3EE',
      border: 0,
    },
    // sobre el azul, el contorno de foco naranja casi no se ve; en amarillo sí cumple el contraste
    '--color-foco': colores.amarillo,
  } as const;

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <EnlaceSaltar />

      <AppBar
        position="fixed"
        component="header"
        sx={{ display: { md: 'none' }, '--color-foco': colores.amarillo }}
      >
        <Toolbar sx={{ gap: 1 }}>
          <IconButton
            color="inherit"
            edge="start"
            aria-label="Abrir menú del panel"
            aria-controls={ID_MENU}
            aria-expanded={menuAbierto}
            onClick={() => setMenuAbierto(true)}
          >
            <MenuIcon />
          </IconButton>
          <Isotipo color={colores.amarillo} tamano={28} />
          <Typography variant="h6" component="p" noWrap sx={{ fontWeight: 900 }}>
            Panel
          </Typography>
        </Toolbar>
      </AppBar>

      {/* en el celular el menú se abre encima: uno fijo no cabe en 360 px */}
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
          sx={{ display: { xs: 'block', md: 'none' }, ...estiloMenu }}
        >
          {contenidoMenu}
        </Drawer>
        <Drawer
          variant="permanent"
          open
          sx={{ display: { xs: 'none', md: 'block' }, ...estiloMenu }}
        >
          {contenidoMenu}
        </Drawer>
      </Box>

      <Box
        component="main"
        id={ID_CONTENIDO}
        tabIndex={-1}
        sx={{ flexGrow: 1, minWidth: 0, px: { xs: 2, sm: 4 }, py: { xs: 3, sm: 4 } }}
      >
        <Toolbar sx={{ display: { md: 'none' } }} />
        <Outlet />
      </Box>
    </Box>
  );
}
