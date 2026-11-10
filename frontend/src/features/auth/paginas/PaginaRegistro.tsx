import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { AxiosError } from 'axios';
import { useState, type FormEvent } from 'react';
import { Navigate, Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { colores } from '../../../app/tema';
import { useAuth } from '../../../shared/auth/useAuth';
import { MensajeError } from '../../../shared/componentes/MensajeError';
import { authApi } from '../api';
import { VERSION_PRIVACIDAD } from '../privacidad';

const MIN_CONTRASENA = 8;
const CORREO_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const VENTAJAS = [
  'Lee los documentos completos, página por página.',
  'Descárgalos en PDF o PNG.',
  'Elimina tu cuenta cuando quieras desde Mi cuenta.',
];

interface Errores {
  nombre?: string;
  correo?: string;
  contrasena?: string;
  consentimiento?: string;
}

export function PaginaRegistro() {
  const { usuario, ingresar } = useAuth();
  const navegar = useNavigate();
  const { state } = useLocation() as { state?: { desde?: string } };
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [verContrasena, setVerContrasena] = useState(false);
  const [acepta, setAcepta] = useState(false);
  const [errores, setErrores] = useState<Errores>({});
  const [errorApi, setErrorApi] = useState<unknown>(null);
  const [enviando, setEnviando] = useState(false);

  if (usuario && !enviando) return <Navigate to={state?.desde ?? '/'} replace />;

  const validar = (): Errores => {
    const encontrados: Errores = {};
    if (!nombre.trim()) encontrados.nombre = 'Escribe tu nombre.';
    if (!CORREO_VALIDO.test(correo.trim())) encontrados.correo = 'Escribe un correo válido.';
    if (contrasena.length < MIN_CONTRASENA) {
      encontrados.contrasena = `Usa al menos ${MIN_CONTRASENA} caracteres.`;
    }
    if (!acepta) {
      encontrados.consentimiento = 'Para crear la cuenta debes aceptar el aviso de privacidad.';
    }
    return encontrados;
  };

  const enviar = async (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    const encontrados = validar();
    setErrores(encontrados);
    setErrorApi(null);
    if (Object.keys(encontrados).length > 0) {
      document.getElementById(`registro-${Object.keys(encontrados)[0]}`)?.focus();
      return;
    }
    setEnviando(true);
    try {
      const credenciales = { correo: correo.trim(), contrasena };
      await authApi.registro({
        ...credenciales,
        nombre: nombre.trim(),
        aceptaPrivacidad: true,
        versionPrivacidad: VERSION_PRIVACIDAD,
      });
      await ingresar(credenciales);
      navegar(state?.desde ?? '/', { replace: true });
    } catch (e) {
      if (e instanceof AxiosError && e.response?.status === 409) {
        setErrores({ correo: 'Ya hay una cuenta con este correo.' });
        document.getElementById('registro-correo')?.focus();
      } else {
        setErrorApi(e);
      }
      setEnviando(false);
    }
  };

  return (
    <Box
      component="section"
      aria-labelledby="titulo-registro"
      sx={{
        mx: 'auto',
        width: '100%',
        maxWidth: 940,
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: '5fr 6fr' },
        overflow: 'hidden',
        borderRadius: 6,
        bgcolor: 'background.paper',
        boxShadow: '0 8px 0 #F5D79E',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: { xs: 2, md: 4 },
          p: { xs: 3, md: 5 },
          bgcolor: colores.azulMarino,
          color: '#DDE3EE',
        }}
      >
        <Typography
          component="p"
          sx={{
            fontFamily: 'h1.fontFamily',
            fontWeight: 900,
            fontSize: { xs: '1.9rem', md: '2.4rem' },
            lineHeight: 0.95,
            textTransform: 'uppercase',
            color: '#FFFFFF',
          }}
        >
          Abre las cajas
          <Box component="span" sx={{ display: 'block', color: colores.amarillo }}>
            del archivo
          </Box>
        </Typography>
        <Stack component="ul" spacing={1.25} sx={{ listStyle: 'none', m: 0, p: 0 }}>
          {VENTAJAS.map((ventaja) => (
            <Box component="li" key={ventaja} sx={{ display: 'flex', gap: 1.25 }}>
              <CheckCircleIcon aria-hidden sx={{ color: colores.amarillo, fontSize: 22 }} />
              {ventaja}
            </Box>
          ))}
        </Stack>
      </Box>

      <Box sx={{ p: { xs: 3, sm: 5 } }}>
        <Typography id="titulo-registro" variant="h1" gutterBottom>
          Crear cuenta
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          ¿Ya tienes una?{' '}
          <Link component={RouterLink} to="/ingresar" state={state} sx={{ fontWeight: 700 }}>
            Inicia sesión
          </Link>
        </Typography>

        <Box component="form" onSubmit={enviar} noValidate>
          <Stack spacing={2}>
            <TextField
              id="registro-nombre"
              label="Nombre"
              autoComplete="name"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              error={Boolean(errores.nombre)}
              helperText={errores.nombre}
              required
              fullWidth
            />
            <TextField
              id="registro-correo"
              label="Correo"
              type="email"
              autoComplete="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              error={Boolean(errores.correo)}
              helperText={
                errores.correo && (
                  <>
                    {errores.correo}{' '}
                    {errores.correo.startsWith('Ya hay') && (
                      <Link component={RouterLink} to="/ingresar" state={state}>
                        Inicia sesión
                      </Link>
                    )}
                  </>
                )
              }
              required
              fullWidth
            />
            <TextField
              id="registro-contrasena"
              label="Contraseña"
              type={verContrasena ? 'text' : 'password'}
              autoComplete="new-password"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              error={Boolean(errores.contrasena)}
              helperText={errores.contrasena ?? `Mínimo ${MIN_CONTRASENA} caracteres.`}
              required
              fullWidth
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label={
                          verContrasena ? 'Ocultar la contraseña' : 'Mostrar la contraseña'
                        }
                        onClick={() => setVerContrasena((v) => !v)}
                        edge="end"
                      >
                        {verContrasena ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />

            <Box
              sx={{
                p: 1.5,
                pr: 2,
                borderRadius: 3,
                bgcolor: colores.crema,
                border: `2px solid ${errores.consentimiento ? '#A8320F' : 'transparent'}`,
              }}
            >
              <FormControlLabel
                sx={{ alignItems: 'flex-start', m: 0 }}
                control={
                  <Checkbox
                    id="registro-consentimiento"
                    checked={acepta}
                    onChange={(e) => setAcepta(e.target.checked)}
                    inputProps={{
                      'aria-describedby': errores.consentimiento
                        ? 'error-consentimiento'
                        : undefined,
                    }}
                    sx={{ mt: -0.75 }}
                  />
                }
                label={
                  <>
                    He leído y acepto el{' '}
                    {/* en otra pestaña, para no perder lo ya escrito en el formulario */}
                    <Link
                      href="/privacidad"
                      target="_blank"
                      rel="noopener"
                      sx={{ fontWeight: 700 }}
                    >
                      aviso de privacidad
                    </Link>{' '}
                    y autorizo el tratamiento de mis datos para usar el archivo.
                  </>
                }
              />
              {errores.consentimiento && (
                <FormHelperText id="error-consentimiento" error sx={{ ml: 4.5, fontSize: 14 }}>
                  {errores.consentimiento}
                </FormHelperText>
              )}
            </Box>

            <Box aria-live="assertive">
              {errorApi !== null && <MensajeError error={errorApi} titulo="No se creó la cuenta" />}
            </Box>
            <Button
              type="submit"
              variant="contained"
              color="secondary"
              size="large"
              disabled={enviando}
              sx={{ borderRadius: 999, py: 1.5, boxShadow: '0 5px 0 #8F2A0C' }}
            >
              {enviando ? 'Creando la cuenta…' : 'Crear cuenta'}
            </Button>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}
