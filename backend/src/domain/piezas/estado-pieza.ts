export const ESTADOS_PIEZA = ['REGISTRADA', 'ESCANEADA', 'REVISADA', 'PUBLICADA'] as const;
export type EstadoPieza = (typeof ESTADOS_PIEZA)[number];
