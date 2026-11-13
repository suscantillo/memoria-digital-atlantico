export type TipoPieza = 'DOCUMENTO' | 'FOTOGRAFIA' | 'PERIODICO';
export type EstadoPieza = 'REGISTRADA' | 'ESCANEADA' | 'REVISADA' | 'PUBLICADA';

export interface CrearPieza {
  tipo: TipoPieza;
  titulo: string;
  anio: number;
  ubicacionId: string;
}

export interface Pieza {
  id: string;
  codigo: string;
  titulo: string;
  tipo: TipoPieza;
  estado: EstadoPieza;
  anio: number;
  ubicacionId: string;
  creadoEn: string;
}
