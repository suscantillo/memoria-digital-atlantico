import { Usuario } from '../../domain/usuarios/usuario.entity';
import { CorreoUsuarioDuplicadoError } from '../../domain/usuarios/usuario.errores';
import { UsuarioRepositorio } from '../../domain/usuarios/usuario.repositorio';
import { RegistrarUsuarioDto } from './dto/registrar-usuario.dto';
import { UsuarioRegistradoDto } from './dto/usuario-registrado.dto';
import { HasherContrasenas } from './ports/hasher-contrasenas';

export class RegistrarUsuario {
  constructor(
    private readonly usuarios: UsuarioRepositorio,
    private readonly hasher: HasherContrasenas,
  ) {}

  async ejecutar(datos: RegistrarUsuarioDto): Promise<UsuarioRegistradoDto> {
    const correo = datos.correo.trim().toLowerCase();
    if (await this.usuarios.buscarPorCorreo(correo)) {
      throw new CorreoUsuarioDuplicadoError(correo);
    }

    const usuario = Usuario.registrarPublico({
      nombre: datos.nombre,
      correo,
      contrasenaHash: await this.hasher.hash(datos.contrasena),
      aceptaPrivacidad: datos.aceptaPrivacidad,
      versionPrivacidad: datos.versionPrivacidad,
    });
    const creado = await this.usuarios.crear(usuario);
    return UsuarioRegistradoDto.desdeEntidad(creado);
  }
}
