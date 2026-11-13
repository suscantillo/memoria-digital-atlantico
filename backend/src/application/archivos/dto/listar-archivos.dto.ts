import { IsIn, IsOptional } from 'class-validator';
import {
  CAMPOS_ORDEN_ARCHIVO,
  CampoOrdenArchivo,
} from '../../../domain/archivos/archivo-digital.repositorio';
import {
  ESTADOS_ARCHIVO_DIGITAL,
  EstadoArchivoDigital,
} from '../../../domain/archivos/estado-archivo-digital';
import { PaginacionDto } from '../../comun/dto/paginacion.dto';

export class ListarArchivosDto extends PaginacionDto {
  /** La cola de control de calidad es estado=EN_REVISION */
  @IsOptional()
  @IsIn(ESTADOS_ARCHIVO_DIGITAL)
  estado?: EstadoArchivoDigital;

  /** Por defecto el más antiguo primero: se revisa en orden de llegada */
  @IsOptional()
  @IsIn(CAMPOS_ORDEN_ARCHIVO)
  orden: CampoOrdenArchivo = 'creadoEn';
}
