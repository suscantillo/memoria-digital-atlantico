import { PiezaNoEncontradaError } from '../../domain/piezas/pieza.entity';
import { PiezaRepositorio } from '../../domain/piezas/pieza.repositorio';
import { PiezaPortalDto } from './dto/pieza-portal.dto';

export class ObtenerPiezaPortal {
  constructor(private readonly piezas: PiezaRepositorio) {}

  async ejecutar(codigo: string): Promise<PiezaPortalDto> {
    const codigoLimpio = codigo.trim().toUpperCase();
    const pieza = await this.piezas.buscarPorCodigo(codigoLimpio);
    if (!pieza) {
      throw new PiezaNoEncontradaError(codigoLimpio || codigo);
    }
    return PiezaPortalDto.desdeEntidad(pieza);
  }
}
