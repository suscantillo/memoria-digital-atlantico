import { ErrorRegla } from '../../domain/comun/errores';
import { RolUsuario } from '../../domain/usuarios/rol-usuario';
import { UsuarioRepositorio } from '../../domain/usuarios/usuario.repositorio';
import { UsuarioAdministradoDto } from './dto/usuario-administrado.dto';

export class CambiarRolUsuario {
  constructor(private readonly usuarios: UsuarioRepositorio) {}

  async ejecutar(id: string, rol: RolUsuario, administradorId: string) {
    if (id === administradorId) {
      throw new ErrorRegla('No puedes cambiar tu propio rol.');
    }
    return UsuarioAdministradoDto.desdeEntidad(await this.usuarios.cambiarRol(id, rol, new Date()));
  }
}
