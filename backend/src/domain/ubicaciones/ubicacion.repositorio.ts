import { DireccionOrden, ParametrosPaginacion, ResultadoPaginado } from '../comun/paginacion';
import { TernaUbicacion, Ubicacion } from './ubicacion.entity';

export const UBICACION_REPOSITORIO = Symbol('UBICACION_REPOSITORIO');

export const CAMPOS_ORDEN_UBICACION = ['deposito', 'estanteria', 'caja', 'creadoEn'] as const;
export type CampoOrdenUbicacion = (typeof CAMPOS_ORDEN_UBICACION)[number];

export interface FiltrosUbicacion {
  busqueda?: string;
  deposito?: string;
}

export interface ParametrosListarUbicaciones extends ParametrosPaginacion {
  filtros: FiltrosUbicacion;
  orden: CampoOrdenUbicacion;
  direccion: DireccionOrden;
}

export interface UbicacionRepositorio {
  guardar(ubicacion: Ubicacion): Promise<Ubicacion>;
  buscarPorId(id: string): Promise<Ubicacion | null>;
  buscarPorTerna(terna: TernaUbicacion): Promise<Ubicacion | null>;
  listar(params: ParametrosListarUbicaciones): Promise<ResultadoPaginado<Ubicacion>>;
}
