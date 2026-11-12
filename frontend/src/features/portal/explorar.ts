import {
  ORDENES_PIEZA_PORTAL,
  TIPOS_PIEZA,
  type OrdenPiezaPortal,
  type ParametrosBuscarPiezas,
  type TipoPieza,
} from './tipos';

export const RUTA_EXPLORAR = '/explorar';
export const PIEZAS_POR_PAGINA = 12;

/** Décadas de la línea de tiempo y del filtro de Explorar. */
export const DECADAS = [1900, 1910, 1920, 1930, 1940, 1950, 1960] as const;

/** Filtros que viven en la dirección, para que una búsqueda se pueda compartir o recargar. */
export interface FiltrosExplorar {
  busqueda: string;
  tipo?: TipoPieza;
  decada?: number;
  orden: OrdenPiezaPortal;
  pagina: number;
}

export function leerFiltros(params: URLSearchParams): FiltrosExplorar {
  const tipo = params.get('tipo');
  const orden = params.get('orden');
  const decada = Number(params.get('decada'));
  const pagina = Number(params.get('pagina'));
  return {
    busqueda: params.get('busqueda') ?? '',
    tipo: TIPOS_PIEZA.includes(tipo as TipoPieza) ? (tipo as TipoPieza) : undefined,
    // el backend solo acepta el primer año de una década
    decada: Number.isInteger(decada) && decada > 0 && decada % 10 === 0 ? decada : undefined,
    orden: ORDENES_PIEZA_PORTAL.includes(orden as OrdenPiezaPortal)
      ? (orden as OrdenPiezaPortal)
      : 'titulo',
    pagina: Number.isInteger(pagina) && pagina > 1 ? pagina : 1,
  };
}

export function aParametrosApi(filtros: FiltrosExplorar): ParametrosBuscarPiezas {
  return {
    busqueda: filtros.busqueda || undefined,
    tipo: filtros.tipo,
    decada: filtros.decada,
    orden: filtros.orden,
    // por año, lo más antiguo primero; por título o código, en orden alfabético
    direccion: 'asc',
    pagina: filtros.pagina,
    limite: PIEZAS_POR_PAGINA,
  };
}

/** Arma /explorar?… sin los valores por defecto, para que la dirección quede corta. */
export function rutaExplorar(filtros: Partial<FiltrosExplorar> = {}): string {
  const params = new URLSearchParams();
  if (filtros.busqueda?.trim()) params.set('busqueda', filtros.busqueda.trim());
  if (filtros.tipo) params.set('tipo', filtros.tipo);
  if (filtros.decada) params.set('decada', String(filtros.decada));
  if (filtros.orden && filtros.orden !== 'titulo') params.set('orden', filtros.orden);
  if (filtros.pagina && filtros.pagina > 1) params.set('pagina', String(filtros.pagina));
  const texto = params.toString();
  return texto ? `${RUTA_EXPLORAR}?${texto}` : RUTA_EXPLORAR;
}
