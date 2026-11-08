import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import { keyframes } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { useLocation } from 'react-router-dom';
import { colores } from '../../../app/tema';
import { MensajeError } from '../../../shared/componentes/MensajeError';
import { useUbicaciones } from '../../ubicaciones/hooks';
import { HeroAduana } from '../componentes/HeroAduana';

const entrar = keyframes`
  from { opacity: 0; transform: translateY(24px); }
  to { opacity: 1; transform: translateY(0); }
`;

const correrCinta = keyframes`
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
`;

const PALABRAS_CINTA = ['Documentos', 'Fotografías', 'Periódicos', 'Aduana 1919', 'Barranquilla'];

export function PaginaInicio() {
  const { state } = useLocation() as { state?: { sinPermiso?: boolean } };
  const consulta = useUbicaciones({ pagina: 1, limite: 20, orden: 'deposito', direccion: 'asc' });

  return (
    <Stack spacing={6}>
      {state?.sinPermiso && (
        <Alert severity="warning" role="alert">
          Tu cuenta no tiene permiso para entrar al panel.
        </Alert>
      )}

      <Box
        component="section"
        aria-labelledby="titulo-portada"
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1.1fr 1fr' },
          alignItems: 'center',
          gap: { xs: 3, md: 6 },
        }}
      >
        <Box>
          <Typography
            component="p"
            sx={{
              display: 'inline-block',
              mb: 2,
              px: 2,
              py: 0.75,
              borderRadius: 999,
              bgcolor: colores.naranja,
              color: '#FFFFFF',
              fontWeight: 800,
              fontSize: '0.8rem',
              letterSpacing: 1.5,
              animation: `${entrar} .6s ease-out both`,
            }}
          >
            LA MEMORIA DEL ATLÁNTICO
          </Typography>
          <Typography
            id="titulo-portada"
            variant="h1"
            sx={{
              fontSize: { xs: '3.2rem', sm: '4.5rem' },
              lineHeight: 0.92,
              textTransform: 'uppercase',
              letterSpacing: '-0.03em',
              mb: 2.5,
              '& span': { display: 'block', animation: `${entrar} .7s ease-out both` },
              '& span + span': { animationDelay: '.15s', color: colores.naranja },
            }}
          >
            <span>Ahora</span>
            <span>digital</span>
          </Typography>
          <Typography
            sx={{
              maxWidth: 460,
              fontSize: '1.2rem',
              animation: `${entrar} .7s .3s ease-out both`,
            }}
          >
            Documentos, fotografías y periódicos de nuestra historia, sin sacarlos de su caja.
          </Typography>
        </Box>
        <HeroAduana />
      </Box>

      <Box
        aria-hidden
        sx={{
          mx: { xs: -2, sm: -3 },
          py: 1.5,
          overflow: 'hidden',
          bgcolor: colores.azulMarino,
          color: colores.amarillo,
          transform: 'rotate(-1.5deg)',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            width: 'max-content',
            gap: 4,
            animation: `${correrCinta} 30s linear infinite`,
          }}
        >
          {[...PALABRAS_CINTA, ...PALABRAS_CINTA, ...PALABRAS_CINTA, ...PALABRAS_CINTA].map(
            (palabra, i) => (
              <Typography
                key={i}
                component="span"
                sx={{
                  fontFamily: 'h1.fontFamily',
                  fontWeight: 900,
                  textTransform: 'uppercase',
                  whiteSpace: 'nowrap',
                }}
              >
                {palabra} ✦
              </Typography>
            ),
          )}
        </Box>
      </Box>

      <Box component="section" aria-labelledby="titulo-ubicaciones">
        <Typography id="titulo-ubicaciones" variant="h2" gutterBottom>
          Depósitos del archivo
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Dónde se guardan las piezas. El buscador público llegará con la consulta de piezas.
        </Typography>

        {consulta.isPending && (
          <Box role="status" aria-live="polite">
            <CircularProgress aria-label="Cargando ubicaciones" />
          </Box>
        )}
        {consulta.isError && <MensajeError error={consulta.error} titulo="No se pudo cargar" />}
        {consulta.isSuccess && (
          <Box
            component="ul"
            sx={{
              listStyle: 'none',
              p: 0,
              m: 0,
              display: 'grid',
              gap: 3,
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            }}
          >
            {consulta.data.datos.map((u, i) => (
              <Box
                component="li"
                key={u.id}
                sx={{
                  p: 2.5,
                  bgcolor: 'background.paper',
                  borderRadius: 4,
                  boxShadow: '0 6px 0 #F5D79E',
                  transform: `rotate(${i % 2 ? 1 : -1}deg)`,
                  transition: 'transform .2s',
                  '&:hover': { transform: 'rotate(0) translateY(-4px)' },
                }}
              >
                <Typography variant="h3" component="h3" gutterBottom>
                  {u.deposito}
                </Typography>
                <Typography sx={{ fontFamily: 'monospace', color: colores.naranja }}>
                  {u.estanteria} · {u.caja}
                </Typography>
                {u.descripcion && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {u.descripcion}
                  </Typography>
                )}
              </Box>
            ))}
          </Box>
        )}
        {consulta.isSuccess && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 3 }}>
            {consulta.data.meta.total} ubicaciones registradas.
          </Typography>
        )}
      </Box>
    </Stack>
  );
}
