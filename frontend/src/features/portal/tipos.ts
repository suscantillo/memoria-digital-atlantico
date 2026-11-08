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

export const NOMBRE_TIPO: Record<TipoPieza, string> = {
  DOCUMENTO: 'Documento',
  FOTOGRAFIA: 'Fotografía',
  PERIODICO: 'Periódico',
};
