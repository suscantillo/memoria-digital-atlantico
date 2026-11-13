import { MetaPaginacionDto, ResultadoPaginadoDto } from '../../comun/dto/resultado-paginado.dto';
import { Usuario } from '../../../domain/usuarios/usuario.entity';

export class UsuarioAdministradoDto {
  id!: string;
  nombre!: string;
  correo!: string;
  rol!: Usuario['rol'];
  activo!: boolean;
  creadoEn!: string;

  static desdeEntidad(usuario: Usuario): UsuarioAdministradoDto {
    const dto = new UsuarioAdministradoDto();
    dto.id = usuario.id;
    dto.nombre = usuario.nombre;
    dto.correo = usuario.correo;
    dto.rol = usuario.rol;
    dto.activo = usuario.activo;
    dto.creadoEn = usuario.creadoEn.toISOString();
    return dto;
  }
}

export class UsuariosPaginadosDto implements ResultadoPaginadoDto<UsuarioAdministradoDto> {
  datos!: UsuarioAdministradoDto[];
  meta!: MetaPaginacionDto;
}
