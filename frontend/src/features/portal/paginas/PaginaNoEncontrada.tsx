import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { Link as RouterLink } from 'react-router-dom';
import { colores } from '../../../app/tema';
import { entrada } from '../componentes/animaciones';

const KRAFT = '#C9A46A';
const KRAFT_OSCURO = '#A8844D';

/** Caja de archivo abierta y vacía, con la ficha del folio que no aparece. */
function CajaVacia({ animar }: { animar: boolean }) {
  return (
    <Box
      aria-hidden
      sx={{ position: 'relative', width: { xs: 260, sm: 320 }, height: { xs: 230, sm: 280 } }}
    >
      <Box
        sx={{
          position: 'absolute',
          left: '8%',
          right: '8%',
          bottom: '6%',
          height: '58%',
          bgcolor: KRAFT,
          borderRadius: '6px',
          boxShadow: `0 10px 0 ${KRAFT_OSCURO}`,
          ...entrada(animar, 0, { dy: 60, ds: 0.8 }),
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            left: '50%',
            top: '34%',
            translate: '-50% 0',
            px: 2,
            py: 0.75,
            bgcolor: colores.papel,
            border: `2px solid ${KRAFT_OSCURO}`,
            fontFamily: 'monospace',
            fontWeight: 700,
            fontSize: { xs: 13, sm: 15 },
            color: '#5A4A2E',
            whiteSpace: 'nowrap',
          }}
        >
          CAJA C-404
        </Box>
      </Box>

      <Box
        sx={{
          position: 'absolute',
          left: '22%',
          top: '6%',
          width: '56%',
          height: '52%',
          bgcolor: colores.papel,
          boxShadow: '0 12px 24px rgba(14, 45, 107, 0.2)',
          p: 1.5,
          rotate: '-6deg',
          zIndex: -1,
          ...entrada(animar, 0.3, { dy: 80, dr: 10 }),
        }}
      >
        <Box
          sx={{
            fontFamily: 'h1.fontFamily',
            fontWeight: 900,
            fontSize: { xs: 15, sm: 18 },
            borderBottom: `2px solid ${colores.azulMarino}`,
            pb: 0.5,
            mb: 1,
          }}
        >
          FOLIO 404
        </Box>
        {[90, 70, 80].map((ancho) => (
          <Box key={ancho} sx={{ height: 5, width: `${ancho}%`, bgcolor: '#D8C9A8', mb: 0.75 }} />
        ))}
      </Box>

      <Box
        sx={{
          position: 'absolute',
          right: { xs: -6, sm: -18 },
          top: '18%',
          px: 1.5,
          py: 0.5,
          border: `3px solid ${colores.naranja}`,
          borderRadius: 1,
          color: colores.naranja,
          fontFamily: 'h1.fontFamily',
          fontWeight: 900,
          fontSize: { xs: 17, sm: 21 },
          letterSpacing: '0.08em',
          rotate: '12deg',
          bgcolor: 'rgba(255, 250, 240, 0.85)',
          ...entrada(animar, 0.65, { ds: 2.4, dr: -20 }, 0.5),
        }}
      >
        EXTRAVIADO
      </Box>
    </Box>
  );
}

export function PaginaNoEncontrada() {
  const animar = !useMediaQuery('(prefers-reduced-motion: reduce)', { noSsr: true });

  return (
    <Box
      component="section"
      aria-labelledby="titulo-no-encontrada"
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: '1fr auto' },
        alignItems: 'center',
        justifyItems: { xs: 'center', md: 'start' },
        gap: { xs: 4, md: 8 },
        maxWidth: 980,
        mx: 'auto',
        py: { xs: 2, md: 6 },
      }}
    >
      <Box sx={{ order: { xs: 2, md: 1 }, textAlign: { xs: 'center', md: 'left' } }}>
        <Box
          component="p"
          sx={{
            display: 'inline-block',
            m: 0,
            mb: 2,
            px: 2,
            py: 0.75,
            borderRadius: 999,
            bgcolor: colores.naranja,
            color: '#FFFFFF',
            fontFamily: 'h1.fontFamily',
            fontWeight: 800,
            fontSize: 14,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            rotate: '-2deg',
          }}
        >
          Error 404 · folio extraviado
        </Box>
        <Typography
          id="titulo-no-encontrada"
          variant="h1"
          sx={{
            m: 0,
            mb: 2,
            fontWeight: 900,
            fontSize: 'clamp(40px, 7vw, 72px)',
            lineHeight: 0.92,
            letterSpacing: '-0.03em',
            textTransform: 'uppercase',
          }}
        >
          Esta caja
          <br />
          <Box component="span" sx={{ position: 'relative', zIndex: 0, display: 'inline-block' }}>
            está vacía
            <Box
              component="span"
              aria-hidden
              sx={{
                position: 'absolute',
                left: '-2%',
                right: '-3%',
                bottom: 2,
                height: { xs: 12, md: 18 },
                bgcolor: colores.amarillo,
                zIndex: -1,
                borderRadius: '4px 14px 6px 12px',
              }}
            />
          </Box>
        </Typography>
        <Typography sx={{ maxWidth: 440, mx: { xs: 'auto', md: 0 }, mb: 3.5, fontSize: 18 }}>
          La dirección que abriste no existe o la pieza cambió de lugar. Desde el inicio puedes
          buscar en el archivo.
        </Typography>
        <Button
          component={RouterLink}
          to="/"
          variant="contained"
          color="secondary"
          size="large"
          sx={{ borderRadius: 999, px: 4, py: 1.5, fontSize: 18, boxShadow: '0 5px 0 #8F2A0C' }}
        >
          Volver al inicio
        </Button>
      </Box>

      <Box sx={{ order: { xs: 1, md: 2 }, position: 'relative', zIndex: 0 }}>
        <CajaVacia animar={animar} />
      </Box>
    </Box>
  );
}
