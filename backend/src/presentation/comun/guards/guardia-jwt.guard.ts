import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import {
  PayloadAcceso,
  SERVICIO_TOKENS,
  ServicioTokens,
} from '../../../application/auth/ports/servicio-tokens';
import {
  USUARIO_REPOSITORIO,
  UsuarioRepositorio,
} from '../../../domain/usuarios/usuario.repositorio';
import { SolicitudAutenticada } from '../solicitud-autenticada';

@Injectable()
export class GuardiaJwt implements CanActivate {
  constructor(
    @Inject(SERVICIO_TOKENS) private readonly tokens: ServicioTokens,
    @Inject(USUARIO_REPOSITORIO) private readonly usuarios: UsuarioRepositorio,
  ) {}

  async canActivate(contexto: ExecutionContext): Promise<boolean> {
    const solicitud = contexto.switchToHttp().getRequest<SolicitudAutenticada>();
    const token = extraerBearer(solicitud.headers.authorization);
    if (!token) {
      throw new UnauthorizedException('Se requiere un token de acceso.');
    }

    let payload: PayloadAcceso;
    try {
      payload = await this.tokens.verificarAcceso(token);
    } catch {
      throw new UnauthorizedException('El token de acceso no es válido o expiró.');
    }

    const usuario = await this.usuarios.buscarPorId(payload.sub);
    if (!usuario?.activo) {
      throw new UnauthorizedException('La cuenta está inactiva o ya no existe.');
    }

    solicitud.usuario = { id: usuario.id, correo: usuario.correo, rol: usuario.rol };
    return true;
  }
}

function extraerBearer(cabecera: string | undefined): string | null {
  if (!cabecera) return null;
  const [esquema, token] = cabecera.split(' ');
  return esquema?.toLowerCase() === 'bearer' && token ? token : null;
}
