import { HasherContrasenas } from '../auth/ports/hasher-contrasenas';
import { CorreoUsuarioDuplicadoError } from '../../domain/usuarios/usuario.errores';
import { Usuario } from '../../domain/usuarios/usuario.entity';
import { UsuarioRepositorio } from '../../domain/usuarios/usuario.repositorio';
import { CrearCuentaPersonalDto } from './dto/crear-cuenta-personal.dto';
import { UsuarioAdministradoDto } from './dto/usuario-administrado.dto';

export class CrearCuentaPersonal {
  constructor(
    private readonly usuarios: UsuarioRepositorio,
    private readonly hasher: HasherContrasenas,
  ) {}

  async ejecutar(datos: CrearCuentaPersonalDto): Promise<UsuarioAdministradoDto> {
    const correo = datos.correo.trim().toLowerCase();
    if (await this.usuarios.buscarPorCorreo(correo)) {
      throw new CorreoUsuarioDuplicadoError(correo);
    }

    const usuario = Usuario.crear({
      nombre: datos.nombre,
      correo,
      contrasenaHash: await this.hasher.hash(datos.contrasenaTemporal),
      rol: 'PERSONAL',
    });
    const creado = await this.usuarios.crear(usuario);
    return UsuarioAdministradoDto.desdeEntidad(creado);
  }
}
