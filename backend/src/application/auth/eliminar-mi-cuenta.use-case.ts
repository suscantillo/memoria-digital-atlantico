import { ErrorNoAutorizado, ErrorProhibido, ErrorRegla } from '../../domain/comun/errores';
import { UsuarioRepositorio } from '../../domain/usuarios/usuario.repositorio';
import { EliminarMiCuentaDto } from './dto/eliminar-mi-cuenta.dto';
import { HasherContrasenas } from './ports/hasher-contrasenas';

export const MENSAJE_CONTRASENA_INCORRECTA = 'La contraseña no es correcta.';

export class EliminarMiCuenta {
  constructor(
    private readonly usuarios: Pick<UsuarioRepositorio, 'buscarPorId' | 'eliminar'>,
    private readonly hasher: HasherContrasenas,
  ) {}

  async ejecutar(usuarioId: string, datos: EliminarMiCuentaDto): Promise<void> {
    const usuario = await this.usuarios.buscarPorId(usuarioId);
    if (!usuario || !usuario.puedeIniciarSesion()) {
      throw new ErrorNoAutorizado('El usuario no existe o está inactivo.');
    }
    if (!usuario.puedeEliminarSuCuenta()) {
      throw new ErrorProhibido(
        'Las cuentas del personal no se eliminan desde aquí; las desactiva el administrador.',
      );
    }

    // 422 y no 401: un 401 haría que el portal intentara renovar la sesión en vez de avisar.
    const coincide = await this.hasher.comparar(datos.contrasena, usuario.contrasenaHash);
    if (!coincide) throw new ErrorRegla(MENSAJE_CONTRASENA_INCORRECTA);

    await this.usuarios.eliminar(usuario.id);
  }
}
