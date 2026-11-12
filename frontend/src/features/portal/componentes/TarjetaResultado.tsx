import Box from '@mui/material/Box';
import { useState } from 'react';
import { colores } from '../../../app/tema';
import { NOMBRE_TIPO, type PiezaPortal } from '../tipos';

export const FUENTE_MAQUINA = '"Courier Prime", "Courier New", Courier, monospace';

const TONOS = ['#7E6A4B', '#6E6248', '#5E5240', '#8C7A5B'];
const ALTOS = [220, 170, 250, 200];

const efectoInclinar = {
  transition: 'transform .45s cubic-bezier(.2, .8, .2, 1), box-shadow .45s',
  '&:hover': {
    transform:
      'perspective(900px) rotateX(6deg) rotateY(-8deg) translateY(-10px) rotate(0deg) !important',
    boxShadow: '16px 22px 0 rgba(14, 45, 107, .16) !important',
  },
  '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
} as const;

interface Props {
  pieza: PiezaPortal;
  indice: number;
  giro: number;
}

function titulo(pieza: PiezaPortal) {
  return pieza.restringida ? 'Consulta restringida en sala' : (pieza.titulo ?? 'Sin título');
}

function etiqueta(pieza: PiezaPortal, mayusculas = false) {
  const tipo = NOMBRE_TIPO[pieza.tipo].singular;
  const texto = pieza.anio !== null ? `${tipo} · ${pieza.anio}` : tipo;
  return mayusculas ? texto.toUpperCase() : texto;
}

function Fotografia({ pieza, indice, giro }: Props) {
  const [fallo, setFallo] = useState(false);
  const alto = ALTOS[indice % ALTOS.length];
  const conImagen = pieza.archivo?.tipoMime.startsWith('image/') && !fallo;
  return (
    <Box
      sx={{
        position: 'relative',
        bgcolor: '#FFFFFF',
        p: '12px 12px 18px',
        boxShadow: '0 10px 22px rgba(14, 45, 107, .16)',
        transform: `rotate(${giro}deg)`,
        ...efectoInclinar,
      }}
    >
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          top: -12,
          left: '50%',
          width: 84,
          height: 24,
          ml: '-42px',
          bgcolor: colores.amarillo,
          opacity: 0.85,
          transform: 'rotate(-4deg)',
        }}
      />
      {conImagen && pieza.archivo ? (
        <Box
          component="img"
          src={pieza.archivo.url}
          alt=""
          loading="lazy"
          onError={() => setFallo(true)}
          sx={{ display: 'block', width: '100%', height: alto, objectFit: 'cover' }}
        />
      ) : (
        <Box
          aria-hidden
          sx={{
            display: 'flex',
            alignItems: 'flex-end',
            height: alto,
            p: 1.25,
            bgcolor: TONOS[indice % TONOS.length],
          }}
        >
          <svg width="100%" height="50%" viewBox="0 0 200 80" preserveAspectRatio="none">
            <path d="M0 80V50h30l14-22 12 22h50l16-30 14 30h64v30z" fill="#00000033" />
          </svg>
        </Box>
      )}
      <Box
        sx={{
          mt: 1.5,
          fontSize: 13,
          fontWeight: 700,
          letterSpacing: '.06em',
          textTransform: 'uppercase',
          color: colores.naranja,
        }}
      >
        {etiqueta(pieza)}
      </Box>
      <Box
        component="h2"
        sx={{
          m: '4px 0 0',
          fontFamily: 'h1.fontFamily',
          fontWeight: 800,
          fontSize: 20,
          lineHeight: 1.15,
        }}
      >
        {titulo(pieza)}
      </Box>
    </Box>
  );
}

