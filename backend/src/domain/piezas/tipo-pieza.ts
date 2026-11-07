export const TIPOS_PIEZA = ['DOCUMENTO', 'FOTOGRAFIA', 'PERIODICO'] as const;
export type TipoPieza = (typeof TIPOS_PIEZA)[number];
