import Box from '@mui/material/Box';
import { keyframes } from '@mui/material/styles';
import { colores } from '../../../app/tema';
import { Isotipo } from '../../../shared/componentes/Isotipo';
import { VERSION_PRIVACIDAD } from '../privacidad';

const flotar = keyframes`
  0%, 100% { transform: translateY(0) rotate(-4deg); }
  50% { transform: translateY(-10px) rotate(-2deg); }
`;
const nubeVa = keyframes`
  0%, 100% { transform: translateX(0); }
  50% { transform: translateX(26px); }
`;
const estampar = keyframes`
  0% { opacity: 0; transform: scale(1.9) rotate(-24deg); }
  60% { opacity: 1; transform: scale(.92) rotate(-12deg); }
  100% { opacity: 1; transform: scale(1) rotate(-14deg); }
`;

const sinMovimiento = { '@media (prefers-reduced-motion: reduce)': { animation: 'none' } } as const;
const MAQUINA = '"Courier Prime", "Courier New", Courier, monospace';

function Nube({ sx }: { sx: object }) {
  return (
    <Box
      component="svg"
      viewBox="0 0 150 60"
      sx={{ position: 'absolute', fill: colores.papel, ...sx, ...sinMovimiento }}
    >
      <path d="M10 50h130l-14-18-20 4-10-24-30 8-14 14-24-2z" />
    </Box>
  );
}

function Renglon({ etiqueta, valor, vacio }: { etiqueta: string; valor: string; vacio: string }) {
  return (
    <Box sx={{ display: 'grid', gap: 0.25, minWidth: 0 }}>
      <Box
        component="span"
        sx={{ fontFamily: MAQUINA, fontSize: 11, fontWeight: 700, color: colores.naranja }}
      >
        {etiqueta}
      </Box>
      <Box
        component="span"
        sx={{
          fontFamily: MAQUINA,
          fontWeight: 700,
          fontSize: 16,
          borderBottom: '2px dotted #CDBB94',
          pb: 0.25,
          minHeight: 26,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          color: valor ? colores.azulMarino : '#9A8A68',
        }}
      >
        {valor || vacio}
      </Box>
    </Box>
  );
}

interface Props {
  nombre: string;
  correo: string;
  acepta: boolean;
  compacto?: boolean;
}

/** Escenario del registro: el carné del archivo se llena mientras la persona escribe. */
export function CarneArchivo({ nombre, correo, acepta, compacto = false }: Props) {
  return (
    <Box aria-hidden sx={{ position: 'relative', height: compacto ? 270 : 520, minWidth: 0 }}>
      <Box
        sx={{
          position: 'absolute',
          inset: compacto ? '10px 0 10px 0' : '30px 10px 20px 20px',
          bgcolor: colores.turquesa,
          clipPath: 'polygon(4% 8%, 96% 0, 100% 90%, 64% 100%, 0 94%)',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          right: compacto ? -6 : -10,
          bottom: 0,
          width: compacto ? 110 : 180,
          height: compacto ? 76 : 124,
          bgcolor: colores.naranja,
          clipPath: 'polygon(20% 0, 100% 18%, 88% 100%, 0 80%)',
        }}
      />
      <Nube
        sx={{
          left: compacto ? 20 : 60,
          top: compacto ? 26 : 64,
          width: compacto ? 80 : 130,
          animation: `${nubeVa} 9s ease-in-out infinite`,
        }}
      />
      <Nube
        sx={{
          right: compacto ? 30 : 70,
          top: compacto ? 50 : 120,
          width: compacto ? 56 : 90,
          opacity: 0.8,
          animation: `${nubeVa} 12s ease-in-out -4s infinite`,
        }}
      />

      <Box
        sx={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          width: compacto ? 300 : 380,
          ml: compacto ? '-150px' : '-190px',
          mt: compacto ? '-92px' : '-120px',
          animation: `${flotar} 6s ease-in-out infinite`,
          transform: 'rotate(-4deg)',
          filter: 'drop-shadow(0 22px 26px rgba(14, 45, 107, .32))',
          ...sinMovimiento,
        }}
      >
        <Box
          sx={{
            position: 'relative',
            borderRadius: '18px',
            overflow: 'hidden',
            bgcolor: colores.papel,
            border: `4px solid ${colores.azulMarino}`,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.25,
              px: 2,
              py: compacto ? 1 : 1.5,
              bgcolor: colores.azulMarino,
              color: '#FFFFFF',
            }}
          >
            <Isotipo color={colores.amarillo} tamano={compacto ? 24 : 30} />
            <Box sx={{ lineHeight: 1.05 }}>
              <Box
                sx={{
                  fontFamily: 'h1.fontFamily',
                  fontWeight: 900,
                  fontSize: compacto ? 15 : 18,
                }}
              >
                Memoria{' '}
                <Box component="span" sx={{ color: colores.amarillo }}>
                  Digital
                </Box>
              </Box>
              <Box sx={{ fontFamily: MAQUINA, fontSize: 11, letterSpacing: '.08em' }}>
                CARNÉ DEL ARCHIVO
              </Box>
            </Box>
          </Box>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: compacto ? '64px 1fr' : '84px 1fr',
              gap: 2,
              p: compacto ? 1.75 : 2.5,
              backgroundImage: `repeating-linear-gradient(${colores.papel} 0 30px, #EFE4CC 30px 31px)`,
            }}
          >
            <Box
              sx={{
                height: compacto ? 76 : 100,
                borderRadius: '10px',
                bgcolor: colores.amarillo,
                border: `3px solid ${colores.azulMarino}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'h1.fontFamily',
                fontWeight: 900,
                fontSize: compacto ? 26 : 34,
                color: colores.azulMarino,
              }}
            >
              {iniciales(nombre)}
            </Box>
            <Box sx={{ display: 'grid', gap: compacto ? 0.75 : 1.25, minWidth: 0 }}>
              <Renglon etiqueta="NOMBRE" valor={nombre.trim()} vacio="Tu nombre" />
              <Renglon etiqueta="CORREO" valor={correo.trim()} vacio="tu@correo.com" />
              {!compacto && <Renglon etiqueta="ROL" valor="PUBLICO" vacio="" />}
            </Box>
          </Box>
        </Box>

        {acepta && (
          <Box
            sx={{
              position: 'absolute',
              right: compacto ? -14 : -22,
              bottom: compacto ? -22 : -30,
              width: compacto ? 88 : 112,
              height: compacto ? 88 : 112,
              borderRadius: 999,
              border: `4px dashed ${colores.turquesaOscuro}`,
              bgcolor: 'rgba(255, 250, 240, .92)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: colores.turquesaOscuro,
              fontFamily: 'h1.fontFamily',
              fontWeight: 900,
              lineHeight: 1,
              transform: 'rotate(-14deg)',
              animation: `${estampar} .5s cubic-bezier(.2, .8, .2, 1) both`,
              ...sinMovimiento,
            }}
          >
            <Box component="span" sx={{ fontSize: compacto ? 13 : 16 }}>
              ACEPTADO
            </Box>
            <Box component="span" sx={{ fontFamily: MAQUINA, fontSize: 11, mt: 0.5 }}>
              AVISO V{VERSION_PRIVACIDAD}
            </Box>
            <Box component="span" sx={{ fontFamily: MAQUINA, fontSize: 10 }}>
              LEY 1581
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
}

function iniciales(nombre: string) {
  const partes = nombre.trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return '?';
  return partes
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');
}
