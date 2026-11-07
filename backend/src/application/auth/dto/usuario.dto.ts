import { RolUsuario } from '../../../domain/usuarios/rol-usuario';
import { Usuario } from '../../../domain/usuarios/usuario.entity';

export class UsuarioDto {
  id!: string;
  nombre!: string;
  correo!: string;
  rol!: RolUsuario;

  static desdeEntidad(usuario: Usuario): UsuarioDto {
    const dto = new UsuarioDto();
    dto.id = usuario.id;
    dto.nombre = usuario.nombre;
    dto.correo = usuario.correo;
    dto.rol = usuario.rol;
    return dto;
  }
}
