import { ErrorNoAutorizado } from '../../domain/comun/errores';
import { Sesion } from '../../domain/sesiones/sesion.entity';
import { SesionRepositorio } from '../../domain/sesiones/sesion.repositorio';
import { Usuario } from '../../domain/usuarios/usuario.entity';
import { UsuarioRepositorio } from '../../domain/usuarios/usuario.repositorio';
import { IniciarSesionDto } from './dto/iniciar-sesion.dto';
import { SesionIniciadaDto } from './dto/sesion-iniciada.dto';
import { UsuarioDto } from './dto/usuario.dto';
import { HasherContrasenas } from './ports/hasher-contrasenas';
import { ServicioTokens } from './ports/servicio-tokens';

export const MENSAJE_CREDENCIALES_INVALIDAS = 'Correo o contraseña incorrectos.';

export class IniciarSesion {
  constructor(
    private readonly usuarios: UsuarioRepositorio,
    private readonly sesiones: SesionRepositorio,
    private readonly hasher: HasherContrasenas,
    private readonly tokens: ServicioTokens,
  ) {}

  async ejecutar(datos: IniciarSesionDto): Promise<SesionIniciadaDto> {
    const usuario = await this.usuarios.buscarPorCorreo(datos.correo.trim().toLowerCase());
    if (!usuario || !usuario.puedeIniciarSesion()) {
      throw new ErrorNoAutorizado(MENSAJE_CREDENCIALES_INVALIDAS);
    }

    const coincide = await this.hasher.comparar(datos.contrasena, usuario.contrasenaHash);
    if (!coincide) {
      throw new ErrorNoAutorizado(MENSAJE_CREDENCIALES_INVALIDAS);
    }

    return emitirSesion(usuario, this.sesiones, this.tokens);
  }
}

export async function emitirSesion(
  usuario: Usuario,
  sesiones: SesionRepositorio,
  tokens: ServicioTokens,
): Promise<SesionIniciadaDto> {
  const sesion = Sesion.crear({
    usuarioId: usuario.id,
    expiraEn: new Date(Date.now() + tokens.duracionRefrescoMs()),
  });
  await sesiones.guardar(sesion);

  const respuesta = new SesionIniciadaDto();
  respuesta.tokenAcceso = await tokens.firmarAcceso({
    sub: usuario.id,
    correo: usuario.correo,
    rol: usuario.rol,
  });
  respuesta.tokenRefresco = await tokens.firmarRefresco({ sub: usuario.id, jti: sesion.jti });
  respuesta.usuario = UsuarioDto.desdeEntidad(usuario);
  return respuesta;
}
