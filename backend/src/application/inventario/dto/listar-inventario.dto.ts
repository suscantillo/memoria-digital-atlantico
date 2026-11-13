import { IsIn, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import { ESTADOS_PIEZA, EstadoPieza } from '../../../domain/piezas/estado-pieza';
import { TIPOS_PIEZA, TipoPieza } from '../../../domain/piezas/tipo-pieza';
import { PaginacionDto } from '../../comun/dto/paginacion.dto';
import { CAMPOS_ORDEN_INVENTARIO, CampoOrdenInventario } from '../puertos';

export class ListarInventarioDto extends PaginacionDto {
  /** Busca en código, título y descripción */
  @IsOptional()
  @IsString()
  @MaxLength(100)
  busqueda?: string;

  @IsOptional()
  @IsIn(TIPOS_PIEZA)
  tipo?: TipoPieza;

  @IsOptional()
  @IsIn(ESTADOS_PIEZA)
  estado?: EstadoPieza;

  /** Id de la ubicación: depósito, estantería y caja */
  @IsOptional()
  @IsUUID()
  ubicacionId?: string;

  @IsOptional()
  @IsIn(CAMPOS_ORDEN_INVENTARIO)
  orden: CampoOrdenInventario = 'codigo';
}
