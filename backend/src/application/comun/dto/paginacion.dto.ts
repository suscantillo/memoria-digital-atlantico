import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, Max, Min } from 'class-validator';
import { DireccionOrden } from '../../../domain/comun/paginacion';

export const LIMITE_POR_DEFECTO = 20;
export const LIMITE_MAXIMO = 100;

export class PaginacionDto {
  /** Desde 1 */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pagina: number = 1;

  /** Máximo 100 */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(LIMITE_MAXIMO)
  limite: number = LIMITE_POR_DEFECTO;

  @IsOptional()
  @IsIn(['asc', 'desc'])
  direccion: DireccionOrden = 'asc';
}
