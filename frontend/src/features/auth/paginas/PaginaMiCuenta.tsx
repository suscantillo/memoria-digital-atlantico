import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import LogoutIcon from '@mui/icons-material/Logout';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { colores } from '../../../app/tema';
import { useAuth } from '../../../shared/auth/useAuth';
import { MensajeError } from '../../../shared/componentes/MensajeError';
import { authApi } from '../api';

const MONO = '"Courier New", ui-monospace, monospace';
const fecha = new Intl.DateTimeFormat('es-CO', { dateStyle: 'long', timeStyle: 'short' });

const NOMBRE_ROL = {
  ADMIN: 'Administración',
  PERSONAL: 'Personal del archivo',
  PUBLICO: 'Pública',
};

/** Lo que el sistema sabe de quien tiene sesión y la opción de borrarlo (HU-04, Ley 1581). */
export function PaginaMiCuenta() {
  const { salir } = useAuth();
  const navegar = useNavigate();
  const [confirmando, setConfirmando] = useState(false);
  const cuenta = useQuery({ queryKey: ['auth', 'cuenta'], queryFn: () => authApi.cuenta() });
  const eliminar = useMutation({
    mutationFn: () => authApi.eliminarCuenta(),
    onSuccess: async () => {
      // primero se sale de la ruta protegida; si no, al cerrar la sesión manda a /ingresar
      navegar('/', { replace: true, state: { cuentaEliminada: true } });
      await salir();
    },
  });

  const cerrarSesion = async () => {
    navegar('/', { replace: true });
    await salir();
  };

  if (cuenta.isPending) {
    return (
      <Box role="status" sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress aria-label="Cargando tu cuenta" />
      </Box>
    );
  }
  if (cuenta.isError) {
    return <MensajeError error={cuenta.error} titulo="No se pudo abrir tu cuenta" />;
  }

  const datos = cuenta.data;
  const filas: [string, string][] = [
    ['Nombre', datos.nombre],
    ['Correo', datos.correo],
    ['Cuenta', NOMBRE_ROL[datos.rol]],
    ['Creada', fecha.format(new Date(datos.creadoEn))],
    [
      'Aviso',
      datos.consentimientoEn
        ? `Aceptado el ${fecha.format(new Date(datos.consentimientoEn))}` +
          (datos.versionPrivacidad ? ` (versión ${datos.versionPrivacidad})` : '')
        : 'Cuenta interna, sin aviso aceptado',
    ],
  ];

  return (
    <Box
      sx={{
        mx: 'auto',
        maxWidth: 760,
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
      }}
    >
      <Box>
        <Typography variant="h1" sx={{ m: 0, fontSize: { xs: 34, md: 46 } }}>
          Mi cuenta
        </Typography>
        <Typography sx={{ mt: 1, fontSize: 17 }}>
          Esto es todo lo que el archivo guarda sobre ti. Tu contraseña está cifrada y no se
          muestra.
        </Typography>
      </Box>

      <Box
        component="section"
        aria-labelledby="titulo-datos"
        sx={{
          p: { xs: 2.5, md: 3.5 },
          bgcolor: colores.papel,
          borderTop: `6px solid ${colores.naranja}`,
          boxShadow: '6px 8px 0 #F5D79E',
        }}
      >
        <Typography
          id="titulo-datos"
          component="h2"
          sx={{ fontFamily: MONO, fontWeight: 700, fontSize: 14, mb: 1 }}
        >
          TUS DATOS
        </Typography>
        <Box component="dl" sx={{ m: 0 }}>
          {filas.map(([etiqueta, valor]) => (
            <Box
              key={etiqueta}
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '120px 1fr' },
                gap: { xs: 0.25, sm: 2 },
                py: 1.25,
                borderBottom: '1px solid #D8C9A8',
              }}
            >
              <Box
                component="dt"
                sx={{ fontFamily: MONO, fontWeight: 700, fontSize: 14, color: colores.naranja }}
              >
                {etiqueta}
              </Box>
              <Box component="dd" sx={{ m: 0, fontWeight: 700, overflowWrap: 'anywhere' }}>
                {valor}
              </Box>
            </Box>
          ))}
        </Box>
        <Typography sx={{ mt: 2 }}>
          Lee el{' '}
          <Link component={RouterLink} to="/privacidad" sx={{ fontWeight: 700 }}>
            aviso de privacidad
          </Link>{' '}
          para saber para qué usamos estos datos.
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
        <Button
          variant="outlined"
          startIcon={<LogoutIcon />}
          onClick={cerrarSesion}
          sx={{ borderRadius: 999, borderWidth: 2, fontWeight: 800, '&:hover': { borderWidth: 2 } }}
        >
          Cerrar sesión
        </Button>
      </Box>

      <Box
        component="section"
        aria-labelledby="titulo-eliminar"
        sx={{
          p: { xs: 2.5, md: 3 },
          borderRadius: 4,
          border: '2px dashed #A8320F',
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { sm: 'center' },
          gap: 2,
        }}
      >
        <Box sx={{ flex: 1 }}>
          <Typography id="titulo-eliminar" component="h2" variant="h3" sx={{ fontWeight: 800 }}>
            Eliminar mi cuenta
          </Typography>
          <Typography sx={{ mt: 0.5, color: 'text.secondary' }}>
            Se borran tus datos y se cierran tus sesiones en todos los dispositivos. No se puede
            deshacer.
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="secondary"
          startIcon={<DeleteForeverIcon />}
          onClick={() => setConfirmando(true)}
          sx={{ flex: 'none', borderRadius: 999, fontWeight: 800 }}
        >
          Eliminar cuenta
        </Button>
      </Box>

      <Dialog
        open={confirmando}
        onClose={() => !eliminar.isPending && setConfirmando(false)}
        aria-labelledby="titulo-confirmar-eliminar"
        aria-describedby="detalle-confirmar-eliminar"
        PaperProps={{ sx: { borderRadius: 5, bgcolor: colores.papel, maxWidth: 440 } }}
      >
        <DialogTitle
          id="titulo-confirmar-eliminar"
          sx={{ fontFamily: 'h1.fontFamily', fontWeight: 900, fontSize: 26 }}
        >
          ¿Eliminar tu cuenta?
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography id="detalle-confirmar-eliminar">
            Borraremos la cuenta de <strong>{datos.correo}</strong>. Ya no podrás iniciar sesión con
            ella; si vuelves, tendrás que crear una nueva.
          </Typography>
          {eliminar.isError && (
            <MensajeError error={eliminar.error} titulo="No se pudo eliminar la cuenta" />
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button
            onClick={() => setConfirmando(false)}
            disabled={eliminar.isPending}
            sx={{ borderRadius: 999, fontWeight: 700 }}
          >
            Conservar mi cuenta
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => eliminar.mutate()}
            disabled={eliminar.isPending}
            sx={{ borderRadius: 999, fontWeight: 800 }}
          >
            {eliminar.isPending ? 'Eliminando…' : 'Sí, eliminarla'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
