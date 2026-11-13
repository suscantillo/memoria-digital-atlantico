import { ErrorRegla } from '../../domain/comun/errores';
import { UsuarioRepositorio } from '../../domain/usuarios/usuario.repositorio';
import { UsuarioAdministradoDto } from './dto/usuario-administrado.dto';

export class DesactivarUsuario {
  constructor(private readonly usuarios: UsuarioRepositorio) {}

  async ejecutar(id: string, administradorId: string): Promise<UsuarioAdministradoDto> {
    if (id === administradorId) {
      throw new ErrorRegla('No puedes desactivar tu propia cuenta.');
    }
    return UsuarioAdministradoDto.desdeEntidad(await this.usuarios.desactivar(id, new Date()));
  }
}
