import { CodigoPieza } from './codigo-pieza';
import { Pieza } from './pieza.entity';

export const PIEZA_REPOSITORIO = Symbol('PIEZA_REPOSITORIO');

export interface PiezaRepositorio {
  buscarPorCodigo(codigo: CodigoPieza): Promise<Pieza | null>;
}
