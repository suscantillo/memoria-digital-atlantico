import ArticleIcon from '@mui/icons-material/Article';
import LockIcon from '@mui/icons-material/Lock';
import NewspaperIcon from '@mui/icons-material/Newspaper';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Link as RouterLink } from 'react-router-dom';
import { colores } from '../../../app/tema';
import { NOMBRE_TIPO, tituloVisible, type PiezaPortalResumen, type TipoPieza } from '../tipos';

const MONO = '"Courier New", ui-monospace, monospace';

const ICONO_TIPO: Record<TipoPieza, typeof ArticleIcon> = {
  DOCUMENTO: ArticleIcon,
  FOTOGRAFIA: PhotoCameraIcon,
  PERIODICO: NewspaperIcon,
};

// cada tipo con su color de carpeta, para distinguirlos de un vistazo en la cuadrícula
const FONDO_TIPO: Record<TipoPieza, string> = {
  DOCUMENTO: colores.azulMarino,
  FOTOGRAFIA: colores.turquesaOscuro,
  PERIODICO: colores.naranja,
};

/** Un resultado como ficha de archivo: la miniatura arriba y el código como en la etiqueta física. */
export function TarjetaResultado({ pieza }: { pieza: PiezaPortalResumen }) {
  const Icono = pieza.restringida ? LockIcon : ICONO_TIPO[pieza.tipo];
  const titulo = tituloVisible(pieza);

  return (
    <Box
      component={RouterLink}
      to={`/p/${pieza.codigo}`}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        color: 'inherit',
        textDecoration: 'none',
        bgcolor: colores.papel,
        borderRadius: 4,
        overflow: 'hidden',
        boxShadow: '0 6px 0 #F5D79E',
        transition: 'transform .2s, box-shadow .2s',
        '&:hover': { transform: 'translateY(-4px)', boxShadow: `0 10px 0 ${colores.amarillo}` },
      }}
    >
      <Box
        sx={{
          position: 'relative',
          aspectRatio: '4 / 3',
          bgcolor: FONDO_TIPO[pieza.tipo],
          display: 'grid',
          placeItems: 'center',
          overflow: 'hidden',
        }}
      >
        {pieza.miniatura && !pieza.restringida ? (
          <Box
            component="img"
            src={pieza.miniatura}
            alt=""
            loading="lazy"
            sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <>
            {/* hoja de papel ladeada detrás del ícono */}
            <Box
              aria-hidden
              sx={{
                position: 'absolute',
                width: '42%',
                aspectRatio: '8.5 / 11',
                bgcolor: '#FFFFFF',
                opacity: 0.14,
                rotate: '-6deg',
              }}
            />
            <Icono aria-hidden sx={{ position: 'relative', fontSize: 48, color: '#FFFFFF' }} />
          </>
        )}
        <Box
          component="span"
          sx={{
            position: 'absolute',
            left: 10,
            bottom: 10,
            px: 1.25,
            py: 0.4,
            borderRadius: 999,
            bgcolor: colores.papel,
            color: colores.azulMarino,
            fontSize: 13,
            fontWeight: 800,
          }}
        >
          {NOMBRE_TIPO[pieza.tipo]}
          {pieza.anio ? ` · ${pieza.anio}` : ''}
        </Box>
      </Box>
      <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        <Typography
          sx={{ fontFamily: MONO, fontWeight: 700, fontSize: 13, color: colores.naranja }}
        >
          {pieza.codigo}
        </Typography>
        <Typography
          component="h2"
          sx={{
            fontFamily: 'h1.fontFamily',
            fontWeight: 800,
            fontSize: 18,
            lineHeight: 1.15,
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {titulo}
        </Typography>
      </Box>
    </Box>
  );
}
