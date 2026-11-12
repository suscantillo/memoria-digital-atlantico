import HomeIcon from '@mui/icons-material/Home';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import SearchIcon from '@mui/icons-material/Search';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import { NavLink, Outlet, Link as RouterLink, useNavigate } from 'react-router-dom';
import { colores } from '../../app/tema';
import { useAuth } from '../auth/useAuth';
import { EnlaceSaltar, ID_CONTENIDO } from '../componentes/EnlaceSaltar';
import { Isotipo } from '../componentes/Isotipo';

const SOMBRA_PAPEL = '#F5D79E';

const estiloPildora = {
  px: 2,
  borderRadius: 999,
  color: colores.azulMarino,
  fontWeight: 700,
  '&:hover': { bgcolor: 'rgba(14, 45, 107, 0.07)' },
  '&.active, &.active:hover': { bgcolor: colores.naranja, color: '#FFFFFF' },
} as const;

const estiloItemMovil = {
  minHeight: 54,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 0.25,
  borderRadius: 4,
  color: '#DDE3EE',
  fontSize: '0.78rem',
  fontWeight: 700,
  textDecoration: 'none',
  '&.active': { bgcolor: colores.naranja, color: '#FFFFFF' },
} as const;

export function LayoutPublico() {
  const { usuario, salir } = useAuth();
  const navegar = useNavigate();
  const puedeEntrarAlPanel = usuario?.rol === 'ADMIN' || usuario?.rol === 'PERSONAL';
  // una cuenta pública no tiene panel: en su lugar puede cerrar la sesión
  const sesionPublica = Boolean(usuario) && !puedeEntrarAlPanel;
  const cuenta = puedeEntrarAlPanel
    ? { ruta: '/panel', etiqueta: 'Panel', corta: 'Panel' }
    : { ruta: '/ingresar', etiqueta: 'Iniciar sesión', corta: 'Ingresar' };

  const enlacesMovil = [
    { ruta: '/', etiqueta: 'Inicio', Icono: HomeIcon, fin: true },
    { ruta: '/explorar', etiqueta: 'Explorar', Icono: SearchIcon, fin: false },
    ...(sesionPublica ? [] : [{ ruta: cuenta.ruta, etiqueta: cuenta.corta, Icono: PersonIcon }]),
  ];
  const columnasMovil = enlacesMovil.length + (sesionPublica ? 1 : 0);

  const cerrarSesion = async () => {
    await salir();
    navegar('/', { replace: true });
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', overflowX: 'clip' }}>
      <EnlaceSaltar />

      <Container component="header" maxWidth="lg" sx={{ pt: { xs: 1.5, sm: 2.5 } }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
            py: 1.25,
            pl: 2.5,
            pr: 1.75,
            bgcolor: 'background.paper',
            borderRadius: 5.5,
            boxShadow: `0 6px 0 ${SOMBRA_PAPEL}`,
          }}
        >
          <Link
            component={RouterLink}
            to="/"
            underline="none"
            aria-label="Memoria Digital del Atlántico, ir al inicio"
            sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: colores.azulMarino }}
          >
            <Isotipo color={colores.naranja} />
            <Typography
              component="span"
              sx={{
                fontFamily: 'h1.fontFamily',
                fontWeight: 900,
                fontSize: { xs: '1.35rem', sm: '1.6rem' },
                letterSpacing: '-0.02em',
                lineHeight: 1,
              }}
            >
              Memoria{' '}
              <Box component="span" sx={{ color: colores.naranja }}>
                Digital
              </Box>
            </Typography>
            <Typography
              component="span"
              sx={{
                display: { xs: 'none', md: 'block' },
                pl: 1.75,
                borderLeft: '2px solid #E2CFA3',
                fontSize: '0.875rem',
                fontWeight: 600,
                lineHeight: 1.2,
              }}
            >
              Archivo Histórico
              <br />
              del Atlántico
            </Typography>
          </Link>

          <Box
            component="nav"
            aria-label="Navegación principal"
            sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center', gap: 0.5 }}
          >
            <Button component={NavLink} to="/" end sx={estiloPildora}>
              Inicio
            </Button>
            <Button component={NavLink} to="/explorar" sx={estiloPildora}>
              Explorar
            </Button>
            {sesionPublica && usuario ? (
              <>
                <Typography variant="body2" sx={{ px: 1.5, fontWeight: 600 }}>
                  {usuario.nombre} ({usuario.rol})
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<LogoutIcon />}
                  onClick={cerrarSesion}
                  sx={{ ml: 0.75, borderRadius: 999, px: 2.25 }}
                >
                  Salir
                </Button>
              </>
            ) : (
              <Button
                component={RouterLink}
                to={cuenta.ruta}
                variant="contained"
                startIcon={<PersonIcon />}
                sx={{ ml: 0.75, borderRadius: 999, px: 2.25 }}
              >
                {cuenta.etiqueta}
              </Button>
            )}
          </Box>
        </Box>
      </Container>

      <Container
        component="main"
        maxWidth="lg"
        id={ID_CONTENIDO}
        tabIndex={-1}
        sx={{ pt: { xs: 2.5, sm: 4 }, pb: { xs: 8, sm: 10 }, flexGrow: 1 }}
      >
        <Outlet />
      </Container>

      <Box
        component="footer"
        sx={{
          bgcolor: colores.azulMarino,
          color: '#CFD6E4',
          '--color-foco': colores.amarillo,
          // abajo deja libre el espacio que ocupa la barra inferior del celular
          pb: { xs: 11, sm: 0 },
        }}
      >
        <Container
          maxWidth="lg"
          sx={{
            py: 4.5,
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            gap: 2,
            fontSize: 16,
          }}
        >
          <span>
            <Box component="strong" sx={{ color: '#FFFFFF' }}>
              Memoria Digital del Atlántico
            </Box>{' '}
            · Proyecto académico para el CLENA · Universidad del Norte
          </span>
          <Link href="/docs" target="_blank" rel="noopener" sx={{ color: colores.amarillo }}>
            Documentación de la API
          </Link>
        </Container>
      </Box>

      {/* en el celular la navegación va abajo, al alcance del pulgar */}
      <Box
        component="nav"
        aria-label="Navegación del celular"
        sx={{
          display: { xs: 'grid', sm: 'none' },
          gridTemplateColumns: `repeat(${columnasMovil}, minmax(0, 1fr))`,
          gap: 0.5,
          position: 'fixed',
          zIndex: (t) => t.zIndex.appBar,
          left: 12,
          right: 12,
          bottom: 12,
          p: 0.75,
          borderRadius: 5,
          bgcolor: colores.azulMarino,
          boxShadow: '0 10px 30px rgba(14, 45, 107, 0.35)',
          '--color-foco': colores.amarillo,
        }}
      >
        {enlacesMovil.map(({ ruta, etiqueta, Icono, fin }) => (
          <Box
            key={etiqueta}
            component={NavLink}
            to={ruta}
            end={fin}
            sx={{
              minHeight: 54,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 0.25,
              borderRadius: 4,
              color: '#DDE3EE',
              fontSize: '0.78rem',
              fontWeight: 700,
              textDecoration: 'none',
              '&.active': { bgcolor: colores.naranja, color: '#FFFFFF' },
            }}
          >
            <Icono aria-hidden />
            {etiqueta}
          </Box>
        ))}
        {sesionPublica && (
          <Box
            component="button"
            type="button"
            onClick={cerrarSesion}
            sx={{
              ...estiloItemMovil,
              border: 0,
              bgcolor: 'transparent',
              font: 'inherit',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            <LogoutIcon aria-hidden />
            Salir
          </Box>
        )}
      </Box>
    </Box>
  );
}
