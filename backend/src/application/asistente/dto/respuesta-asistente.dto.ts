import { PiezaPortalDto } from '../../portal/dto/pieza-portal.dto';

export const MODOS_ASISTENTE = ['IA', 'BUSQUEDA'] as const;

export type ModoAsistente = (typeof MODOS_ASISTENTE)[number];

export class RespuestaAsistenteDto {
  /** El backend siempre responde IA; BUSQUEDA es el respaldo del frontend cuando esta ruta responde 503. */
  modo!: ModoAsistente;
  mensaje!: string;
  /** Siempre piezas publicadas y no restringidas del catálogo. */
  piezas!: PiezaPortalDto[];
  sugerencias!: string[];
}
