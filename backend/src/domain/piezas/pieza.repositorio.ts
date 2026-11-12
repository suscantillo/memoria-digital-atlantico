import { DireccionOrden, ParametrosPaginacion, ResultadoPaginado } from '../comun/paginacion';
import { CodigoPieza } from './codigo-pieza';
import { DatosNuevaPieza, Pieza } from './pieza.entity';
import { TipoPieza } from './tipo-pieza';

export const PIEZA_REPOSITORIO = Symbol('PIEZA_REPOSITORIO');

export const CAMPOS_ORDEN_PIEZA_PORTAL = ['titulo', 'anio', 'codigo'] as const;

export type CampoOrdenPiezaPortal = (typeof CAMPOS_ORDEN_PIEZA_PORTAL)[number];

export interface FiltrosPiezasPublicadas {
  texto?: string;
  tipo?: TipoPieza;
  decada?: number;
  incluirRestringidas: boolean;
}

export interface ParametrosListarPublicadas extends ParametrosPaginacion {
  filtros: FiltrosPiezasPublicadas;
  orden: CampoOrdenPiezaPortal;
  direccion: DireccionOrden;
}

export interface PiezaRepositorio {
  registrar(datos: DatosNuevaPieza, usuarioId: string): Promise<Pieza>;

  buscarPorCodigo(codigo: CodigoPieza): Promise<Pieza | null>;

  listarPublicadas(params: ParametrosListarPublicadas): Promise<ResultadoPaginado<Pieza>>;
}
