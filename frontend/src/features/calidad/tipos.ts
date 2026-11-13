import type { EstadoPieza, TipoPieza } from '../inventario/tipos';

export type EstadoArchivo = 'EN_REVISION' | 'APROBADO' | 'RECHAZADO';

/** Fila de GET /archivos: el escaneo con los datos de su pieza que hay que comprobar. */
export interface ArchivoEnRevision {
  id: string;
  nombreOriginal: string;
  tipoMime: string;
  tamanoBytes: number;
  estado: EstadoArchivo;
  motivoRechazo: string | null;
  creadoEn: string;
  revisadoEn: string | null;
  /** Ruta del contenido; pide la sesión del panel. */
  url: string;
  subidoPor: { nombre: string; correo: string };
  pieza: {
    id: string;
    codigo: string;
    titulo: string;
    tipo: TipoPieza;
    estado: EstadoPieza;
    anio: number | null;
    tema: string | null;
    autor: string | null;
    palabrasClave: string[];
  };
}

/** Los tres criterios de la lista de calidad; el backend solo aprueba con los tres en true. */
export interface CriteriosCalidad {
  legible: boolean;
  completa: boolean;
  datosCorrectos: boolean;
}

export type Decision = { tipo: 'aprobar' } | { tipo: 'rechazar'; motivo: string };
