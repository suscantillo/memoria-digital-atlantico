import Box from '@mui/material/Box';
import { keyframes } from '@mui/material/styles';
import { useId } from 'react';
import { colores } from '../../../app/tema';
import imagenAduana from '../../../assets/aduana.webp';
import { Isotipo } from '../../../shared/componentes/Isotipo';
import { entrada } from './animaciones';

const flotar = keyframes`
  0%, 100% { translate: 0 0; }
  50% { translate: 0 -14px; }
`;

const acercar = keyframes`
  0%, 100% { transform: scale(1.04); }
  50% { transform: scale(1.14) translate(-2%, 1%); }
`;

const derivar = keyframes`
  from { transform: translateX(-30%); }
  to { transform: translateX(130%); }
`;

const girar = keyframes`
  to { transform: rotate(360deg); }
`;

const sombraPieza = '0 12px 24px rgba(14, 45, 107, 0.22)';

/** Posición del mouse respecto al centro del hero, de -0.5 a 0.5 en cada eje. */
export interface Mouse {
  x: number;
  y: number;
}

/** Cada capa se mueve distinto según su profundidad: así parecen papeles apilados. */
function capa(mouse: Mouse, fx: number, fy: number) {
  return {
    transform: `translate(${mouse.x * fx}px, ${mouse.y * fy}px)`,
    transition: 'transform .25s ease-out',
  };
}

interface PropsNube {
  ancho: number;
  arriba: number;
  duracion: number;
  retraso?: number;
  sombra?: boolean;
}

function Nube({ ancho, arriba, duracion, retraso = 0, sombra = false }: PropsNube) {
  return (
    <Box
      component="svg"
      viewBox="0 0 150 60"
      sx={{
        position: 'absolute',
        top: arriba,
        width: ancho,
        animation: `${derivar} ${duracion}s linear ${retraso}s infinite`,
      }}
    >
      <path d="M10 50h130l-14-18-20 4-10-24-30 8-14 14-24-2z" fill={colores.papel} />
      {sombra && <path d="M40 50h100l-14-18-20 4z" fill="#F5D79E" />}
    </Box>
  );
}

export function SelloGiratorio({ tamano = 128 }: { tamano?: number }) {
  // el sello aparece dos veces en la portada (telón y hero); cada trazado necesita su propio id
  const idCirculo = useId();
  return (
    <Box sx={{ position: 'relative', width: tamano, height: tamano }}>
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          bgcolor: colores.amarillo,
          boxShadow: `0 ${tamano / 13}px 0 rgba(14, 45, 107, 0.18)`,
        }}
      />
      <Box
        component="svg"
        viewBox="0 0 128 128"
        sx={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          animation: `${girar} 18s linear infinite`,
        }}
      >
        <defs>
          <path id={idCirculo} d="M64 64m-46 0a46 46 0 1 1 92 0a46 46 0 1 1-92 0" />
        </defs>
        <text
          fontFamily="'Archivo Variable', sans-serif"
          fontWeight="800"
          fontSize="12"
          letterSpacing="0.6"
          fill={colores.azulMarino}
        >
          <textPath href={`#${idCirculo}`}>{'ARCHIVO HISTÓRICO · DESDE 1919 · MDA ·'}</textPath>
        </text>
      </Box>
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          display: 'grid',
          placeItems: 'center',
          lineHeight: 0,
        }}
      >
        <Isotipo color={colores.naranja} tamano={tamano * 0.31} />
      </Box>
    </Box>
  );
}

interface Props {
  mouse: Mouse;
  /** En el celular la composición es más baja y lleva menos piezas, como en el diseño móvil. */
  compacto: boolean;
  /** Segundo en que empieza la entrada, para esperar a que se levante el telón. */
  inicio: number;
  animar: boolean;
}

