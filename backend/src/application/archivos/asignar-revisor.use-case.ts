import {
  ArchivoNoEncontradoError,
  ArchivoYaRevisadoError,
} from '../../domain/archivos/archivo-digital.entity';
import { ArchivoDigitalRepositorio } from '../../domain/archivos/archivo-digital.repositorio';
import { ErrorRegla } from '../../domain/comun/errores';
import { ArchivoDigitalDto } from './dto/archivo-digital.dto';
import { Revisores } from './puertos';

export class RevisorNoDisponibleError extends ErrorRegla {
  constructor() {
    super('El revisor debe ser una cuenta PERSONAL activa.');
  }
}

/**
 * HU-23: el ADMIN asigna (o cambia, mientras siga EN_REVISION) quién revisa un escaneo. La
 * asignación queda en el historial de la pieza.
 */
export class AsignarRevisor {
  constructor(
    private readonly archivos: ArchivoDigitalRepositorio,
    private readonly revisores: Revisores,
  ) {}

  async ejecutar(
    archivoId: string,
    revisorId: string,
    asignadoPorId: string,
  ): Promise<ArchivoDigitalDto> {
    const archivo = await this.archivos.buscarPorId(archivoId);
    if (!archivo) {
      throw new ArchivoNoEncontradoError(archivoId);
    }
    // primero las reglas del escaneo: ya revisado (409) o quien lo subió (422, criterio 4)
    archivo.asignarRevisor(revisorId);

    const revisor = await this.revisores.buscarDisponible(revisorId);
    if (!revisor) {
      throw new RevisorNoDisponibleError();
    }

    const guardada = await this.archivos.guardarAsignacion(archivo, asignadoPorId, {
      accion: 'REVISOR_ASIGNADO',
      detalle: `Revisión de «${archivo.nombreOriginal}» asignada a ${revisor.nombre}.`,
    });
    const detalle = await this.archivos.buscarDetalle(archivoId);
    if (!detalle) {
      throw new ArchivoNoEncontradoError(archivoId);
    }
    if (!guardada) {
      throw new ArchivoYaRevisadoError(detalle.estado);
    }
    return ArchivoDigitalDto.desde(detalle);
  }
}
