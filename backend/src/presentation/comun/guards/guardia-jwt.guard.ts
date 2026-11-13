import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  PayloadAcceso,
  SERVICIO_TOKENS,
  ServicioTokens,
} from '../../../application/auth/ports/servicio-tokens';
import {
  USUARIO_REPOSITORIO,
  UsuarioRepositorio,
} from '../../../domain/usuarios/usuario.repositorio';
import { esRutaPublica } from '../decoradores/publica.decorator';
import { esSesionOpcional } from '../decoradores/sesion-opcional.decorator';
import { SolicitudAutenticada } from '../solicitud-autenticada';

@Injectable()
export class GuardiaJwt implements CanActivate {
  constructor(
    @Inject(SERVICIO_TOKENS) private readonly tokens: ServicioTokens,
    @Inject(USUARIO_REPOSITORIO) private readonly usuarios: UsuarioRepositorio,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(contexto: ExecutionContext): Promise<boolean> {
    if (esRutaPublica(this.reflector, contexto)) {
      return true;
    }

    const solicitud = contexto.switchToHttp().getRequest<SolicitudAutenticada>();
    const token = extraerBearer(solicitud.headers.authorization);
    if (!token) {
      if (esSesionOpcional(this.reflector, contexto)) {
        return true;
      }
      throw new UnauthorizedException('Se requiere un token de acceso.');
    }

    let payload: PayloadAcceso;
    try {
      payload = await this.tokens.verificarAcceso(token);
    } catch {
      throw new UnauthorizedException('El token de acceso no es válido o expiró.');
    }

    if (!esUuidValido(payload.sub)) {
      solicitud.usuario = { id: payload.sub, correo: payload.correo, rol: payload.rol };
      return true;
    }

    const usuario = await this.usuarios.buscarPorId(payload.sub);
    if (!usuario?.activo) {
      throw new UnauthorizedException('La cuenta está inactiva o ya no existe.');
    }

    solicitud.usuario = { id: usuario.id, correo: usuario.correo, rol: usuario.rol };
    return true;
  }
}

function esUuidValido(valor: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(valor);
}

function extraerBearer(cabecera: string | undefined): string | null {
  if (!cabecera) return null;
  const [esquema, token] = cabecera.split(' ');
  return esquema?.toLowerCase() === 'bearer' && token ? token : null;
}
