import { Pieza } from '../../../domain/piezas/pieza.entity';
import { TipoPieza } from '../../../domain/piezas/tipo-pieza';

export class ArchivoPortalDto {
  url!: string;
  tipoMime!: string;
}

export class UbicacionPortalDto {
  id!: string;
  deposito!: string;
  estanteria!: string;
  caja!: string;
}

export class PiezaPortalDto {
  codigo!: string;
  tipo!: TipoPieza;
  restringida!: boolean;
  titulo!: string | null;
  descripcion!: string | null;
  anio!: number | null;
  archivo!: ArchivoPortalDto | null;
  ubicacion!: UbicacionPortalDto;

  static desdeEntidad(pieza: Pieza): PiezaPortalDto {
    const dto = new PiezaPortalDto();
    dto.codigo = pieza.codigo.valor;
    dto.tipo = pieza.tipo;
    dto.restringida = pieza.restringida;
    // Una pieza restringida oculta su contenido en el portal y solo expone su tipo y ubicación.
    dto.titulo = pieza.restringida ? null : pieza.titulo;
    dto.descripcion = pieza.restringida ? null : pieza.descripcion;
    dto.anio = pieza.restringida ? null : pieza.anio;
    dto.archivo =
      pieza.restringida || !pieza.archivoAprobado
        ? null
        : {
            url: `/api/v1/archivos/${pieza.archivoAprobado.id}/contenido`,
            tipoMime: pieza.archivoAprobado.tipoMime,
          };
    dto.ubicacion = {
      id: pieza.ubicacion.id,
      deposito: pieza.ubicacion.deposito,
      estanteria: pieza.ubicacion.estanteria,
      caja: pieza.ubicacion.caja,
    };
    return dto;
  }
}
