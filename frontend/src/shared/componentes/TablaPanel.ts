import { colores } from '../../app/tema';
import { FUENTE_FICHA } from './EncabezadoPanel';

export const LINEA_PUNTEADA = '1px dashed #EBD9B0';

/** Caja blanca con la sombra de papel que envuelve las tablas del panel. */
export const estiloCajaTabla = {
  // minWidth y position contienen la tabla ancha y su texto oculto: sin ellos empujan la página
  // hacia el lado en vez de desplazarse dentro de la caja
  minWidth: 0,
  position: 'relative',
  bgcolor: '#FFFFFF',
  borderRadius: 4,
  overflow: 'hidden',
  boxShadow: '0 6px 0 #F5D79E',
} as const;

export const estiloTablaPanel = {
  '& th': {
    fontFamily: FUENTE_FICHA,
    fontWeight: 700,
    fontSize: 13,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    color: colores.azulMarino,
    borderBottom: '2px dashed #EBD9B0',
    py: 1.75,
  },
  '& td': { borderBottom: LINEA_PUNTEADA, py: 1.25, fontSize: 15 },
  '& tbody tr:last-of-type td': { borderBottom: 0 },
  '& tbody tr:hover': { bgcolor: '#FFF8EA' },
} as const;

// en sx, width: 1 sería el 100 %; el texto oculto necesita medir un píxel de verdad
export const soloLectores = {
  position: 'absolute',
  width: '1px',
  height: '1px',
  overflow: 'hidden',
  clip: 'rect(0 0 0 0)',
  whiteSpace: 'nowrap',
} as const;
