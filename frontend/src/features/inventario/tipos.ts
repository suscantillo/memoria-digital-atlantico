import type { DireccionOrden, ResultadoPaginado } from '../../shared/tipos/api';

export const TIPOS_PIEZA = ['DOCUMENTO', 'FOTOGRAFIA', 'PERIODICO'] as const;
export type TipoPieza = (typeof TIPOS_PIEZA)[number];

export const ESTADOS_PIEZA = ['REGISTRADA', 'ESCANEADA', 'REVISADA', 'PUBLICADA'] as const;
export type EstadoPieza = (typeof ESTADOS_PIEZA)[number];

export type CampoOrdenInventario = 'codigo' | 'titulo' | 'anio' | 'estado' | 'actualizadoEn';

export interface PiezaInventario {
  id: string;
  codigo: string;
  titulo: string;
  tipo: TipoPieza;
  estado: EstadoPieza;
  anio: number | null;
  restringida: boolean;
  ubicacion: { id: string; deposito: string; estanteria: string; caja: string };
  actualizadoEn: string;
}

export type InventarioPaginado = ResultadoPaginado<PiezaInventario>;

export interface ParametrosInventario {
  pagina: number;
  limite: number;
  orden: CampoOrdenInventario;
  direccion: DireccionOrden;
  busqueda?: string;
  tipo?: TipoPieza;
  estado?: EstadoPieza;
  ubicacionId?: string;
}

export const NOMBRE_TIPO: Record<TipoPieza, string> = {
  DOCUMENTO: 'Documento',
  FOTOGRAFIA: 'Fotografía',
  PERIODICO: 'Periódico',
};
