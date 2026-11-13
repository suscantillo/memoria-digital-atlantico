import { Type } from 'class-transformer';
import {
  IsDivisibleBy,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import {
  CAMPOS_ORDEN_PIEZA_PORTAL,
  CampoOrdenPiezaPortal,
} from '../../../domain/piezas/pieza.repositorio';
import { TIPOS_PIEZA, TipoPieza } from '../../../domain/piezas/tipo-pieza';
import { PaginacionDto } from '../../comun/dto/paginacion.dto';

export class BuscarPiezasPortalDto extends PaginacionDto {
  /** Busca en título y descripción */
  @IsOptional()
  @IsString()
  @MaxLength(100)
  busqueda?: string;

  @IsOptional()
  @IsIn(TIPOS_PIEZA)
  tipo?: TipoPieza;

  /** Primer año de la década. Ej: 1920 trae de 1920 a 1929 */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1500)
  @Max(2090)
  @IsDivisibleBy(10, { message: 'decada debe ser el primer año de una década, por ejemplo 1920' })
  decada?: number;

  @IsOptional()
  @IsIn(CAMPOS_ORDEN_PIEZA_PORTAL)
  orden: CampoOrdenPiezaPortal = 'titulo';
}
