import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { colores } from '../../../app/tema';
import { useAuth } from '../../../shared/auth/useAuth';
import { MensajeError } from '../../../shared/componentes/MensajeError';
import { DialogoEliminarCuenta } from '../componentes/DialogoEliminarCuenta';
import { useMiCuenta } from '../hooks';

const formatoFecha = new Intl.DateTimeFormat('es-CO', { dateStyle: 'long', timeStyle: 'short' });

function Dato({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <Box component="div" sx={{ py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
      <Typography component="dt" variant="body2" color="text.secondary" sx={{ fontWeight: 700 }}>
        {etiqueta}
      </Typography>
      <Typography component="dd" sx={{ m: 0, overflowWrap: 'anywhere' }}>
        {valor}
      </Typography>
    </Box>
  );
}

export function PaginaMiCuenta() {
  const { salir } = useAuth();
  const navegar = useNavigate();
  const cuenta = useMiCuenta();
  const [confirmando, setConfirmando] = useState(false);

  const alEliminar = async () => {
    // la sesión ya no existe en el servidor: solo queda limpiarla en este navegador
    await salir();
    navegar('/', { replace: true, state: { cuentaEliminada: true } });
  };

  return (
    <Box
      component="section"
      aria-labelledby="titulo-mi-cuenta"
      sx={{
        mx: 'auto',
        width: '100%',
        maxWidth: 640,
        p: { xs: 3, sm: 5 },
        borderRadius: 6,
        bgcolor: 'background.paper',
        boxShadow: '0 8px 0 #F5D79E',
      }}
    >
      <Typography id="titulo-mi-cuenta" variant="h1" gutterBottom>
        Mi cuenta
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Estos son todos los datos que el archivo guarda sobre ti. Tu contraseña se guarda cifrada y
        nadie puede verla.
      </Typography>

      {cuenta.isPending && (
        <Box role="status" sx={{ display: 'grid', placeItems: 'center', py: 4 }}>
          <CircularProgress aria-label="Cargando tus datos" />
        </Box>
      )}
      {cuenta.isError && <MensajeError error={cuenta.error} />}

      {cuenta.data && (
        <Stack spacing={4}>
          <Box component="dl" sx={{ m: 0 }}>
            <Dato etiqueta="Nombre" valor={cuenta.data.nombre} />
            <Dato etiqueta="Correo" valor={cuenta.data.correo} />
            <Dato
              etiqueta="Aceptaste el aviso de privacidad"
              valor={
                cuenta.data.consentimientoEn
                  ? `${formatoFecha.format(new Date(cuenta.data.consentimientoEn))} (versión ${cuenta.data.versionPrivacidad ?? '—'})`
                  : 'No aplica: las cuentas del personal no pasan por el aviso.'
              }
            />
            <Dato
              etiqueta="Cuenta creada"
              valor={formatoFecha.format(new Date(cuenta.data.creadoEn))}
            />
          </Box>

          <Typography>
            Lee el{' '}
            <Link component={RouterLink} to="/privacidad" sx={{ fontWeight: 700 }}>
              aviso de privacidad
            </Link>{' '}
            para saber cómo se usan tus datos y cuáles son tus derechos según la Ley 1581 de 2012.
          </Typography>

          {cuenta.data.puedeEliminarla ? (
            <Box
              sx={{
                p: 3,
                borderRadius: 4,
                border: `2px solid ${colores.naranja}`,
              }}
            >
              <Typography variant="h2" sx={{ fontSize: '1.3rem', mb: 1 }}>
                Eliminar mi cuenta
              </Typography>
              <Typography sx={{ mb: 2 }}>
                Borra tus datos del archivo y cierra tus sesiones. No se puede deshacer.
              </Typography>
              <Button
                variant="outlined"
                color="error"
                onClick={() => setConfirmando(true)}
                sx={{ borderRadius: 999 }}
              >
                Eliminar mi cuenta
              </Button>
            </Box>
          ) : (
            <Alert severity="info">
              Las cuentas del personal no se eliminan desde aquí: las desactiva el administrador.
            </Alert>
          )}
        </Stack>
      )}

      <DialogoEliminarCuenta
        abierto={confirmando}
        onCerrar={() => setConfirmando(false)}
        onEliminada={() => void alEliminar()}
      />
    </Box>
  );
}
