import { MetaPaginacionDto, ResultadoPaginadoDto } from '../../comun/dto/resultado-paginado.dto';
import { PiezaPortalDto } from './pieza-portal.dto';

export class PiezasPortalPaginadasDto implements ResultadoPaginadoDto<PiezaPortalDto> {
  datos!: PiezaPortalDto[];
  meta!: MetaPaginacionDto;
}
