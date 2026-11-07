import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { SERVICIO_TOKENS, ServicioTokens } from '../../../application/auth/ports/servicio-tokens';
import { SolicitudAutenticada } from '../solicitud-autenticada';

@Injectable()
export class GuardiaJwt implements CanActivate {
  constructor(@Inject(SERVICIO_TOKENS) private readonly tokens: ServicioTokens) {}

  async canActivate(contexto: ExecutionContext): Promise<boolean> {
    const solicitud = contexto.switchToHttp().getRequest<SolicitudAutenticada>();
    const token = extraerBearer(solicitud.headers.authorization);
    if (!token) {
      throw new UnauthorizedException('Se requiere un token de acceso.');
    }

    try {
      const payload = await this.tokens.verificarAcceso(token);
      solicitud.usuario = { id: payload.sub, correo: payload.correo, rol: payload.rol };
      return true;
    } catch {
      throw new UnauthorizedException('El token de acceso no es válido o expiró.');
    }
  }
}

function extraerBearer(cabecera: string | undefined): string | null {
  if (!cabecera) return null;
  const [esquema, token] = cabecera.split(' ');
  return esquema?.toLowerCase() === 'bearer' && token ? token : null;
}
