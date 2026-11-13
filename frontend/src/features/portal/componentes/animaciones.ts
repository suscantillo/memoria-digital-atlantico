import { keyframes } from '@mui/material/styles';

// usa propiedades sueltas (translate, rotate, scale) y no transform, que ya lo ocupa el paralaje
const llegar = keyframes`
  from {
    opacity: 0;
    translate: var(--dx, 0) var(--dy, 0);
    rotate: var(--dr, 0deg);
    scale: var(--ds, 1);
  }
  to { opacity: 1; translate: 0 0; rotate: 0deg; scale: 1; }
`;

export const curvaRebote = 'cubic-bezier(.34, 1.45, .64, 1)';

interface Desde {
  dx?: number;
  dy?: number;
  dr?: number;
  ds?: number;
}

/** Entrada de cada pieza: llega desde un desplazamiento, giro y escala y aterriza con rebote. */
export function entrada(animar: boolean, retraso: number, desde: Desde, duracion = 0.9) {
  if (!animar) return {};
  return {
    '--dx': `${desde.dx ?? 0}px`,
    '--dy': `${desde.dy ?? 0}px`,
    '--dr': `${desde.dr ?? 0}deg`,
    '--ds': desde.ds ?? 1,
    animation: `${llegar} ${duracion}s ${curvaRebote} ${retraso}s both`,
  };
}
