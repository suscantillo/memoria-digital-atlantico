import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useState, type FormEvent } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../shared/auth/useAuth';
import { MensajeError } from '../../../shared/componentes/MensajeError';

export function PaginaIngresar() {
  const { usuario, ingresar } = useAuth();
  const navegar = useNavigate();
  const { state } = useLocation() as { state?: { desde?: string } };
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<unknown>(null);

  if (usuario) {
    const destino = usuario.rol === 'PUBLICO' ? '/' : (state?.desde ?? '/panel');
    return <Navigate to={destino} replace />;
  }

  const enviar = async (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    setEnviando(true);
    setError(null);
    try {
      const ingresado = await ingresar({ correo: correo.trim(), contrasena });
      navegar(ingresado.rol === 'PUBLICO' ? '/' : (state?.desde ?? '/panel'), { replace: true });
    } catch (e) {
      setError(e);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Box sx={{ display: 'grid', placeItems: 'center' }}>
      <Paper
        component="section"
        aria-labelledby="titulo-ingresar"
        sx={{ p: 4, width: '100%', maxWidth: 420 }}
      >
        <Typography id="titulo-ingresar" variant="h1" gutterBottom>
          Ingresar
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Acceso para el personal del archivo.
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
            <Button type="submit" variant="contained" size="large" disabled={enviando}>
              {enviando ? 'Ingresando…' : 'Ingresar'}
            </Button>
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
}
