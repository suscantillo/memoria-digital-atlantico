import { applyDecorators, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiForbiddenResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { RolUsuario } from '../../../domain/usuarios/rol-usuario';
import { GuardiaJwt } from '../guards/guardia-jwt.guard';
import { GuardiaRoles } from '../guards/guardia-roles.guard';
import { Roles } from './roles.decorator';

export function Autenticado(...roles: RolUsuario[]) {
  return applyDecorators(
    Roles(...roles),
    UseGuards(GuardiaJwt, GuardiaRoles),
    ApiBearerAuth(),
    ApiUnauthorizedResponse({ description: 'Token ausente, inválido o expirado.' }),
    ApiForbiddenResponse({ description: 'El rol del usuario no tiene permiso.' }),
  );
}
