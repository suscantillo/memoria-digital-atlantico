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

export interface EventoPieza {
  id: string;
  usuarioId: string | null;
  usuarioNombre: string | null;
  accion: string;
  detalle: string | null;
  creadoEn: string;
}

export interface FichaPieza extends Pieza {
  descripcion: string | null;
  actualizadoEn: string;
  ubicacion: {
    id: string;
    deposito: string;
    estanteria: string;
    caja: string;
  };
  eventos: EventoPieza[];
}

export interface EditarPieza {
  titulo?: string;
  descripcion?: string;
}
