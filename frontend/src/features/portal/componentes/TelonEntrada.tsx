import Box from '@mui/material/Box';
import { keyframes } from '@mui/material/styles';
import { useState, type AnimationEvent } from 'react';
import { colores } from '../../../app/tema';
import { curvaRebote } from './animaciones';
import { SelloGiratorio } from './HeroAduana';

const levantar = keyframes`
  to { transform: translateY(-100%); }
`;

const brotar = keyframes`
  from { opacity: 0; scale: 0; rotate: -160deg; }
  to { opacity: 1; scale: 1; rotate: 0deg; }
`;

const asomar = keyframes`
  from { opacity: 0; transform: translateY(40px); }
  to { opacity: 1; transform: none; }
`;

/** Segundo en que el telón empieza a subir; la portada arranca su entrada en ese momento. */
export const DURACION_TELON = 1.05;

/** Telón azul con el sello que se levanta y descubre la portada en la primera visita. */
export function TelonEntrada() {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;

  // los hijos también disparan animationend; solo cuenta el del telón
  const alTerminar = (evento: AnimationEvent<HTMLDivElement>) => {
    if (evento.target === evento.currentTarget) setVisible(false);
  };

  return (
    <Box
      aria-hidden
      onAnimationEnd={alTerminar}
      sx={{
        position: 'fixed',
        inset: 0,
        zIndex: (t) => t.zIndex.modal + 1,
        // decorativo: nunca debe tapar un clic ni el foco del teclado
        pointerEvents: 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 3,
        bgcolor: colores.azulMarino,
        borderBottom: `14px solid ${colores.amarillo}`,
        animation: `${levantar} .75s cubic-bezier(.76, 0, .24, 1) ${DURACION_TELON}s both`,
      }}
    >
      <Box sx={{ animation: `${brotar} .8s ${curvaRebote} .1s both` }}>
        <SelloGiratorio tamano={150} />
      </Box>
      <Box
        sx={{
          fontFamily: 'h1.fontFamily',
          fontWeight: 900,
          fontSize: 'clamp(30px, 7vw, 56px)',
          letterSpacing: '-0.02em',
          textTransform: 'uppercase',
          color: '#FFFFFF',
          animation: `${asomar} .7s ${curvaRebote} .35s both`,
        }}
      >
        Memoria{' '}
        <Box component="span" sx={{ color: colores.amarillo }}>
          Digital
        </Box>
      </Box>
    </Box>
  );
}
