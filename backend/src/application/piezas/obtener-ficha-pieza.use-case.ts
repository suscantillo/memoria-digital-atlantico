import { ErrorNoEncontrado } from '../../domain/comun/errores';
import { PiezaRepositorio } from '../../domain/piezas/pieza.repositorio';
import { FichaPiezaDto } from './dto/ficha-pieza.dto';

export class ObtenerFichaPieza {
  constructor(private readonly piezas: PiezaRepositorio) {}

  async ejecutar(id: string): Promise<FichaPiezaDto> {
    const ficha = await this.piezas.buscarFicha(id);
    if (!ficha) {
      throw new ErrorNoEncontrado(`No se encontró la pieza "${id}".`);
    }
    return FichaPiezaDto.desdeFicha(ficha);
  }
}
