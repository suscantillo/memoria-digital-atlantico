import { UsuarioRepositorio } from '../../domain/usuarios/usuario.repositorio';
import { UsuarioAdministradoDto } from './dto/usuario-administrado.dto';

export class ReactivarUsuario {
  constructor(private readonly usuarios: UsuarioRepositorio) {}

  async ejecutar(id: string): Promise<UsuarioAdministradoDto> {
    return UsuarioAdministradoDto.desdeEntidad(await this.usuarios.reactivar(id));
  }
}
