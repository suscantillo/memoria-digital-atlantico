import { MetaPaginacion } from '../../../domain/comun/paginacion';

export class MetaPaginacionDto implements MetaPaginacion {
  pagina!: number;
  limite!: number;
  total!: number;
  totalPaginas!: number;
}

export interface ResultadoPaginadoDto<T> {
  datos: T[];
  meta: MetaPaginacionDto;
}
