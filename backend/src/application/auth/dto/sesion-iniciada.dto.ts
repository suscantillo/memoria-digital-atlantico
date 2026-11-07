import { UsuarioDto } from './usuario.dto';

export class SesionIniciadaDto {
  tokenAcceso!: string;
  tokenRefresco!: string;
  usuario!: UsuarioDto;
}
