import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SERVICIO_TOKENS, ServicioTokens } from '../../../application/auth/ports/servicio-tokens';
import { esRutaPublica } from '../decoradores/publica.decorator';
import { SolicitudAutenticada } from '../solicitud-autenticada';

@Injectable()
export class GuardiaJwt implements CanActivate {
  constructor(
    @Inject(SERVICIO_TOKENS) private readonly tokens: ServicioTokens,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(contexto: ExecutionContext): Promise<boolean> {
    if (esRutaPublica(this.reflector, contexto)) {
      return true;
    }

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
