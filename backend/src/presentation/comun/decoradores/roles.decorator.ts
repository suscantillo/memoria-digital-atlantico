import { SetMetadata } from '@nestjs/common';
import { RolUsuario } from '../../../domain/usuarios/rol-usuario';

export const CLAVE_ROLES = 'roles';

export const Roles = (...roles: RolUsuario[]) => SetMetadata(CLAVE_ROLES, roles);
