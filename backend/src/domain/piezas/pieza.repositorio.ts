import { DatosNuevaPieza, Pieza } from './pieza.entity';

export const PIEZA_REPOSITORIO = Symbol('PIEZA_REPOSITORIO');

export interface PiezaRepositorio {
  registrar(datos: DatosNuevaPieza, usuarioId: string): Promise<Pieza>;
}
