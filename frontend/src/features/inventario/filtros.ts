import type { DireccionOrden } from '../../shared/tipos/api';
import {
  ESTADOS_PIEZA,
  TIPOS_PIEZA,
  type CampoOrdenInventario,
  type EstadoPieza,
  type ParametrosInventario,
  type TipoPieza,
} from './tipos';

export const PIEZAS_POR_PAGINA = 15;

/** Cada opción del selector «Ordenar» es un campo con su dirección. */
export const ORDENES = {
  codigo: { etiqueta: 'Código', orden: 'codigo', direccion: 'asc' },
  titulo: { etiqueta: 'Título', orden: 'titulo', direccion: 'asc' },
  recientes: { etiqueta: 'Más recientes', orden: 'actualizadoEn', direccion: 'desc' },
  anio: { etiqueta: 'Año', orden: 'anio', direccion: 'asc' },
  estado: { etiqueta: 'Estado', orden: 'estado', direccion: 'asc' },
} as const satisfies Record<
  string,
  { etiqueta: string; orden: CampoOrdenInventario; direccion: DireccionOrden }
>;
export type ClaveOrden = keyof typeof ORDENES;

/** Los filtros viven en la dirección: se pueden compartir, recargar y volver atrás. */
export interface FiltrosInventario {
  busqueda: string;
  tipo?: TipoPieza;
  estado?: EstadoPieza;
  ubicacionId?: string;
  orden: ClaveOrden;
  pagina: number;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function leerFiltros(params: URLSearchParams): FiltrosInventario {
  const tipo = params.get('tipo');
  const estado = params.get('estado');
  const caja = params.get('caja');
  const orden = params.get('orden');
  const pagina = Number(params.get('pagina'));
  return {
    busqueda: params.get('busqueda') ?? '',
    tipo: TIPOS_PIEZA.includes(tipo as TipoPieza) ? (tipo as TipoPieza) : undefined,
    estado: ESTADOS_PIEZA.includes(estado as EstadoPieza) ? (estado as EstadoPieza) : undefined,
    ubicacionId: caja && UUID.test(caja) ? caja : undefined,
    orden: orden && orden in ORDENES ? (orden as ClaveOrden) : 'codigo',
    pagina: Number.isInteger(pagina) && pagina > 1 ? pagina : 1,
  };
}

export function escribirFiltros(filtros: FiltrosInventario): URLSearchParams {
  const params = new URLSearchParams();
  if (filtros.busqueda.trim()) params.set('busqueda', filtros.busqueda.trim());
  if (filtros.tipo) params.set('tipo', filtros.tipo);
  if (filtros.estado) params.set('estado', filtros.estado);
  if (filtros.ubicacionId) params.set('caja', filtros.ubicacionId);
  if (filtros.orden !== 'codigo') params.set('orden', filtros.orden);
  if (filtros.pagina > 1) params.set('pagina', String(filtros.pagina));
  return params;
}

export function aParametrosApi(filtros: FiltrosInventario): ParametrosInventario {
  const { orden, direccion } = ORDENES[filtros.orden];
  return {
    pagina: filtros.pagina,
    limite: PIEZAS_POR_PAGINA,
    orden,
    direccion,
    busqueda: filtros.busqueda || undefined,
    tipo: filtros.tipo,
    estado: filtros.estado,
    ubicacionId: filtros.ubicacionId,
  };
}