/** Composición de papel recortado del diseño: la Aduana con piezas del archivo flotando. */
export function HeroAduana({ mouse, compacto, inicio, animar }: Props) {
  const t = (s: number) => inicio + s;
  return (
    <Box
      aria-hidden
      sx={{
        position: 'relative',
        width: '100%',
        // en celulares bajos la imagen cede altura para que la cinta se vea sin desplazarse
        height: compacto
          ? 'clamp(160px, calc(100vh - 590px), 214px)'
          : 'clamp(380px, calc(100vh - 210px), 560px)',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          inset: compacto ? '16px -6px 0 18px' : '40px 10px 30px 40px',
          bgcolor: colores.turquesa,
          clipPath: 'polygon(4% 8%, 96% 0, 100% 88%, 70% 100%, 0 94%)',
          ...entrada(animar, t(0.1), { dx: -70, ds: 0.6 }),
        }}
        style={capa(mouse, -26, -18)}
      />
      {!compacto && (
        <Box
          sx={{
            position: 'absolute',
            right: -30,
            bottom: 10,
            width: 220,
            height: 160,
            bgcolor: colores.naranja,
            clipPath: 'polygon(20% 0, 100% 18%, 88% 100%, 0 80%)',
            ...entrada(animar, t(0.25), { dx: 90, dy: 40, dr: 20 }),
          }}
          style={capa(mouse, 22, 16)}
        />
      )}
      <Box
        sx={{
          position: 'absolute',
          inset: compacto ? '0 14px 20px 0' : '10px 30px 70px 10px',
          filter: 'drop-shadow(0 18px 24px rgba(14, 45, 107, 0.25))',
          ...entrada(animar, t(0), { dy: 50, dr: -8, ds: 0.7 }, 1),
        }}
        style={capa(mouse, -14, -10)}
      >
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            height: '100%',
            overflow: 'hidden',
            clipPath: 'polygon(2% 5%, 97% 0, 100% 92%, 58% 100%, 0 96%)',
          }}
        >
          <Box
            component="img"
            src={imagenAduana}
            alt=""
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: compacto ? '55% 50%' : '60% 50%',
              animation: `${acercar} 22s ease-in-out infinite`,
            }}
          />
          {/* las nubes cruzan el cielo de la ilustración, por eso van dentro del recorte */}
          <Box
            sx={{ position: 'absolute', inset: '8px 0 auto', height: 130, pointerEvents: 'none' }}
          >
            <Nube ancho={compacto ? 90 : 150} arriba={6} duracion={34} sombra />
            <Nube
              ancho={compacto ? 66 : 110}
              arriba={compacto ? 40 : 58}
              duracion={46}
              retraso={-20}
            />
            {!compacto && <Nube ancho={90} arriba={24} duracion={40} retraso={-32} />}
          </Box>
        </Box>
      </Box>

      <Box
        sx={{
          position: 'absolute',
          ...(compacto ? { left: -8, bottom: -18 } : { left: -46, top: 64 }),
          ...entrada(animar, t(0.55), { dr: -200, ds: 0 }, 1),
        }}
        style={capa(mouse, 40, 30)}
      >
        <SelloGiratorio tamano={compacto ? 84 : 128} />
      </Box>

      <Box
        sx={{
          position: 'absolute',
          ...(compacto ? { right: 2, bottom: -16 } : { left: -24, bottom: -6 }),
          ...entrada(animar, t(0.7), { dx: compacto ? 60 : -90, dy: 130, dr: -30 }),
        }}
        style={capa(mouse, 36, 26)}
      >
        <Box
          component="figure"
          sx={{
            m: 0,
            width: compacto ? 104 : 210,
            bgcolor: colores.papel,
            p: compacto ? '6px 6px 8px' : '10px 10px 14px',
            boxShadow: '0 14px 28px rgba(14, 45, 107, 0.28)',
            rotate: compacto ? '6deg' : '-7deg',
            animation: `${flotar} 7s ease-in-out infinite`,
          }}
        >
          <Box
            sx={{
              height: compacto ? 62 : 130,
              bgcolor: '#8C7A5B',
              display: 'flex',
              alignItems: 'flex-end',
              p: compacto ? 0.5 : 1,
            }}
          >
            <svg
              width="100%"
              height={compacto ? 30 : 60}
              viewBox="0 0 190 60"
              preserveAspectRatio="none"
            >
              <path d="M0 60V40h30l10-14 8 14h40l12-22 10 22h80v20z" fill="#5E4F38" />
              <path d="M60 26V4M110 18V0" stroke="#5E4F38" strokeWidth="2" />
            </svg>
          </Box>
          <Box
            component="figcaption"
            sx={{
              mt: compacto ? 0.5 : 1,
              fontSize: compacto ? 11 : '0.875rem',
              fontWeight: 600,
              color: '#5A4A2E',
            }}
          >
            Puerto · 1925
          </Box>
        </Box>
      </Box>

      {!compacto && (
        <Box
          sx={{
            position: 'absolute',
            right: -6,
            top: -14,
            ...entrada(animar, t(0.85), { dx: 40, dy: -150, dr: 30 }),
          }}
          style={capa(mouse, -34, -24)}
        >
          <Box
            sx={{
              width: 190,
              bgcolor: '#F7E6C4',
              p: 1.75,
              boxShadow: sombraPieza,
              rotate: '8deg',
              animation: `${flotar} 7s ease-in-out -2s infinite`,
            }}
          >
            <Box
              sx={{
                fontFamily: 'h1.fontFamily',
                fontWeight: 900,
                fontSize: 22,
                letterSpacing: '0.02em',
                borderBottom: `2px solid ${colores.azulMarino}`,
                pb: 0.75,
              }}
            >
              LA GACETA
            </Box>
            <Box sx={{ mt: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.75 }}>
              {Array.from({ length: 8 }, (_, i) => (
                <Box key={i} sx={{ height: 5, bgcolor: '#9C8C6C' }} />
              ))}
            </Box>
          </Box>
        </Box>
      )}

      {!compacto && (
        <Box
          sx={{
            position: 'absolute',
            right: 30,
            bottom: -20,
            ...entrada(animar, t(1), { dx: 130, dy: 60, dr: 25 }),
          }}
          style={capa(mouse, 28, 30)}
        >
          <Box
            sx={{
              width: 170,
              height: 130,
              bgcolor: colores.crema,
              p: 1.75,
              boxShadow: sombraPieza,
              rotate: '4deg',
              animation: `${flotar} 7s ease-in-out -4s infinite`,
            }}
          >
            <svg
              width="100%"
              height="100%"
              viewBox="0 0 140 100"
              fill="none"
              stroke="#6B5A3C"
              strokeWidth="1.6"
              strokeLinecap="round"
              preserveAspectRatio="none"
            >
              <path d="M4 12c12-6 20 6 32 0s20 6 32 0 22 6 34 0 18 4 34 0" />
              <path d="M4 32c12-6 20 6 32 0s20 6 32 0 22 6 34 0 18 4 26 0" />
              <path d="M4 52c12-6 20 6 32 0s20 6 32 0 22 6 34 0" />
              <path d="M4 72c12-6 20 6 32 0s20 6 30 0" />
              <path d="M90 90c8-8 14 4 22-2s8 0 16-4" />
            </svg>
          </Box>
        </Box>
      )}
    </Box>
  );
}
