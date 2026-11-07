export interface RespuestaError {
  statusCode: number;
  message: string;
  errors?: string[];
  path: string;
  timestamp: string;
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

export type DireccionOrden = 'asc' | 'desc';
