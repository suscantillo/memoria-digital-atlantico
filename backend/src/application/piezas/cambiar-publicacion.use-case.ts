import { ErrorConflicto, ErrorNoEncontrado } from '../../domain/comun/errores';
import { Pieza } from '../../domain/piezas/pieza.entity';
import { PiezaRepositorio } from '../../domain/piezas/pieza.repositorio';
import { CambioPublicacion, PublicacionPiezas } from '../../domain/piezas/publicacion-piezas';
import { FichaPiezaDto } from './dto/ficha-pieza.dto';

type Repositorio = Pick<PiezaRepositorio, 'buscarFicha'>;

/** Lo común de retirar y volver a publicar: aplicar la regla, guardar con candado y devolver la ficha. */
abstract class CambiarPublicacion {
  constructor(
    private readonly piezas: Repositorio,
    private readonly publicacion: PublicacionPiezas,
  ) {}

  protected async cambiar(
    id: string,
    usuarioId: string,
    aplicar: (pieza: Pieza) => Omit<CambioPublicacion, 'piezaId' | 'usuarioId' | 'hacia'>,
  ): Promise<FichaPiezaDto> {
    const ficha = await this.piezas.buscarFicha(id);
    if (!ficha) {
      throw new ErrorNoEncontrado(`No se encontró la pieza "${id}".`);
    }
    const cambio = aplicar(ficha.pieza);
    const guardado = await this.publicacion.cambiarPublicacion({
      ...cambio,
      piezaId: id,
      usuarioId,
      hacia: ficha.pieza.estado,
    });
    if (!guardado) {
      throw new ErrorConflicto('La pieza cambió de estado mientras tanto. Recarga la ficha.');
    }
    const actualizada = await this.piezas.buscarFicha(id);
    if (!actualizada) {
      throw new ErrorNoEncontrado(`No se encontró la pieza "${id}".`);
    }
    return FichaPiezaDto.desdeFicha(actualizada);
  }
}

/** El ADMIN saca una pieza del portal sin borrarla; el motivo queda en el historial. */
export class RetirarPieza extends CambiarPublicacion {
  ejecutar(id: string, motivo: string, usuarioId: string): Promise<FichaPiezaDto> {
    return this.cambiar(id, usuarioId, (pieza) => {
      pieza.retirarDelPortal();
      return {
        desde: 'PUBLICADA',
        accion: 'RETIRADA',
        detalle: `Retirada del portal: ${motivo.trim()}`,
      };
    });
  }
}

/** El ADMIN publica otra vez una pieza retirada que conserva su escaneo aprobado. */
export class VolverAPublicarPieza extends CambiarPublicacion {
  ejecutar(id: string, usuarioId: string): Promise<FichaPiezaDto> {
    return this.cambiar(id, usuarioId, (pieza) => {
      pieza.volverAPublicar();
      return {
        desde: 'REVISADA',
        accion: 'PUBLICADA',
        detalle: 'Publicada de nuevo en el portal.',
      };
    });
  }
}
