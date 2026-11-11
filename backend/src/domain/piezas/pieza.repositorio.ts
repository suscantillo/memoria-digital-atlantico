import { Pieza } from './pieza.entity';

export const PIEZA_REPOSITORIO = Symbol('PIEZA_REPOSITORIO');

export interface PiezaRepositorio {
  buscarPorCodigo(codigo: string): Promise<Pieza | null>;
}
