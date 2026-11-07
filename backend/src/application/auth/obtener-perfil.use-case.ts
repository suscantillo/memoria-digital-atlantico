import { ErrorNoAutorizado } from '../../domain/comun/errores';
import { UsuarioRepositorio } from '../../domain/usuarios/usuario.repositorio';
import { UsuarioDto } from './dto/usuario.dto';

export class ObtenerPerfil {
  constructor(private readonly usuarios: UsuarioRepositorio) {}

  async ejecutar(usuarioId: string): Promise<UsuarioDto> {
    const usuario = await this.usuarios.buscarPorId(usuarioId);
    if (!usuario || !usuario.puedeIniciarSesion()) {
      throw new ErrorNoAutorizado('El usuario no existe o está inactivo.');
    }
    return UsuarioDto.desdeEntidad(usuario);
  }
}
