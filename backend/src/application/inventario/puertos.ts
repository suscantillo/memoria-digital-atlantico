import {
  DireccionOrden,
  ParametrosPaginacion,
  ResultadoPaginado,
} from '../../domain/comun/paginacion';
import { EstadoPieza } from '../../domain/piezas/estado-pieza';
import { TipoPieza } from '../../domain/piezas/tipo-pieza';

export const INVENTARIO_PIEZAS = Symbol('INVENTARIO_PIEZAS');

export const CAMPOS_ORDEN_INVENTARIO = [
  'codigo',
  'titulo',
  'anio',
  'estado',
  'actualizadoEn',
] as const;
export type CampoOrdenInventario = (typeof CAMPOS_ORDEN_INVENTARIO)[number];

export interface FiltrosInventario {
  /** Busca en código, título y descripción. */
  texto?: string;
  tipo?: TipoPieza;
  estado?: EstadoPieza;
  /** La caja es la ubicación (depósito, estantería y caja). */
  ubicacionId?: string;
}

export interface ParametrosInventario extends ParametrosPaginacion {
  filtros: FiltrosInventario;
  orden: CampoOrdenInventario;
  direccion: DireccionOrden;
}

/** Una fila del inventario: lo que el personal necesita ver de cada pieza, sin ocultar nada. */
export interface FilaInventario {
  id: string;
  codigo: string;
  titulo: string;
  tipo: TipoPieza;
  estado: EstadoPieza;
  anio: number | null;
  restringida: boolean;
  ubicacion: { id: string; deposito: string; estanteria: string; caja: string };
  actualizadoEn: Date;
}

/** Lee el inventario completo, en cualquier estado, para el panel del personal. */
export interface InventarioPiezas {
  listar(params: ParametrosInventario): Promise<ResultadoPaginado<FilaInventario>>;
}
