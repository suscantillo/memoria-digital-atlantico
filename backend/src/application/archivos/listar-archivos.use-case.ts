import { ArchivoDigitalRepositorio } from '../../domain/archivos/archivo-digital.repositorio';
import { ArchivoDigitalDto, ArchivosPaginadosDto } from './dto/archivo-digital.dto';
import { ListarArchivosDto } from './dto/listar-archivos.dto';

export class ListarArchivos {
  constructor(private readonly archivos: ArchivoDigitalRepositorio) {}

  async ejecutar(consulta: ListarArchivosDto): Promise<ArchivosPaginadosDto> {
    const resultado = await this.archivos.listar({
      pagina: consulta.pagina,
      limite: consulta.limite,
      estado: consulta.estado,
      orden: consulta.orden,
      direccion: consulta.direccion,
    });
    return {
      datos: resultado.datos.map((detalle) => ArchivoDigitalDto.desde(detalle)),
      meta: resultado.meta,
    };
  }
}
