import { FichaPieza } from '../../../domain/piezas/pieza.entity';
import { EstadoPieza } from '../../../domain/piezas/estado-pieza';
import { TipoPieza } from '../../../domain/piezas/tipo-pieza';

export class FichaPiezaDto {
  id!: string;
  codigo!: string;
  titulo!: string;
  descripcion!: string | null;
  tipo!: TipoPieza;
  estado!: EstadoPieza;
  anio!: number | null;
  ubicacion!: FichaPieza['ubicacion'];
  eventos!: Array<{
    id: string;
    usuarioId: string | null;
    usuarioNombre: string | null;
    accion: string;
    detalle: string | null;
    creadoEn: string;
  }>;
  creadoEn!: string;
  actualizadoEn!: string;

  static desdeFicha(ficha: FichaPieza): FichaPiezaDto {
    const dto = new FichaPiezaDto();
    dto.id = ficha.pieza.id;
    dto.codigo = ficha.pieza.codigo.valor;
    dto.titulo = ficha.pieza.titulo;
    dto.descripcion = ficha.pieza.descripcion;
    dto.tipo = ficha.pieza.tipo;
    dto.estado = ficha.pieza.estado;
    dto.anio = ficha.pieza.anio;
    dto.ubicacion = ficha.ubicacion;
    dto.eventos = ficha.eventos.map((evento) => ({
      id: evento.id,
      usuarioId: evento.usuarioId,
      usuarioNombre: evento.usuarioNombre,
      accion: evento.accion,
      detalle: evento.detalle,
      creadoEn: evento.creadoEn.toISOString(),
    }));
    dto.creadoEn = ficha.pieza.creadoEn.toISOString();
    dto.actualizadoEn = ficha.pieza.actualizadoEn.toISOString();
    return dto;
  }
}
