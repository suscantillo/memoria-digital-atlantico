import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { colores } from '../../../app/tema';
import { IconoTipo } from '../../portal/componentes/IconoTipo';
import { NOMBRE_TIPO, type PiezaPortal, type TipoPieza } from '../../portal/tipos';

const TONO_TIPO: Record<TipoPieza, { fondo: string; texto: string }> = {
  FOTOGRAFIA: { fondo: '#D4EEF1', texto: '#005F6B' },
  PERIODICO: { fondo: '#FFE1D6', texto: '#A8320F' },
  DOCUMENTO: { fondo: '#DCE3F2', texto: colores.azulMarino },
};

interface Props {
  pieza: PiezaPortal;
  /** Al abrir la ficha; en el celular cierra el chat para que se vea la página. */
  onAbrir?: () => void;
}

/** Una pieza que recomienda Miga: lleva a su ficha pública. */
export function TarjetaRecomendacion({ pieza, onAbrir }: Props) {
  const [fallo, setFallo] = useState(false);
  const tono = TONO_TIPO[pieza.tipo];
  const imagen = pieza.archivo?.tipoMime.startsWith('image/') && !fallo ? pieza.archivo.url : null;
  const titulo = pieza.titulo ?? 'Pieza sin título';
  const tipo = NOMBRE_TIPO[pieza.tipo].singular;

  return (
    <Box
      component={RouterLink}
      to={`/p/${encodeURIComponent(pieza.codigo)}`}
      onClick={onAbrir}
      aria-label={`${titulo}. ${tipo}${pieza.anio ? ` de ${pieza.anio}` : ''}. Ver ficha`}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 3.5,
        overflow: 'hidden',
        border: '2px solid #EFE3CC',
        bgcolor: colores.papel,
        color: colores.azulMarino,
        textDecoration: 'none',
        transition: 'border-color .15s, transform .15s',
        '&:hover': { borderColor: colores.azulMarino, transform: 'translateY(-2px)' },
        '@media (prefers-reduced-motion: reduce)': {
          transition: 'none',
          '&:hover': { transform: 'none' },
        },
      }}
    >
      {imagen ? (
        <Box
          component="img"
          src={imagen}
          alt=""
          loading="lazy"
          onError={() => setFallo(true)}
          sx={{
            display: 'block',
            width: '100%',
            height: 84,
            objectFit: 'cover',
            filter: 'sepia(.15)',
          }}
        />
      ) : (
        <Box
          aria-hidden
          sx={{ height: 84, display: 'grid', placeItems: 'center', bgcolor: tono.fondo }}
        >
          <IconoTipo tipo={pieza.tipo} tamano={36} color={tono.texto} />
        </Box>
      )}
      <Box sx={{ p: '8px 10px 10px', display: 'flex', flexDirection: 'column', gap: 0.4 }}>
        <Typography
          component="span"
          sx={{
            fontFamily: 'h1.fontFamily',
            fontWeight: 800,
            fontSize: 11,
            letterSpacing: '.06em',
            color: tono.texto,
          }}
        >
          {tipo.toUpperCase()}
          {pieza.anio ? ` · ${pieza.anio}` : ''}
        </Typography>
        <Typography component="span" sx={{ fontWeight: 700, fontSize: 13.5, lineHeight: 1.25 }}>
          {titulo}
        </Typography>
        <Typography
          component="span"
          sx={{ fontFamily: 'ui-monospace, monospace', fontSize: 11.5, color: 'text.secondary' }}
        >
          {pieza.codigo}
        </Typography>
      </Box>
    </Box>
  );
}
