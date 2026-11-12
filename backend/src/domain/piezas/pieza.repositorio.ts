import { DatosNuevaPieza, Pieza } from './pieza.entity';

export const PIEZA_REPOSITORIO = Symbol('PIEZA_REPOSITORIO');

export interface PiezaRepositorio {
  registrar(datos: DatosNuevaPieza, usuarioId: string): Promise<Pieza>;
import { DireccionOrden, ParametrosPaginacion, ResultadoPaginado } from '../comun/paginacion';
import { CodigoPieza } from './codigo-pieza';
import { Pieza } from './pieza.entity';
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
  buscarPorCodigo(codigo: CodigoPieza): Promise<Pieza | null>;
  /** Solo piezas PUBLICADA. Las restringidas van al final, sin importar el orden pedido. */
  listarPublicadas(params: ParametrosListarPublicadas): Promise<ResultadoPaginado<Pieza>>;
}
