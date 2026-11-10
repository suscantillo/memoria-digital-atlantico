import { CambiosPieza, DatosNuevaPieza, FichaPieza, Pieza } from './pieza.entity';

export const PIEZA_REPOSITORIO = Symbol('PIEZA_REPOSITORIO');

export interface PiezaRepositorio {
  registrar(datos: DatosNuevaPieza, usuarioId: string): Promise<Pieza>;
  buscarFicha(id: string): Promise<FichaPieza | null>;
  editar(id: string, cambios: CambiosPieza, usuarioId: string): Promise<FichaPieza>;
}
