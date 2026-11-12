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
import { keyframes } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { AxiosError } from 'axios';
import { useState, type FormEvent } from 'react';
import { Navigate, Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { colores } from '../../../app/tema';
import { useAuth } from '../../../shared/auth/useAuth';
import { MensajeError } from '../../../shared/componentes/MensajeError';
import { authApi } from '../api';
import { CarneArchivo } from '../componentes/CarneArchivo';
import { VERSION_PRIVACIDAD } from '../privacidad';

const MIN_CONTRASENA = 8;
const CORREO_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const entrar = keyframes`
  from { opacity: 0; transform: translateY(24px); }
  to { opacity: 1; transform: none; }
`;

const PASOS = ['Crea tu carné', 'Abre el archivo'];

const estiloCampo = {
  '& .MuiOutlinedInput-root': { borderRadius: '14px', bgcolor: '#FFFFFF' },
  '& .MuiOutlinedInput-notchedOutline': { borderWidth: 2, borderColor: '#D9CBA8' },
} as const;

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
        maxWidth: 1180,
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1fr) minmax(0, 1fr)' },
        gap: { xs: 2, md: 5 },
        alignItems: 'center',
      }}
    >
      <Box sx={{ display: { xs: 'none', md: 'block' } }}>
        <CarneArchivo nombre={nombre} correo={correo} acepta={acepta} />
      </Box>
      <Box sx={{ display: { xs: 'block', md: 'none' } }}>
        <CarneArchivo nombre={nombre} correo={correo} acepta={acepta} compacto />
      </Box>

      <Box
        sx={{
          position: 'relative',
          p: { xs: 3, sm: 5 },
          bgcolor: '#FFFFFF',
          borderRadius: '28px',
          borderTop: `8px solid ${colores.naranja}`,
          boxShadow: '0 10px 0 #F5D79E, 0 30px 60px rgba(14, 45, 107, .12)',
          animation: `${entrar} .7s cubic-bezier(.2, .8, .2, 1) both`,
          '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
        }}
      >
        <Box
          component="ol"
          aria-label="Pasos"
          sx={{ listStyle: 'none', m: 0, mb: 3, p: 0, display: 'flex', gap: 1.5, flexWrap: 'wrap' }}
        >
          {PASOS.map((paso, i) => (
            <Box
              component="li"
              key={paso}
              aria-current={i === 0 ? 'step' : undefined}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                pr: 1.5,
                borderRadius: 999,
                bgcolor: i === 0 ? '#FDE8E1' : colores.crema,
                fontSize: 14,
                fontWeight: i === 0 ? 800 : 600,
                color: i === 0 ? colores.azulMarino : 'text.secondary',
              }}
            >
              <Box
                component="span"
                sx={{
                  width: 30,
                  height: 30,
                  borderRadius: 999,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: i === 0 ? colores.naranja : '#FFFFFF',
                  color: i === 0 ? '#FFFFFF' : 'text.secondary',
                  border: i === 0 ? 0 : '2px solid #EBD9B0',
                  fontFamily: 'h1.fontFamily',
                  fontWeight: 900,
                }}
              >
                {i + 1}
              </Box>
              {paso}
            </Box>
          ))}
        </Box>

        <Typography
          component="p"
          sx={{
            fontFamily: '"Courier Prime", "Courier New", monospace',
            fontWeight: 700,
            letterSpacing: '.08em',
            color: colores.naranja,
            mb: 0.5,
          }}
        >
          GRATIS · SOLO NOMBRE Y CORREO
        </Typography>
        <Typography
          id="titulo-registro"
          variant="h1"
          sx={{ fontSize: { xs: 38, sm: 50 }, letterSpacing: '-0.03em', mb: 1 }}
        >
          Crea tu cuenta
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3, fontSize: 17 }}>
          ¿Ya tienes una?{' '}
          <Link component={RouterLink} to="/ingresar" state={state} sx={{ fontWeight: 700 }}>
            Inicia sesión
          </Link>
        </Typography>

        <Box component="form" onSubmit={enviar} noValidate>
          <Stack spacing={2.25}>
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
              sx={estiloCampo}
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
              sx={estiloCampo}
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
              sx={estiloCampo}
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
                borderRadius: '16px',
                bgcolor: acepta ? '#E3F4F5' : colores.crema,
                border: `2px ${errores.consentimiento ? 'solid #A8320F' : acepta ? `solid ${colores.turquesa}` : 'dashed #E2CFA3'}`,
                transition: 'background-color .25s, border-color .25s',
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
              sx={{
                borderRadius: 999,
                py: 1.6,
                fontSize: 18,
                boxShadow: '0 6px 0 #8F2A0C',
                transition: 'transform .15s, box-shadow .15s',
                '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 8px 0 #8F2A0C' },
                '&:active': { transform: 'translateY(4px)', boxShadow: '0 2px 0 #8F2A0C' },
              }}
            >
              {enviando ? 'Creando la cuenta…' : 'Crear cuenta'}
            </Button>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}
