import { ErrorRegla } from '../../domain/comun/errores';
import { CodigoPieza } from '../../domain/piezas/codigo-pieza';
import { PiezaNoEncontradaError } from '../../domain/piezas/pieza.entity';
import { PiezaRepositorio } from '../../domain/piezas/pieza.repositorio';
import { PiezaPortalDto } from './dto/pieza-portal.dto';

export class ObtenerPiezaPortal {
  constructor(private readonly piezas: Pick<PiezaRepositorio, 'buscarPorCodigo'>) {}

  async ejecutar(codigoTexto: string): Promise<PiezaPortalDto> {
    let codigo: CodigoPieza;

    try {
      codigo = CodigoPieza.desde(codigoTexto);
    } catch (error) {
      if (error instanceof ErrorRegla) {
        throw new PiezaNoEncontradaError(codigoTexto);
      }

      throw error;
    }

    const pieza = await this.piezas.buscarPorCodigo(codigo);

    if (!pieza || !pieza.estaPublicada()) {
      throw new PiezaNoEncontradaError(codigo.valor);
    }

    return PiezaPortalDto.desdeEntidad(pieza);
  }
}
