import { IsIn } from 'class-validator';
import { RolUsuario } from '../../../domain/usuarios/rol-usuario';

export class CambiarRolUsuarioDto {
  @IsIn(['ADMIN', 'PERSONAL'])
  rol!: Extract<RolUsuario, 'ADMIN' | 'PERSONAL'>;
}
