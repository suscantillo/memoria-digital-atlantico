import {
  ArchivoNoEncontradoError,
  ArchivoYaRevisadoError,
} from '../../domain/archivos/archivo-digital.entity';
import {
  ArchivoDigitalRepositorio,
  EventoRevision,
  RevisionEscaneo,
} from '../../domain/archivos/archivo-digital.repositorio';
import { ArchivoDigitalDto } from './dto/archivo-digital.dto';

/** Lo común de aprobar y rechazar: cargar archivo y pieza, aplicar la decisión y guardarla. */
export abstract class RevisarEscaneo {
  constructor(protected readonly archivos: ArchivoDigitalRepositorio) {}

  protected async revisar(
    archivoId: string,
    decidir: (revision: RevisionEscaneo) => EventoRevision,
  ): Promise<ArchivoDigitalDto> {
    const revision = await this.archivos.buscarRevision(archivoId);
    if (!revision) {
      throw new ArchivoNoEncontradoError(archivoId);
    }
    const evento = decidir(revision);

    const guardada = await this.archivos.guardarRevision(revision, evento);
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
