import Box from '@mui/material/Box';
import { forwardRef } from 'react';
import { colores } from '../../../app/tema';
import migaSaludo from '../../../assets/miga/miga-saludo.webp';

interface Props {
  abierto: boolean;
  idPanel: string;
  onClick: () => void;
}

/**
 * Miga flotando abajo a la derecha en todo el portal. Al pasar el mouse o llegar con el teclado
 * aparece el globo «¡Pregúntale a Miga!». En el celular se sube para no tapar la barra de abajo.
 */
export const BotonMiga = forwardRef<HTMLButtonElement, Props>(function BotonMiga(
  { abierto, idPanel, onClick },
  ref,
) {
  return (
    <Box
      sx={{
        position: 'fixed',
        zIndex: (t) => t.zIndex.speedDial,
        right: { xs: 16, sm: 28 },
        bottom: { xs: 96, sm: 28 },
        display: 'flex',
        flexDirection: 'row-reverse',
        alignItems: 'center',
        gap: 1.5,
        // el globo solo se ve con el puntero encima o con foco de teclado
        '& .miga-globo': {
          opacity: 0,
          transform: 'translateX(10px) scale(.92)',
          transformOrigin: 'right center',
          transition: 'opacity .18s ease, transform .18s ease',
          pointerEvents: 'none',
        },
        '& button:hover + .miga-globo, & button:focus-visible + .miga-globo': {
          opacity: 1,
          transform: 'none',
        },
        '@media (prefers-reduced-motion: reduce)': {
          '& .miga-globo, & button': { transition: 'none' },
        },
      }}
    >
      <Box
        component="button"
        ref={ref}
        type="button"
        onClick={onClick}
        aria-label={abierto ? 'Cerrar a Miga' : 'Pregúntale a Miga'}
        aria-expanded={abierto}
        aria-controls={idPanel}
        sx={{
          width: { xs: 72, sm: 88 },
          height: { xs: 72, sm: 88 },
          p: 0,
          borderRadius: '50%',
          border: '4px solid #FFFFFF',
          bgcolor: '#E3EFC4',
          boxShadow: '0 10px 22px rgba(14, 45, 107, .3)',
          display: 'grid',
          placeItems: 'center',
          overflow: 'hidden',
          cursor: 'pointer',
          transition: 'transform .18s ease',
          '&:hover': { transform: 'translateY(-4px) rotate(-4deg)' },
          '@media (prefers-reduced-motion: reduce)': { '&:hover': { transform: 'none' } },
        }}
      >
        <Box
          component="img"
          src={migaSaludo}
          alt=""
          sx={{ width: '92%', height: '92%', objectFit: 'contain', mt: '8%' }}
        />
      </Box>
      <Box
        component="span"
        className="miga-globo"
        aria-hidden
        sx={{
          display: { xs: 'none', sm: 'block' },
          px: 2.5,
          py: 1.5,
          borderRadius: 999,
          bgcolor: colores.azulMarino,
          color: '#FFFFFF',
          fontFamily: 'h1.fontFamily',
          fontWeight: 900,
          fontSize: 17,
          letterSpacing: '.04em',
          whiteSpace: 'nowrap',
          boxShadow: '0 8px 18px rgba(14, 45, 107, .25)',
        }}
      >
        {abierto ? '¡HASTA LUEGO!' : '¡PREGÚNTALE A MIGA!'}
      </Box>
    </Box>
  );
});
