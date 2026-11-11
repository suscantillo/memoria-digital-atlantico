import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolUsuario } from '../../../domain/usuarios/rol-usuario';
import { esRutaPublica } from '../decoradores/publica.decorator';
import { CLAVE_ROLES } from '../decoradores/roles.decorator';
import { SolicitudAutenticada } from '../solicitud-autenticada';

@Injectable()
export class GuardiaRoles implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(contexto: ExecutionContext): boolean {
    if (esRutaPublica(this.reflector, contexto)) {
      return true;
    }

    const roles = this.reflector.getAllAndOverride<RolUsuario[] | undefined>(CLAVE_ROLES, [
      contexto.getHandler(),
      contexto.getClass(),
    ]);
    if (!roles || roles.length === 0) {
      return true;
    }

    const { usuario } = contexto.switchToHttp().getRequest<SolicitudAutenticada>();
    if (!usuario || !roles.includes(usuario.rol)) {
      throw new ForbiddenException('No tienes permisos para realizar esta acción.');
    }
    return true;
  }
}
