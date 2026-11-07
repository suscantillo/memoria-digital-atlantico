import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import {
  CAMPOS_ORDEN_UBICACION,
  CampoOrdenUbicacion,
} from '../../../domain/ubicaciones/ubicacion.repositorio';
import { PaginacionDto } from '../../comun/dto/paginacion.dto';

export class ListarUbicacionesDto extends PaginacionDto {
  /** Busca en depósito, estantería, caja y descripción */
  @IsOptional()
  @IsString()
  @MaxLength(100)
  busqueda?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  deposito?: string;

  @IsOptional()
  @IsIn(CAMPOS_ORDEN_UBICACION)
  orden: CampoOrdenUbicacion = 'deposito';
}
