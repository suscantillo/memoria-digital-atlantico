import SearchIcon from '@mui/icons-material/Search';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import InputBase from '@mui/material/InputBase';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import { keyframes } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useState, type FormEvent, type MouseEvent } from 'react';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { colores } from '../../../app/tema';
import { MensajeError } from '../../../shared/componentes/MensajeError';
import { useUbicaciones } from '../../ubicaciones/hooks';
import { HeroAduana, type Mouse } from '../componentes/HeroAduana';

const entrar = keyframes`
  from { opacity: 0; transform: translateY(32px); }
  to { opacity: 1; transform: none; }
`;

const subir = keyframes`
  from { transform: translateY(105%); }
  to { transform: none; }
`;

const trazar = keyframes`
  from { transform: scaleX(0); }
  to { transform: scaleX(1); }
`;

const mecer = keyframes`
  0%, 100% { transform: rotate(-4deg); }
  50% { transform: rotate(5deg); }
`;

const correrCinta = keyframes`
  to { transform: translateX(-50%); }
`;

const PALABRAS_CINTA = [
  'Carnaval',
  'Puerto',
  'Aduana 1919',
  'Periódicos',
  'Fotografías',
  'Cartas',
  'Censos',
  'Planos',
];

const curvaSuave = 'cubic-bezier(.2, .8, .2, 1)';

function aparecer(retraso: number) {
  return { animation: `${entrar} .9s ${curvaSuave} ${retraso}s both` };
}

function Palabra({ texto, retraso }: { texto: string; retraso: number }) {
  return (
    <Box component="span" sx={{ display: 'inline-block', overflow: 'hidden', pb: '0.06em' }}>
      <Box
        component="span"
        sx={{ display: 'inline-block', animation: `${subir} .9s ${curvaSuave} ${retraso}s both` }}
      >
        {texto}
      </Box>
    </Box>
  );
}

