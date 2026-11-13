import { Usuario } from '../../../domain/usuarios/usuario.entity';
import { MetaPaginacionDto, ResultadoPaginadoDto } from '../../comun/dto/resultado-paginado.dto';

/** Una cuenta PUBLICO vista por el ADMIN: sin datos de más, con su consentimiento (Ley 1581). */
export class CuentaPublicaDto {
  id!: string;
  nombre!: string;
  correo!: string;
  activo!: boolean;
  creadoEn!: string;
  consentimientoEn!: string | null;
  versionPrivacidad!: string | null;

  static desdeEntidad(usuario: Usuario): CuentaPublicaDto {
    const dto = new CuentaPublicaDto();
    dto.id = usuario.id;
    dto.nombre = usuario.nombre;
    dto.correo = usuario.correo;
    dto.activo = usuario.activo;
    dto.creadoEn = usuario.creadoEn.toISOString();
    dto.consentimientoEn = usuario.consentimientoEn?.toISOString() ?? null;
    dto.versionPrivacidad = usuario.versionPrivacidad;
    return dto;
  }
}

export class CuentasPublicasPaginadasDto implements ResultadoPaginadoDto<CuentaPublicaDto> {
  datos!: CuentaPublicaDto[];
  meta!: MetaPaginacionDto;
}
