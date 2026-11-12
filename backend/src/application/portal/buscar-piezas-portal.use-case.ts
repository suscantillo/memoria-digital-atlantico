import { PiezaRepositorio } from '../../domain/piezas/pieza.repositorio';
import { ResultadoPaginadoDto } from '../comun/dto/resultado-paginado.dto';
import { BuscarPiezasPortalDto } from './dto/buscar-piezas-portal.dto';
import { PiezaPortalDto } from './dto/pieza-portal.dto';

export class BuscarPiezasPortal {
  constructor(private readonly piezas: PiezaRepositorio) {}

  async ejecutar(consulta: BuscarPiezasPortalDto): Promise<ResultadoPaginadoDto<PiezaPortalDto>> {
    const texto = consulta.busqueda?.trim() || undefined;
    // Buscar por texto o década sobre una pieza restringida revelaría el título o el año que el portal oculta.
    const filtraPorDatosOcultos = texto !== undefined || consulta.decada !== undefined;

    const resultado = await this.piezas.listarPublicadas({
      pagina: consulta.pagina,
      limite: consulta.limite,
      orden: consulta.orden,
      direccion: consulta.direccion,
      filtros: {
        texto,
        tipo: consulta.tipo,
        decada: consulta.decada,
        incluirRestringidas: !filtraPorDatosOcultos,
      },
    });

    return {
      datos: resultado.datos.map((pieza) => PiezaPortalDto.desdeEntidad(pieza)),
      meta: resultado.meta,
    };
  }
}
