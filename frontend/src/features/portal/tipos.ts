import type { DireccionOrden, ResultadoPaginado } from '../../shared/tipos/api';

export const TIPOS_PIEZA = ['DOCUMENTO', 'FOTOGRAFIA', 'PERIODICO'] as const;
export type TipoPieza = (typeof TIPOS_PIEZA)[number];

export const ORDENES_PIEZA_PORTAL = ['titulo', 'anio', 'codigo'] as const;
export type OrdenPiezaPortal = (typeof ORDENES_PIEZA_PORTAL)[number];

export interface ArchivoPortal {
  url: string;
  tipoMime: string;
}

export interface UbicacionPortal {
  id: string;
  deposito: string;
  estanteria: string;
  caja: string;
}

/**
 * Ficha pública. Si la pieza es restringida o aún no está digitalizada, título, descripción, año y
 * archivo llegan en null: solo se sabe su tipo y dónde está el original.
 */
export interface PiezaPortal {
  codigo: string;
  tipo: TipoPieza;
  restringida: boolean;
  /** false: está registrada pero todavía no publicada; se consulta en sala. */
  digitalizada: boolean;
  titulo: string | null;
  descripcion: string | null;
  anio: number | null;
  archivo: ArchivoPortal | null;
  ubicacion: UbicacionPortal;
}

export type PiezasPortalPaginadas = ResultadoPaginado<PiezaPortal>;

export interface ParametrosBuscarPiezas {
  busqueda?: string;
  tipo?: TipoPieza;
  /** Primer año de la década: 1920 trae de 1920 a 1929. */
  decada?: number;
  orden?: OrdenPiezaPortal;
  direccion?: DireccionOrden;
  pagina?: number;
  limite?: number;
}

export const NOMBRE_TIPO: Record<TipoPieza, { singular: string; plural: string }> = {
  DOCUMENTO: { singular: 'Documento', plural: 'Documentos' },
  FOTOGRAFIA: { singular: 'Fotografía', plural: 'Fotografías' },
  PERIODICO: { singular: 'Periódico', plural: 'Periódicos' },
};
