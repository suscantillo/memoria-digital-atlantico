import type { DireccionOrden, ResultadoPaginado } from '../../shared/tipos/api';

export interface Ubicacion {
  id: string;
  deposito: string;
  estanteria: string;
  caja: string;
  descripcion: string | null;
  etiqueta: string;
  creadoEn: string;
  actualizadoEn: string;
}

export type CampoOrdenUbicacion = 'deposito' | 'estanteria' | 'caja' | 'creadoEn';

export interface ParametrosListarUbicaciones {
  pagina: number;
  limite: number;
  orden: CampoOrdenUbicacion;
  direccion: DireccionOrden;
  busqueda?: string;
  deposito?: string;
}

export interface CrearUbicacion {
  deposito: string;
  estanteria: string;
  caja: string;
  descripcion?: string;
}

export type UbicacionesPaginadas = ResultadoPaginado<Ubicacion>;
