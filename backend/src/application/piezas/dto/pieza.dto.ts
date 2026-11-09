import { Pieza } from '../../../domain/piezas/pieza.entity';
import { EstadoPieza } from '../../../domain/piezas/estado-pieza';
import { TipoPieza } from '../../../domain/piezas/tipo-pieza';

export class PiezaDto {
  id!: string;

  codigo!: string;

  titulo!: string;

  tipo!: TipoPieza;

  estado!: EstadoPieza;

  anio!: number;

  ubicacionId!: string;

  creadoEn!: string;

  static desdeEntidad(pieza: Pieza): PiezaDto {
    const dto = new PiezaDto();
    dto.id = pieza.id;
    dto.codigo = pieza.codigo.valor;
    dto.titulo = pieza.titulo;
    dto.tipo = pieza.tipo;
    dto.estado = pieza.estado;
    dto.anio = pieza.anio;
    dto.ubicacionId = pieza.ubicacionId;
    dto.creadoEn = pieza.creadoEn.toISOString();
    return dto;
  }
}
