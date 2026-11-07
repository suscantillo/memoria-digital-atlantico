export type DireccionOrden = 'asc' | 'desc';

export interface ParametrosPaginacion {
  pagina: number;
  limite: number;
}

export interface MetaPaginacion {
  pagina: number;
  limite: number;
  total: number;
  totalPaginas: number;
}

export interface ResultadoPaginado<T> {
  datos: T[];
  meta: MetaPaginacion;
}

export function construirMeta(params: ParametrosPaginacion, total: number): MetaPaginacion {
  return {
    pagina: params.pagina,
    limite: params.limite,
    total,
    totalPaginas: total === 0 ? 0 : Math.ceil(total / params.limite),
  };
}
