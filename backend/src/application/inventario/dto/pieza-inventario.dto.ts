import { MetaPaginacionDto, ResultadoPaginadoDto } from '../../comun/dto/resultado-paginado.dto';
import { EstadoPieza } from '../../../domain/piezas/estado-pieza';
import { TipoPieza } from '../../../domain/piezas/tipo-pieza';
import { FilaInventario } from '../puertos';

export class UbicacionInventarioDto {
  id!: string;
  deposito!: string;
  estanteria!: string;
  caja!: string;
}

export class PiezaInventarioDto {
  id!: string;
  codigo!: string;
  titulo!: string;
  tipo!: TipoPieza;
  estado!: EstadoPieza;
  anio!: number | null;
  restringida!: boolean;
  ubicacion!: UbicacionInventarioDto;
  actualizadoEn!: string;

  static desdeFila(fila: FilaInventario): PiezaInventarioDto {
    const dto = new PiezaInventarioDto();
    dto.id = fila.id;
    dto.codigo = fila.codigo;
    dto.titulo = fila.titulo;
    dto.tipo = fila.tipo;
    dto.estado = fila.estado;
    dto.anio = fila.anio;
    dto.restringida = fila.restringida;
    dto.ubicacion = { ...fila.ubicacion };
    dto.actualizadoEn = fila.actualizadoEn.toISOString();
    return dto;
  }
}

export class InventarioPaginadoDto implements ResultadoPaginadoDto<PiezaInventarioDto> {
  datos!: PiezaInventarioDto[];
  meta!: MetaPaginacionDto;
}