function Documento({ pieza, giro }: Props) {
  return (
    <Box
      sx={{
        position: 'relative',
        bgcolor: colores.papel,
        p: '26px 22px 24px',
        boxShadow: '0 10px 22px rgba(14, 45, 107, .14)',
        clipPath: 'polygon(0 0, 86% 0, 100% 12%, 100% 100%, 0 100%)',
        transform: `rotate(${giro}deg)`,
        ...efectoInclinar,
      }}
    >
      <Box
        aria-hidden
        sx={{ position: 'absolute', top: 0, right: 0, width: '14%', pb: '12%', bgcolor: '#F5D79E' }}
      />
      <Box
        sx={{ fontFamily: FUENTE_MAQUINA, fontSize: 15, fontWeight: 700, color: colores.naranja }}
      >
        {etiqueta(pieza, true)}
      </Box>
      <Box
        component="h2"
        sx={{
          m: '10px 0 0',
          fontFamily: FUENTE_MAQUINA,
          fontSize: 21,
          fontWeight: 700,
          lineHeight: 1.2,
        }}
      >
        {titulo(pieza)}
      </Box>
      <Box aria-hidden sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 2 }}>
        {['100%', '92%', '100%', '70%'].map((ancho, i) => (
          <Box key={i} sx={{ height: 4, width: ancho, bgcolor: '#D8C9A8' }} />
        ))}
      </Box>
      <Box
        sx={{
          display: 'inline-block',
          mt: 2.25,
          px: 1.25,
          py: 0.5,
          border: `2px solid ${pieza.restringida ? colores.naranja : colores.turquesa}`,
          color: pieza.restringida ? '#A8320F' : colores.turquesaOscuro,
          fontFamily: 'h1.fontFamily',
          fontWeight: 800,
          fontSize: 13,
          letterSpacing: '.08em',
          transform: 'rotate(-4deg)',
        }}
      >
        {pieza.restringida ? 'RESTRINGIDO' : 'DIGITALIZADO'}
      </Box>
    </Box>
  );
}

function Periodico({ pieza, giro }: Props) {
  return (
    <Box
      sx={{
        bgcolor: '#F7E6C4',
        p: '18px 18px 30px',
        boxShadow: '0 10px 22px rgba(14, 45, 107, .14)',
        clipPath:
          'polygon(0 0, 100% 0, 100% 94%, 92% 100%, 84% 95%, 76% 100%, 68% 95%, 60% 100%, 52% 95%, 44% 100%, 36% 95%, 28% 100%, 20% 95%, 12% 100%, 4% 95%, 0 100%)',
        transform: `rotate(${giro}deg)`,
        ...efectoInclinar,
      }}
    >
      <Box
        aria-hidden
        sx={{
          fontFamily: 'h1.fontFamily',
          fontWeight: 900,
          fontSize: 26,
          letterSpacing: '.02em',
          borderBottom: `3px double ${colores.azulMarino}`,
          pb: 0.75,
          textAlign: 'center',
        }}
      >
        LA GACETA
      </Box>
      <Box sx={{ mt: 0.5, fontFamily: FUENTE_MAQUINA, fontSize: 13, textAlign: 'center' }}>
        {etiqueta(pieza, true)}
      </Box>
      <Box
        component="h2"
        sx={{
          m: '12px 0 0',
          fontFamily: 'h1.fontFamily',
          fontWeight: 800,
          fontSize: 20,
          lineHeight: 1.15,
        }}
      >
        {titulo(pieza)}
      </Box>
      <Box
        aria-hidden
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
          gap: 0.75,
          mt: 1.5,
        }}
      >
        {Array.from({ length: 6 }, (_, i) => (
          <Box key={i} sx={{ height: 4, bgcolor: '#A8987A' }} />
        ))}
      </Box>
    </Box>
  );
}

/** Tarjeta del resultado: cada tipo se ve como su objeto real, como en el diseño. */
export function TarjetaResultado(props: Props) {
  const { pieza } = props;
  return (
    <Box
      component="article"
      aria-label={`${titulo(pieza)}, ${etiqueta(pieza)}, código ${pieza.codigo}`}
      sx={{ color: colores.azulMarino }}
    >
      {pieza.tipo === 'FOTOGRAFIA' && <Fotografia {...props} />}
      {pieza.tipo === 'DOCUMENTO' && <Documento {...props} />}
      {pieza.tipo === 'PERIODICO' && <Periodico {...props} />}
    </Box>
  );
}