export function PaginaInicio() {
  const { state } = useLocation() as { state?: { sinPermiso?: boolean } };
  const navegar = useNavigate();
  const consulta = useUbicaciones({ pagina: 1, limite: 20, orden: 'deposito', direccion: 'asc' });
  const [busqueda, setBusqueda] = useState('');
  const [mouse, setMouse] = useState<Mouse>({ x: 0, y: 0 });
  const menosMovimiento = useMediaQuery('(prefers-reduced-motion: reduce)');

  const moverMouse = (evento: MouseEvent<HTMLElement>) => {
    if (menosMovimiento) return;
    const r = evento.currentTarget.getBoundingClientRect();
    setMouse({
      x: (evento.clientX - r.left) / r.width - 0.5,
      y: (evento.clientY - r.top) / r.height - 0.5,
    });
  };

  const buscar = (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    const q = busqueda.trim();
    navegar(q ? `/explorar?q=${encodeURIComponent(q)}` : '/explorar');
  };

  return (
    <Stack spacing={5}>
      {state?.sinPermiso && (
        <Alert severity="warning" role="alert">
          Tu cuenta no tiene permiso para entrar al panel.
        </Alert>
      )}

      <Box
        component="section"
        aria-labelledby="titulo-portada"
        onMouseMove={moverMouse}
        onMouseLeave={() => setMouse({ x: 0, y: 0 })}
        sx={{
          position: 'relative',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: 4,
          pb: { xs: 3, md: 6 },
        }}
      >
        <Box
          aria-hidden
          sx={{ position: 'absolute', left: -120, top: -20, display: { xs: 'none', md: 'block' } }}
          style={{
            transform: `translate(${mouse.x * 18}px, ${mouse.y * 12}px)`,
            transition: 'transform .25s ease-out',
          }}
        >
          <Box
            component="svg"
            width={220}
            height={260}
            viewBox="0 0 220 260"
            sx={{ animation: `${mecer} 5s ease-in-out infinite`, transformOrigin: '95% 95%' }}
          >
            <path
              d="M200 250 120 40 60 10l40 60-90-20 90 60L0 140l110-10-60 80 90-50z"
              fill="#00A6B8"
            />
            <path
              d="M200 250 140 90 90 60l30 50-70 0 80 40z"
              fill={colores.azulMarino}
              opacity=".55"
            />
          </Box>
        </Box>

        <Box
          sx={{
            position: 'relative',
            zIndex: 2,
            flex: '1 1 440px',
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: 2.75,
          }}
        >
          <Box
            component="span"
            sx={{
              alignSelf: 'flex-start',
              px: 2.5,
              py: 1.25,
              borderRadius: 999,
              bgcolor: colores.naranja,
              color: '#FFFFFF',
              fontFamily: 'h1.fontFamily',
              fontWeight: 800,
              fontSize: { xs: 14, sm: 17 },
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              rotate: '-2deg',
              ...aparecer(0),
            }}
          >
            La memoria del Atlántico,
          </Box>
          <Typography
            id="titulo-portada"
            variant="h1"
            sx={{
              m: 0,
              fontWeight: 900,
              fontSize: 'clamp(56px, 8vw, 112px)',
              lineHeight: 0.88,
              letterSpacing: '-0.035em',
              textTransform: 'uppercase',
            }}
          >
            <Palabra texto="Ahora" retraso={0.15} />
            <br />
            <Box component="span" sx={{ position: 'relative', zIndex: 0, display: 'inline-block' }}>
              <Palabra texto="digital" retraso={0.32} />
              <Box
                component="span"
                aria-hidden
                sx={{
                  position: 'absolute',
                  left: '-2%',
                  right: '-4%',
                  bottom: 2,
                  height: { xs: 14, md: 22 },
                  bgcolor: colores.amarillo,
                  zIndex: -1,
                  transformOrigin: 'left',
                  borderRadius: '4px 14px 6px 12px',
                  animation: `${trazar} .8s ${curvaSuave} .7s both`,
                }}
              />
            </Box>
          </Typography>
          <Typography
            sx={{
              maxWidth: 460,
              fontSize: { xs: 18, sm: 21 },
              lineHeight: 1.45,
              fontWeight: 500,
              ...aparecer(0.24),
            }}
          >
            Documentos, fotografías y periódicos de nuestra historia, sin sacarlos de su caja.
          </Typography>
          <Box
            component="form"
            role="search"
            onSubmit={buscar}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              maxWidth: 520,
              bgcolor: '#FFFFFF',
              borderRadius: 999,
              p: '6px 6px 6px 20px',
              boxShadow: '0 8px 0 #F5D79E',
              ...aparecer(0.36),
            }}
          >
            <SearchIcon aria-hidden sx={{ color: colores.azulMarino }} />
            <InputBase
              type="search"
              placeholder="Buscar en el archivo…"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              inputProps={{ 'aria-label': 'Buscar en el archivo' }}
              sx={{ flex: 1, minWidth: 0, height: 52, fontSize: { xs: 16, sm: 19 } }}
            />
            <Button
              type="submit"
              color="secondary"
              variant="contained"
              sx={{
                height: 52,
                px: 3.25,
                borderRadius: 999,
                fontSize: 18,
                transition: 'transform .25s, box-shadow .25s',
                '&:hover': {
                  transform: 'translateY(-3px)',
                  boxShadow: `0 6px 0 ${colores.azulMarino}`,
                },
              }}
            >
              Buscar →
            </Button>
          </Box>
          <Link
            component={RouterLink}
            to="/explorar"
            sx={{
              alignSelf: 'flex-start',
              fontSize: 18,
              fontWeight: 700,
              color: colores.azulMarino,
              ...aparecer(0.48),
            }}
          >
            o recorre todo el archivo →
          </Link>
        </Box>

        <Box sx={{ position: 'relative', flex: '1 1 560px', minWidth: 0 }}>
          <HeroAduana mouse={mouse} />
        </Box>
      </Box>

      <Box
        aria-hidden
        sx={{
          position: 'relative',
          zIndex: 3,
          width: '100vw',
          // Stack anula los márgenes de sus hijos; con left la cinta cruza toda la pantalla
          left: 'calc(50% - 50vw)',
          bgcolor: colores.amarillo,
          rotate: '-2deg',
          overflow: 'hidden',
          borderTop: `4px solid ${colores.azulMarino}`,
          borderBottom: `4px solid ${colores.azulMarino}`,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            width: 'max-content',
            py: 2,
            fontFamily: 'h1.fontFamily',
            fontWeight: 900,
            fontSize: { xs: 22, sm: 30 },
            letterSpacing: '0.02em',
            textTransform: 'uppercase',
            color: colores.azulMarino,
            whiteSpace: 'nowrap',
            animation: `${correrCinta} 28s linear infinite`,
          }}
        >
          {[...PALABRAS_CINTA, ...PALABRAS_CINTA].map((palabra, i) => (
            <span key={i}>
              <Box component="span" sx={{ px: 2.75 }}>
                {palabra}
              </Box>
              <Box component="span" sx={{ color: colores.naranja }}>
                ✦
              </Box>
            </span>
          ))}
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
                  transition: `transform .4s ${curvaSuave}`,
                  '&:hover': { transform: 'rotate(0) translateY(-6px)' },
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
