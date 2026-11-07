import { MetaPaginacionDto, ResultadoPaginadoDto } from '../../comun/dto/resultado-paginado.dto';
import { UbicacionDto } from './ubicacion.dto';

export class UbicacionesPaginadasDto implements ResultadoPaginadoDto<UbicacionDto> {
  datos!: UbicacionDto[];
  meta!: MetaPaginacionDto;
}
