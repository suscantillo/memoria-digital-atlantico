import { InventarioPaginadoDto, PiezaInventarioDto } from './dto/pieza-inventario.dto';
import { ListarInventarioDto } from './dto/listar-inventario.dto';
import { InventarioPiezas } from './puertos';

/** HU-07: el personal lista todas las piezas, en cualquier estado, con filtros, páginas y orden. */
export class ListarInventario {
  constructor(private readonly inventario: InventarioPiezas) {}

  async ejecutar(consulta: ListarInventarioDto): Promise<InventarioPaginadoDto> {
    const resultado = await this.inventario.listar({
      pagina: consulta.pagina,
      limite: consulta.limite,
      orden: consulta.orden,
      direccion: consulta.direccion,
      filtros: {
        texto: consulta.busqueda?.trim() || undefined,
        tipo: consulta.tipo,
        estado: consulta.estado,
        ubicacionId: consulta.ubicacionId,
      },
    });
    return {
      datos: resultado.datos.map((fila) => PiezaInventarioDto.desdeFila(fila)),
      meta: resultado.meta,
    };
  }
}
