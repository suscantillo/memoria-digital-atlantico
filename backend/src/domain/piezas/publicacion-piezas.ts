import { EstadoPieza } from './estado-pieza';

export const PUBLICACION_PIEZAS = Symbol('PUBLICACION_PIEZAS');

/** Un cambio de estado de publicación con su evento para el historial. */
export interface CambioPublicacion {
  piezaId: string;
  desde: EstadoPieza;
  hacia: EstadoPieza;
  usuarioId: string;
  accion: string;
  detalle: string;
}

export interface PublicacionPiezas {
  /**
   * Cambia el estado y deja el evento, todo o nada. Devuelve false si la pieza ya no estaba en
   * `desde` (otra persona la cambió mientras tanto).
   */
  cambiarPublicacion(cambio: CambioPublicacion): Promise<boolean>;
}
