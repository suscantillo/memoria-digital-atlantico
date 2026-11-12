import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { keyframes } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useEffect, useLayoutEffect, useRef, useState, type MouseEvent } from 'react';
import { useLocation } from 'react-router-dom';
import { colores } from '../../../app/tema';
import { HeroAduana, type Mouse } from '../componentes/HeroAduana';
import { DURACION_TELON, TelonEntrada } from '../componentes/TelonEntrada';

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

const irrumpir = keyframes`
  from { translate: -110vw 0; }
  to { translate: 0 0; }
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

/** Ancho de la portada en el diseño; por debajo se encoge entera en vez de reacomodarse. */
const ANCHO_DISENO = 1152;
/** Por debajo de este ancho el texto encogido ya no se leería: se apila como en el diseño móvil. */
const ANCHO_APILADO = 700;
const CLAVE_TELON = 'mda.telon-visto';

function telonYaVisto() {
  try {
    return sessionStorage.getItem(CLAVE_TELON) !== null;
  } catch {
    return false;
  }
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
  const [mouse, setMouse] = useState<Mouse>({ x: 0, y: 0 });
  // noSsr: hay que saberlo en el primer render, antes de decidir si se muestra el telón
  const menosMovimiento = useMediaQuery('(prefers-reduced-motion: reduce)', { noSsr: true });
  const animar = !menosMovimiento;
  // el telón solo en la primera visita de la sesión: verlo cada vez que se vuelve a Inicio cansa
  const [conTelon] = useState(() => animar && !telonYaVisto());
  const inicio = conTelon ? DURACION_TELON : 0;

  const refPortada = useRef<HTMLDivElement>(null);
  const [ancho, setAncho] = useState(ANCHO_DISENO);
  const apilado = ancho < ANCHO_APILADO;
  const escala = apilado ? 1 : Math.min(1, ancho / ANCHO_DISENO);

  useLayoutEffect(() => {
    const el = refPortada.current;
    if (!el) return;
    setAncho(el.getBoundingClientRect().width);
    const observador = new ResizeObserver(([e]) => e && setAncho(e.contentRect.width));
    observador.observe(el);
    return () => observador.disconnect();
  }, []);

  useEffect(() => {
    if (!conTelon) return;
    try {
      sessionStorage.setItem(CLAVE_TELON, '1');
    } catch {
      // sin almacenamiento el telón sale en cada visita; no es grave
    }
  }, [conTelon]);

  const aparecer = (retraso: number) =>
    animar ? { animation: `${entrar} .9s ${curvaSuave} ${inicio + retraso}s both` } : {};

  const moverMouse = (evento: MouseEvent<HTMLElement>) => {
    if (menosMovimiento) return;
    const r = evento.currentTarget.getBoundingClientRect();
    setMouse({
      x: (evento.clientX - r.left) / r.width - 0.5,
      y: (evento.clientY - r.top) / r.height - 0.5,
    });
  };

  return (
    <Stack spacing={{ xs: 3.5, md: 5 }}>
      {conTelon && <TelonEntrada />}

      {state?.sinPermiso && (
        <Alert severity="warning" role="alert">
          Tu cuenta no tiene permiso para entrar al panel.
        </Alert>
      )}

      <Box ref={refPortada}>
        <Box
          component="section"
          aria-labelledby="titulo-portada"
          onMouseMove={moverMouse}
          onMouseLeave={() => setMouse({ x: 0, y: 0 })}
          sx={{
            position: 'relative',
            // se arma al ancho del diseño y zoom la encoge entera, como una imagen
            width: apilado ? '100%' : ANCHO_DISENO,
            zoom: escala,
            display: 'grid',
            gridTemplateColumns: apilado ? '1fr' : 'minmax(0, 1fr) minmax(0, 1.1fr)',
            alignItems: 'center',
            gap: apilado ? 2.75 : 3,
            pb: apilado ? 0 : 4,
          }}
        >
          {!apilado && (
            <Box
              aria-hidden
              sx={{ position: 'absolute', left: -120, top: -20 }}
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
          )}

          <Box
            sx={{
              position: 'relative',
              zIndex: 2,
              minWidth: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: apilado ? 1.75 : 'clamp(12px, 2.4vh, 22px)',
            }}
          >
            <Box
              component="span"
              sx={{
                alignSelf: 'flex-start',
                px: apilado ? 1.75 : 2.5,
                py: apilado ? 0.9 : 1.25,
                borderRadius: 999,
                bgcolor: colores.naranja,
                color: '#FFFFFF',
                fontFamily: 'h1.fontFamily',
                fontWeight: 800,
                fontSize: apilado ? 13 : 17,
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
                // en pantallas bajas se limita por la altura para que la portada quepa
                fontSize: apilado ? 'clamp(48px, 16vw, 72px)' : 'clamp(64px, 12vh, 108px)',
                lineHeight: 0.88,
                letterSpacing: '-0.035em',
                textTransform: 'uppercase',
              }}
            >
              <Palabra texto="Ahora" retraso={inicio + 0.15} />
              <br />
              <Box
                component="span"
                sx={{ position: 'relative', zIndex: 0, display: 'inline-block' }}
              >
                <Palabra texto="digital" retraso={inicio + 0.32} />
                <Box
                  component="span"
                  aria-hidden
                  sx={{
                    position: 'absolute',
                    left: '-2%',
                    right: '-4%',
                    bottom: 2,
                    height: apilado ? 14 : 22,
                    bgcolor: colores.amarillo,
                    zIndex: -1,
                    transformOrigin: 'left',
                    borderRadius: '4px 14px 6px 12px',
                    animation: `${trazar} .8s ${curvaSuave} ${inicio + 0.7}s both`,
                  }}
                />
              </Box>
            </Typography>
            <Typography
              sx={{
                maxWidth: 460,
                fontSize: apilado ? 17 : 'clamp(17px, 2.5vh, 21px)',
                lineHeight: 1.45,
                fontWeight: 500,
                ...aparecer(0.24),
              }}
            >
              Documentos, fotografías y periódicos de nuestra historia, sin sacarlos de su caja.
            </Typography>
          </Box>

          {/* en el celular la imagen va primero, como en el diseño móvil */}
          <Box sx={{ position: 'relative', minWidth: 0, order: apilado ? -1 : 0 }}>
            <HeroAduana mouse={mouse} compacto={apilado} inicio={inicio} animar={animar} />
          </Box>
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
          ...(animar && { animation: `${irrumpir} .8s ${curvaSuave} ${inicio + 0.9}s both` }),
        }}
      >
        <Box
          sx={{
            display: 'flex',
            width: 'max-content',
            py: { xs: 1.25, sm: 2 },
            fontFamily: 'h1.fontFamily',
            fontWeight: 900,
            fontSize: { xs: 20, sm: 30 },
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
    </Stack>
  );
}
