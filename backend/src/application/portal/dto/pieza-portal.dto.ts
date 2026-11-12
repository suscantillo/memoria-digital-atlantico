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
  /** false: la pieza existe pero aún no está PUBLICADA; el portal solo dice dónde está el original. */
  digitalizada!: boolean;
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
    dto.digitalizada = pieza.estaPublicada();
    // Restringida o aún sin publicar: el portal solo expone su tipo y su ubicación.
    const oculta = pieza.restringida || !dto.digitalizada;
    dto.titulo = oculta ? null : pieza.titulo;
    dto.descripcion = oculta ? null : pieza.descripcion;
    dto.anio = oculta ? null : pieza.anio;
    dto.archivo =
      oculta || !pieza.archivoAprobado
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
