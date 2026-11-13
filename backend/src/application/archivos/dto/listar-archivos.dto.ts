import { IsIn, IsOptional, Matches } from 'class-validator';
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

  /**
   * HU-23: «yo» (lo asignado a quien pregunta), «ninguno» (sin revisor) o el id de una cuenta.
   * Un PERSONAL siempre ve solo lo suyo.
   */
  @IsOptional()
  @Matches(/^(yo|ninguno|[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i, {
    message: 'revisor debe ser «yo», «ninguno» o el id de una cuenta.',
  })
  revisor?: string;

  /** «Mis escaneos»: solo los que subió quien pregunta */
  @IsOptional()
  @IsIn(['yo'])
  subidoPor?: 'yo';

  /** Por defecto el más antiguo primero: se revisa en orden de llegada */
  @IsOptional()
  @IsIn(CAMPOS_ORDEN_ARCHIVO)
  orden: CampoOrdenArchivo = 'creadoEn';
}
