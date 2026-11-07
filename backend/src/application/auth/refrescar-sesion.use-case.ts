import { ErrorNoAutorizado } from '../../domain/comun/errores';
import { SesionRepositorio } from '../../domain/sesiones/sesion.repositorio';
import { UsuarioRepositorio } from '../../domain/usuarios/usuario.repositorio';
import { RefrescarSesionDto } from './dto/refrescar-sesion.dto';
import { SesionIniciadaDto } from './dto/sesion-iniciada.dto';
import { emitirSesion } from './iniciar-sesion.use-case';
import { PayloadRefresco, ServicioTokens } from './ports/servicio-tokens';

export const MENSAJE_SESION_INVALIDA = 'La sesión no es válida o ya expiró.';

export class RefrescarSesion {
  constructor(
    private readonly usuarios: UsuarioRepositorio,
    private readonly sesiones: SesionRepositorio,
    private readonly tokens: ServicioTokens,
  ) {}

  async ejecutar(datos: RefrescarSesionDto): Promise<SesionIniciadaDto> {
    const payload = await verificarRefresco(this.tokens, datos.tokenRefresco);

    const sesion = await this.sesiones.buscarPorJti(payload.jti);
    if (!sesion || !sesion.estaVigente() || sesion.usuarioId !== payload.sub) {
      throw new ErrorNoAutorizado(MENSAJE_SESION_INVALIDA);
    }

    const usuario = await this.usuarios.buscarPorId(sesion.usuarioId);
    if (!usuario || !usuario.puedeIniciarSesion()) {
      throw new ErrorNoAutorizado(MENSAJE_SESION_INVALIDA);
    }

    await this.sesiones.revocar(sesion.id, new Date());
    return emitirSesion(usuario, this.sesiones, this.tokens);
  }
}

export async function verificarRefresco(
  tokens: ServicioTokens,
  token: string,
): Promise<PayloadRefresco> {
  try {
    return await tokens.verificarRefresco(token);
  } catch {
    throw new ErrorNoAutorizado(MENSAJE_SESION_INVALIDA);
  }
}
