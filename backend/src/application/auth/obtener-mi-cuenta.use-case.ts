import { ErrorNoAutorizado } from '../../domain/comun/errores';
import { UsuarioRepositorio } from '../../domain/usuarios/usuario.repositorio';
import { MiCuentaDto } from './dto/mi-cuenta.dto';

export class ObtenerMiCuenta {
  constructor(private readonly usuarios: Pick<UsuarioRepositorio, 'buscarPorId'>) {}

  async ejecutar(usuarioId: string): Promise<MiCuentaDto> {
    const usuario = await this.usuarios.buscarPorId(usuarioId);
    if (!usuario || !usuario.puedeIniciarSesion()) {
      throw new ErrorNoAutorizado('El usuario no existe o está inactivo.');
    }
    return MiCuentaDto.desdeEntidad(usuario);
  }
}
