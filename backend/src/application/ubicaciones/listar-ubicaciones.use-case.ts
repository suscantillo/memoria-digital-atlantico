import { UbicacionRepositorio } from '../../domain/ubicaciones/ubicacion.repositorio';
import { ResultadoPaginadoDto } from '../comun/dto/resultado-paginado.dto';
import { ListarUbicacionesDto } from './dto/listar-ubicaciones.dto';
import { UbicacionDto } from './dto/ubicacion.dto';

export class ListarUbicaciones {
  constructor(private readonly ubicaciones: UbicacionRepositorio) {}

  async ejecutar(consulta: ListarUbicacionesDto): Promise<ResultadoPaginadoDto<UbicacionDto>> {
    const resultado = await this.ubicaciones.listar({
      pagina: consulta.pagina,
      limite: consulta.limite,
      orden: consulta.orden,
      direccion: consulta.direccion,
      filtros: {
        busqueda: consulta.busqueda?.trim() || undefined,
        deposito: consulta.deposito?.trim() || undefined,
      },
    });

    return {
      datos: resultado.datos.map((u) => UbicacionDto.desdeEntidad(u)),
      meta: resultado.meta,
    };
  }
}
