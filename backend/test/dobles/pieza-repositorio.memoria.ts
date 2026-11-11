import { CodigoPieza } from '../../src/domain/piezas/codigo-pieza';
import { Pieza } from '../../src/domain/piezas/pieza.entity';
import { PiezaRepositorio } from '../../src/domain/piezas/pieza.repositorio';

export class PiezaRepositorioMemoria implements PiezaRepositorio {
  readonly piezas = new Map<string, Pieza>();

  agregar(pieza: Pieza): void {
    this.piezas.set(pieza.codigo.valor, pieza);
  }

  buscarPorCodigo(codigo: CodigoPieza): Promise<Pieza | null> {
    return Promise.resolve(this.piezas.get(codigo.valor) ?? null);
  }
}
