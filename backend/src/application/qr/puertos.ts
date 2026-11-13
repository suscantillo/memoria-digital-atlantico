import { CodigoPieza } from '../../domain/piezas/codigo-pieza';

export const CODIGOS_DE_PIEZA = Symbol('CODIGOS_DE_PIEZA');
export const GENERADOR_QR = Symbol('GENERADOR_QR');

/** Encuentra el código de una pieza por su id, sin importar su estado. */
export interface CodigosDePieza {
  codigoPorId(id: string): Promise<CodigoPieza | null>;
}

/** Convierte un texto en la imagen PNG de su código QR. */
export interface GeneradorQr {
  png(texto: string): Promise<Buffer>;
}
