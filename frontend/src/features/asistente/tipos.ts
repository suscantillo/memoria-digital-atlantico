import type { PiezaPortal } from '../portal/tipos';

/** Lo más largo que se le puede preguntar a Miga (HU-24, criterio 1). */
export const LIMITE_PREGUNTA = 500;

/**
 * IA: Miga entendió la pregunta con el modelo de lenguaje.
 * BUSQUEDA: no hay clave de IA (o la API del asistente no responde) y se usó el buscador del portal.
 */
export type ModoAsistente = 'IA' | 'BUSQUEDA';

/** POST /asistente/preguntas */
export interface PreguntaAsistente {
  pregunta: string;
}

export interface RespuestaAsistente {
  modo: ModoAsistente;
  /** Lo que Miga le dice a la persona, en una o dos frases. */
  mensaje: string;
  /** Siempre piezas publicadas del catálogo: nunca inventadas. */
  piezas: PiezaPortal[];
  /** Preguntas cortas para seguir explorando. */
  sugerencias: string[];
}

/** Una vuelta de la conversación en pantalla. */
export interface TurnoConversacion {
  id: number;
  pregunta: string;
  respuesta: RespuestaAsistente;
}
