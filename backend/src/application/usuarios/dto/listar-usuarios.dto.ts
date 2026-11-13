import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import { PaginacionDto } from '../../comun/dto/paginacion.dto';

export class ListarUsuariosDto extends PaginacionDto {
  @IsOptional()
  @IsIn(['nombre', 'correo', 'rol', 'creadoEn'])
  @MaxLength(20)
  orden: 'nombre' | 'correo' | 'rol' | 'creadoEn' = 'nombre';

  @IsOptional()
  @IsString()
  @MaxLength(200)
  busqueda?: string;
}
