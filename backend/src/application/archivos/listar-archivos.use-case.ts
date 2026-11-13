import { QuienRevisa } from '../../domain/archivos/archivo-digital.entity';
import {
  ArchivoDigitalRepositorio,
  ParametrosListarArchivos,
} from '../../domain/archivos/archivo-digital.repositorio';
import { ArchivoDigitalDto, ArchivosPaginadosDto } from './dto/archivo-digital.dto';
import { ListarArchivosDto } from './dto/listar-archivos.dto';

/**
 * Lista escaneos. El ADMIN filtra como quiera; un PERSONAL solo ve los que le asignaron para
 * revisar o, con subidoPor=yo, los que él subió (HU-23).
 */
export class ListarArchivos {
  constructor(private readonly archivos: ArchivoDigitalRepositorio) {}

  async ejecutar(consulta: ListarArchivosDto, quien: QuienRevisa): Promise<ArchivosPaginadosDto> {
    const resultado = await this.archivos.listar({
      pagina: consulta.pagina,
      limite: consulta.limite,
      estado: consulta.estado,
      orden: consulta.orden,
      direccion: consulta.direccion,
      ...this.alcance(consulta, quien),
    });
    return {
      datos: resultado.datos.map((detalle) => ArchivoDigitalDto.desde(detalle)),
      meta: resultado.meta,
    };
  }

  private alcance(
    consulta: ListarArchivosDto,
    quien: QuienRevisa,
  ): Pick<ParametrosListarArchivos, 'revisorId' | 'subidoPorId'> {
    const subidoPorId = consulta.subidoPor === 'yo' ? quien.id : undefined;
    if (quien.rol !== 'ADMIN') {
      // criterio 3: lo que no tiene revisor, o es de otra persona, no aparece en su cola
      return subidoPorId ? { subidoPorId } : { revisorId: quien.id };
    }
    const revisorId =
      consulta.revisor === undefined
        ? undefined
        : consulta.revisor === 'yo'
          ? quien.id
          : consulta.revisor === 'ninguno'
            ? null
            : consulta.revisor;
    return { revisorId, subidoPorId };
  }
}
