import { TipoPieza } from '../../domain/piezas/tipo-pieza';

export const MODELO_ASISTENTE = Symbol('MODELO_ASISTENTE');

/** Lo que el buscador del portal puede usar de una pregunta en lenguaje natural. */
export interface FiltrosInterpretados {
  palabras: string[];
  tipo: TipoPieza | null;
  /** Primer año de la década: 1913 → 1910. */
  decada: number | null;
}

/** Solo datos que el portal ya muestra: nunca piezas restringidas ni sin publicar. */
export interface PiezaCandidata {
  codigo: string;
  tipo: TipoPieza;
  titulo: string | null;
  descripcion: string | null;
  anio: number | null;
}

export interface Recomendacion {
  mensaje: string;
  codigos: string[];
  sugerencias: string[];
}

export interface ModeloAsistente {
  interpretar(pregunta: string): Promise<FiltrosInterpretados>;

  recomendar(pregunta: string, candidatas: PiezaCandidata[]): Promise<Recomendacion>;
}
