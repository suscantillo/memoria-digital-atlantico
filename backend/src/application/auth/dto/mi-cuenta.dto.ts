import { RolUsuario } from '../../../domain/usuarios/rol-usuario';
import { Usuario } from '../../../domain/usuarios/usuario.entity';

/** Todo lo que el sistema guarda de la persona, salvo el hash de su contraseña (Ley 1581). */
export class MiCuentaDto {
  id!: string;
  nombre!: string;
  correo!: string;
  rol!: RolUsuario;
  /** Cuándo aceptó el aviso de privacidad; null en las cuentas del personal. */
  consentimientoEn!: Date | null;
  versionPrivacidad!: string | null;
  creadoEn!: Date;
  /** false en las cuentas del personal: esas las desactiva el ADMIN. */
  puedeEliminarla!: boolean;

  static desdeEntidad(usuario: Usuario): MiCuentaDto {
    const dto = new MiCuentaDto();
    dto.id = usuario.id;
    dto.nombre = usuario.nombre;
    dto.correo = usuario.correo;
    dto.rol = usuario.rol;
    dto.consentimientoEn = usuario.consentimientoEn;
    dto.versionPrivacidad = usuario.versionPrivacidad;
    dto.creadoEn = usuario.creadoEn;
    dto.puedeEliminarla = usuario.puedeEliminarSuCuenta();
    return dto;
  }
}
