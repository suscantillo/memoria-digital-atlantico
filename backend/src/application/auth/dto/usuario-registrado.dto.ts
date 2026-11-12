import { RolUsuario } from '../../../domain/usuarios/rol-usuario';
import { Usuario } from '../../../domain/usuarios/usuario.entity';

export class UsuarioRegistradoDto {
  id!: string;
  nombre!: string;
  correo!: string;
  rol!: RolUsuario;
  consentimientoEn!: string | null;
  versionPrivacidad!: string | null;

  static desdeEntidad(usuario: Usuario): UsuarioRegistradoDto {
    const dto = new UsuarioRegistradoDto();
    dto.id = usuario.id;
    dto.nombre = usuario.nombre;
    dto.correo = usuario.correo;
    dto.rol = usuario.rol;
    dto.consentimientoEn = usuario.consentimientoEn?.toISOString() ?? null;
    dto.versionPrivacidad = usuario.versionPrivacidad;
    return dto;
  }
}
