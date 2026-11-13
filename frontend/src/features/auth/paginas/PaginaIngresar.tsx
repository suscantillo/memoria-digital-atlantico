import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useState, type FormEvent } from 'react';
import { Navigate, Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { colores } from '../../../app/tema';
import { useAuth } from '../../../shared/auth/useAuth';
import { Isotipo } from '../../../shared/componentes/Isotipo';
import { MensajeError } from '../../../shared/componentes/MensajeError';
import type { RolUsuario } from '../../../shared/tipos/usuario';

/** Vuelve a donde estaba la persona; una cuenta PUBLICO nunca termina en el panel. */
function destinoTrasIngresar(rol: RolUsuario, desde?: string): string {
  if (rol === 'PUBLICO') {
    return desde && !desde.startsWith('/panel') ? desde : '/';
  }
  return desde ?? '/panel';
}

export function PaginaIngresar() {
  const { usuario, ingresar } = useAuth();
  const navegar = useNavigate();
  const { state } = useLocation() as { state?: { desde?: string } };
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<unknown>(null);

  if (usuario) {
    return <Navigate to={destinoTrasIngresar(usuario.rol, state?.desde)} replace />;
  }

  const enviar = async (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    setEnviando(true);
    setError(null);
    try {
      const ingresado = await ingresar({ correo: correo.trim(), contrasena });
      navegar(destinoTrasIngresar(ingresado.rol, state?.desde), { replace: true });
    } catch (e) {
      setError(e);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Box
      component="section"
      aria-labelledby="titulo-ingresar"
      sx={{
        mx: 'auto',
        width: '100%',
        maxWidth: 880,
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
        overflow: 'hidden',
        borderRadius: 6,
        bgcolor: 'background.paper',
        boxShadow: '0 8px 0 #F5D79E',
      }}
    >
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: 4,
          p: 5,
          bgcolor: colores.azulMarino,
          color: '#DDE3EE',
        }}
      >
        <Isotipo color={colores.amarillo} tamano={72} />
        <Box>
          <Typography
            component="p"
            sx={{
              fontFamily: 'h1.fontFamily',
              fontWeight: 900,
              fontSize: '2.4rem',
              lineHeight: 0.95,
              textTransform: 'uppercase',
              color: '#FFFFFF',
              mb: 2,
            }}
          >
            Bienvenida
            <Box component="span" sx={{ display: 'block', color: colores.amarillo }}>
              al archivo
            </Box>
          </Typography>
          <Typography>
            El personal registra, digitaliza y revisa cada pieza. Con una cuenta pública consultas
            lo que requiere sesión.
          </Typography>
        </Box>
      </Box>

      <Box sx={{ p: { xs: 3, sm: 5 } }}>
        <Typography id="titulo-ingresar" variant="h1" gutterBottom>
          Iniciar sesión
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Entra con el correo y la contraseña de tu cuenta del archivo. ¿No tienes una?{' '}
          <Link component={RouterLink} to="/registro" state={state} sx={{ fontWeight: 700 }}>
            Crea tu cuenta
          </Link>
        </Typography>

        <Box component="form" onSubmit={enviar} noValidate>
          <Stack spacing={2}>
            <TextField
              id="correo"
              label="Correo"
              type="email"
              autoComplete="username"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              required
              fullWidth
            />
            <TextField
              id="contrasena"
              label="Contraseña"
              type="password"
              autoComplete="current-password"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              required
              fullWidth
            />
            <Box aria-live="assertive">{error !== null && <MensajeError error={error} />}</Box>
            <Button
              type="submit"
              variant="contained"
              color="secondary"
              size="large"
              disabled={enviando}
              sx={{ borderRadius: 999, py: 1.5, boxShadow: '0 5px 0 #8F2A0C' }}
            >
              {enviando ? 'Ingresando…' : 'Ingresar'}
            </Button>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}
