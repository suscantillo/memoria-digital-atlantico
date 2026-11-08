import Box from '@mui/material/Box';
import { keyframes } from '@mui/material/styles';
import { colores } from '../../../app/tema';
import imagenAduana from '../../../assets/aduana.webp';
import { Isotipo } from '../../../shared/componentes/Isotipo';

const acercar = keyframes`
  0%, 100% { transform: scale(1.04); }
  50% { transform: scale(1.14) translate(-2%, 1%); }
`;

const flotar = keyframes`
  0%, 100% { translate: 0 0; }
  50% { translate: 0 -12px; }
`;

const girar = keyframes`
  to { transform: rotate(360deg); }
`;

const TEXTO_SELLO = 'ARCHIVO HISTÓRICO · DESDE 1919 · ';

function SelloGiratorio() {
  return (
    <Box sx={{ position: 'relative', width: 120, height: 120 }}>
      <Box
        component="svg"
        viewBox="0 0 120 120"
        sx={{ position: 'absolute', inset: 0, animation: `${girar} 24s linear infinite` }}
      >
        <defs>
          <path id="circulo-sello" d="M60 60m-46 0a46 46 0 1 1 92 0a46 46 0 1 1-92 0" />
        </defs>
        <circle cx="60" cy="60" r="58" fill={colores.amarillo} />
        <text fontSize="11" fontWeight="800" letterSpacing="2.2" fill={colores.azulMarino}>
          <textPath href="#circulo-sello">{TEXTO_SELLO}</textPath>
        </text>
      </Box>
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          display: 'grid',
          placeItems: 'center',
          color: colores.naranja,
        }}
      >
        <Isotipo tamano={42} />
      </Box>
    </Box>
  );
}

/** Composición de papel recortado: la fachada de la Aduana con piezas del archivo flotando. */
export function HeroAduana() {
  return (
    <Box aria-hidden sx={{ position: 'relative', width: '100%', height: { xs: 340, md: 500 } }}>
      <Box
        sx={{
          position: 'absolute',
          inset: '40px 10px 30px 40px',
          bgcolor: colores.turquesa,
          clipPath: 'polygon(4% 8%, 96% 0, 100% 88%, 70% 100%, 0 94%)',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          right: 0,
          bottom: 10,
          width: { xs: 140, md: 220 },
          height: { xs: 110, md: 160 },
          bgcolor: colores.naranja,
          clipPath: 'polygon(20% 0, 100% 18%, 88% 100%, 0 80%)',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          inset: '10px 30px 70px 10px',
          filter: 'drop-shadow(0 18px 24px rgba(14, 45, 107, 0.25))',
        }}
      >
        <Box
          sx={{
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
              objectPosition: '60% 50%',
              animation: `${acercar} 18s ease-in-out infinite`,
            }}
          />
        </Box>
      </Box>

      <Box
        sx={{
          position: 'absolute',
          left: 0,
          top: { xs: 10, md: 60 },
          scale: { xs: '0.75', md: '1' },
        }}
      >
        <SelloGiratorio />
      </Box>

      <Box
        component="figure"
        sx={{
          position: 'absolute',
          left: { xs: 8, md: 0 },
          bottom: 0,
          m: 0,
          p: 1,
          pb: 1.25,
          width: { xs: 120, md: 150 },
          bgcolor: '#FFFFFF',
          boxShadow: '0 10px 20px rgba(14, 45, 107, 0.25)',
          rotate: '-7deg',
          animation: `${flotar} 5s ease-in-out infinite`,
        }}
      >
        <Box
          sx={{
            height: { xs: 70, md: 90 },
            background: `linear-gradient(160deg, ${colores.turquesa}, ${colores.azulMarino})`,
          }}
        />
        <Box
          component="figcaption"
          sx={{ mt: 0.75, fontFamily: 'monospace', fontSize: '0.72rem', textAlign: 'center' }}
        >
          Puerto · 1925 (prueba)
        </Box>
      </Box>

      <Box
        sx={{
          display: { xs: 'none', sm: 'block' },
          position: 'absolute',
          right: 0,
          top: 0,
          width: 130,
          p: 1.5,
          bgcolor: colores.papel,
          boxShadow: '0 10px 20px rgba(14, 45, 107, 0.2)',
          rotate: '8deg',
          animation: `${flotar} 6s ease-in-out -2s infinite`,
        }}
      >
        <Box
          sx={{
            fontFamily: 'h1.fontFamily',
            fontWeight: 900,
            textAlign: 'center',
            borderBottom: `3px double ${colores.azulMarino}`,
            pb: 0.5,
            mb: 1,
          }}
        >
          LA GACETA
        </Box>
        {Array.from({ length: 6 }, (_, i) => (
          <Box
            key={i}
            sx={{
              height: 5,
              mb: 0.75,
              borderRadius: 1,
              bgcolor: '#E2CFA3',
              width: `${70 + ((i * 13) % 30)}%`,
            }}
          />
        ))}
      </Box>
    </Box>
  );
}
