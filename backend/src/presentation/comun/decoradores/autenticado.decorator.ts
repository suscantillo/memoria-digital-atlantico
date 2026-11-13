import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiForbiddenResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { RolUsuario } from '../../../domain/usuarios/rol-usuario';
import { Roles } from './roles.decorator';

/**
 * Indica qué roles pueden usar la ruta; sin roles, basta con tener sesión.
 * Las guardias ya corren en todas las rutas (APP_GUARD en AppModule); esto solo fija los roles
 * y documenta el 401 y el 403 en Swagger.
 */
export function Autenticado(...roles: RolUsuario[]) {
  return applyDecorators(
    Roles(...roles),
    ApiBearerAuth(),
    ApiUnauthorizedResponse({ description: 'Token ausente, inválido o expirado.' }),
    ApiForbiddenResponse({ description: 'El rol del usuario no tiene permiso.' }),
  );
}
