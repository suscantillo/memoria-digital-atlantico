import type { DireccionOrden, ResultadoPaginado } from '../../shared/tipos/api';

export type TipoPieza = 'DOCUMENTO' | 'FOTOGRAFIA' | 'PERIODICO';
export type EstadoPieza = 'REGISTRADA' | 'ESCANEADA' | 'REVISADA' | 'PUBLICADA';

export const ESTADOS_PIEZA: EstadoPieza[] = ['REGISTRADA', 'ESCANEADA', 'REVISADA', 'PUBLICADA'];

export const NOMBRE_TIPO: Record<TipoPieza, string> = {
  DOCUMENTO: 'Documento',
  FOTOGRAFIA: 'Fotografía',
  PERIODICO: 'Periódico',
};

/** Fila de GET /piezas: la pieza que devuelve POST /piezas, más su ubicación y si es restringida. */
export interface PiezaInventario {
  id: string;
  codigo: string;
  titulo: string;
  tipo: TipoPieza;
  estado: EstadoPieza;
  anio: number;
  restringida: boolean;
  creadoEn: string;
  ubicacion: { id: string; etiqueta: string };
}

export type CampoOrdenPieza = 'codigo' | 'titulo' | 'creadoEn';

export interface ParametrosListarPiezas {
  pagina: number;
  limite: number;
  orden: CampoOrdenPieza;
  direccion: DireccionOrden;
  busqueda?: string;
  estado?: EstadoPieza;
  tipo?: TipoPieza;
  ubicacionId?: string;
}

export type PiezasPaginadas = ResultadoPaginado<PiezaInventario>;

/** GET /piezas/contadores (HU-18): cuántas piezas hay en cada estado. */
export type ContadoresPiezas = Record<EstadoPieza, number> & { total: number };
