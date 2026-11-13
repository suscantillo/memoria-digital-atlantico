import { DetalleArchivoDigital } from '../../../domain/archivos/archivo-digital.repositorio';
import { EstadoArchivoDigital } from '../../../domain/archivos/estado-archivo-digital';
import { EstadoPieza } from '../../../domain/piezas/estado-pieza';
import { TipoPieza } from '../../../domain/piezas/tipo-pieza';
import { MetaPaginacionDto, ResultadoPaginadoDto } from '../../comun/dto/resultado-paginado.dto';

export class UsuarioDelArchivoDto {
  nombre!: string;
  correo!: string;
}

export class PiezaDelArchivoDto {
  id!: string;
  codigo!: string;
  titulo!: string;
  tipo!: TipoPieza;
  estado!: EstadoPieza;
  anio!: number | null;
  tema!: string | null;
  autor!: string | null;
  palabrasClave!: string[];
}

export class ArchivoDigitalDto {
  id!: string;
  nombreOriginal!: string;
  tipoMime!: string;
  tamanoBytes!: number;
  estado!: EstadoArchivoDigital;
  motivoRechazo!: string | null;
  creadoEn!: string;
  revisadoEn!: string | null;
  /** Ruta para ver el escaneo; pide la misma sesión del panel */
  url!: string;
  subidoPor!: UsuarioDelArchivoDto;
  pieza!: PiezaDelArchivoDto;

  static desde(detalle: DetalleArchivoDigital): ArchivoDigitalDto {
    const dto = new ArchivoDigitalDto();
    dto.id = detalle.id;
    dto.nombreOriginal = detalle.nombreOriginal;
    dto.tipoMime = detalle.tipoMime;
    dto.tamanoBytes = detalle.tamanoBytes;
    dto.estado = detalle.estado;
    dto.motivoRechazo = detalle.motivoRechazo;
    dto.creadoEn = detalle.creadoEn.toISOString();
    dto.revisadoEn = detalle.revisadoEn ? detalle.revisadoEn.toISOString() : null;
    dto.url = `/api/v1/archivos/${detalle.id}/contenido`;
    dto.subidoPor = { ...detalle.subidoPor };
    dto.pieza = { ...detalle.pieza, palabrasClave: [...detalle.pieza.palabrasClave] };
    return dto;
  }
}

export class ArchivosPaginadosDto implements ResultadoPaginadoDto<ArchivoDigitalDto> {
  datos!: ArchivoDigitalDto[];
  meta!: MetaPaginacionDto;
}
