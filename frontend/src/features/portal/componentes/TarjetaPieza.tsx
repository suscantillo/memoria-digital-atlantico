import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import { useState } from 'react';
import { colores } from '../../../app/tema';
import { NOMBRE_TIPO, type PiezaPortal, type TipoPieza } from '../tipos';
import { IconoTipo } from './IconoTipo';

/** Tono de papel viejo de cada tipo para el espacio de la imagen mientras no haya escaneo. */
const TONO: Record<TipoPieza, string> = {
  DOCUMENTO: '#A08A5E',
  FOTOGRAFIA: '#7E6A4B',
  PERIODICO: '#6E6248',
};

const ALTO_IMAGEN = 190;

interface Props {
  pieza: PiezaPortal;
  /** Giro de polaroid; 0 en las grillas para que se lean derechas. */
  giro?: number;
}

function EspacioImagen({ pieza }: { pieza: PiezaPortal }) {
  const [fallo, setFallo] = useState(false);
  const esImagen = pieza.archivo?.tipoMime.startsWith('image/') && !fallo;

  if (esImagen && pieza.archivo) {
    return (
      <Box
        component="img"
        src={pieza.archivo.url}
        alt=""
        loading="lazy"
        onError={() => setFallo(true)}
        sx={{ display: 'block', width: '100%', height: ALTO_IMAGEN, objectFit: 'cover' }}
      />
    );
  }

  // sin escaneo de imagen se deja el espacio con el ícono del tipo, como una carpeta cerrada
  return (
    <Box
      aria-hidden
      sx={{
        height: ALTO_IMAGEN,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: TONO[pieza.tipo],
        backgroundImage:
          'repeating-linear-gradient(135deg, rgba(255,250,240,.07) 0 10px, transparent 10px 20px)',
        color: 'rgba(255, 250, 240, .8)',
      }}
    >
      {pieza.restringida ? (
        <LockOutlinedIcon sx={{ fontSize: 56 }} />
      ) : (
        <IconoTipo tipo={pieza.tipo} tamano={60} />
      )}
    </Box>
  );
}

/** Pieza publicada en forma de foto pegada con cinta, como en el diseño. */
export function TarjetaPieza({ pieza, giro = 0 }: Props) {
  const tipo = NOMBRE_TIPO[pieza.tipo].singular;
  const titulo = pieza.restringida
    ? `${tipo} de consulta restringida`
    : (pieza.titulo ?? 'Sin título');

  return (
    <Box
      component="article"
      aria-label={`${titulo}, ${pieza.codigo}`}
      sx={{
        position: 'relative',
        width: '100%',
        maxWidth: 260,
        p: '12px 12px 18px',
        bgcolor: '#FFFFFF',
        color: colores.azulMarino,
        boxShadow: '0 10px 22px rgba(14, 45, 107, .16)',
        rotate: `${giro}deg`,
        transition: 'rotate .35s, translate .35s, box-shadow .35s',
        '&:hover': {
          rotate: '0deg',
          translate: '0 -6px',
          boxShadow: '0 18px 30px rgba(14, 45, 107, .22)',
        },
        '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
      }}
    >
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          top: -12,
          left: '50%',
          width: 90,
          height: 24,
          ml: '-45px',
          bgcolor: colores.amarillo,
          opacity: 0.85,
          rotate: '-3deg',
        }}
      />
      <EspacioImagen pieza={pieza} />
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
        {tipo}
        {pieza.anio !== null && ` · ${pieza.anio}`}
      </Box>
      <Box
        component="h3"
        sx={{
          m: '4px 0 0',
          fontFamily: 'h1.fontFamily',
          fontWeight: 700,
          fontSize: 19,
          lineHeight: 1.2,
          overflowWrap: 'anywhere',
        }}
      >
        {titulo}
      </Box>
      <Box sx={{ mt: 1, fontSize: 13, fontFamily: 'monospace', color: 'text.secondary' }}>
        {pieza.codigo}
      </Box>
    </Box>
  );
}

export function TarjetaPiezaCargando({ giro = 0 }: { giro?: number }) {
  return (
    <Box
      aria-hidden
      sx={{
        width: '100%',
        maxWidth: 260,
        p: '12px 12px 18px',
        bgcolor: '#FFFFFF',
        rotate: `${giro}deg`,
      }}
    >
      <Skeleton variant="rectangular" height={ALTO_IMAGEN} />
      <Skeleton width="45%" sx={{ mt: 1.5 }} />
      <Skeleton width="85%" height={28} />
    </Box>
  );
}
