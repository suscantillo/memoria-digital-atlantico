import type { TipoPieza } from '../inventario/tipos';

export type EstadoArchivo = 'EN_REVISION' | 'APROBADO' | 'RECHAZADO';

/** Fila de GET /archivos: el escaneo con lo mínimo de su pieza para revisarlo. */
export interface ArchivoDigital {
  id: string;
  nombre: string;
  tipoMime: string;
  /** Tamaño en bytes. */
  tamano: number;
  estado: EstadoArchivo;
  motivoRechazo: string | null;
  creadoEn: string;
  subidoPor: { nombre: string; correo: string };
  pieza: { id: string; codigo: string; titulo: string; tipo: TipoPieza };
}
