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

    // Una pieza sin publicar también responde (HU-14): su QR ya está pegado en la caja y quien lo
    // escanee debe saber dónde pedirla. El DTO oculta todo menos el tipo y la ubicación.
    if (!pieza) {
      throw new PiezaNoEncontradaError(codigo.valor);
    }

    return PiezaPortalDto.desdeEntidad(pieza);
  }
}
