import type { ResultadoPaginado } from '../../shared/tipos/api';

export type TipoPieza = 'DOCUMENTO' | 'FOTOGRAFIA' | 'PERIODICO';

export interface ArchivoPortal {
  url: string;
  /** application/pdf se muestra página por página; image/* se muestra como imagen. */
  tipoMime: string;
}

/**
 * Lo que devuelve GET /portal/piezas/:codigo. Si la pieza es restringida, el portal solo
 * muestra su tipo y ubicación (glosario), así que el resto llega vacío.
 */
export interface PiezaPortal {
  codigo: string;
  tipo: TipoPieza;
  restringida: boolean;
  titulo: string | null;
  descripcion: string | null;
  anio: number | null;
  /** Copia digital aprobada; null si la pieza aún no se ha digitalizado. */
  archivo: ArchivoPortal | null;
  ubicacion: {
    id: string;
    deposito: string;
    estanteria: string;
    caja: string;
  };
}

/** Un resultado de GET /portal/piezas: solo piezas PUBLICADAS. */
export interface PiezaPortalResumen {
  codigo: string;
  tipo: TipoPieza;
  restringida: boolean;
  titulo: string | null;
  anio: number | null;
  /** Imagen reducida de la copia digital; null si es un PDF o la pieza es restringida. */
  miniatura: string | null;
}

export interface ParametrosBuscarPiezas {
  q?: string;
  tipo?: TipoPieza;
  /** Primer año de la década: 1920 busca de 1920 a 1929. */
  decada?: number;
  ubicacionId?: string;
  pagina: number;
  limite: number;
}

export const NOMBRE_TIPO: Record<TipoPieza, string> = {
  DOCUMENTO: 'Documento',
  FOTOGRAFIA: 'Fotografía',
  PERIODICO: 'Periódico',
};

export type PiezasPortalPaginadas = ResultadoPaginado<PiezaPortalResumen>;

// una pieza restringida no muestra su título; se nombra por su tipo, con el género de cada palabra
const TITULO_RESTRINGIDA: Record<TipoPieza, string> = {
  DOCUMENTO: 'Documento restringido',
  FOTOGRAFIA: 'Fotografía restringida',
  PERIODICO: 'Periódico restringido',
};

export function tituloVisible(pieza: Pick<PiezaPortal, 'restringida' | 'tipo' | 'titulo'>) {
  return pieza.restringida ? TITULO_RESTRINGIDA[pieza.tipo] : (pieza.titulo ?? '');
}
