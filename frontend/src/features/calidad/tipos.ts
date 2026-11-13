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
  subidoPor: PersonaArchivo;
  /** HU-23: quién debe revisarlo; null mientras el administrador no lo asigne. */
  revisor: PersonaArchivo | null;
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

export interface PersonaArchivo {
  id: string;
  nombre: string;
  correo: string;
}

/**
 * Filtros de GET /archivos. `revisor`: «yo» (lo asignado a quien pregunta), «ninguno» (sin
 * asignar) o el id de una cuenta. `subidoPor`: «yo» para «Mis escaneos».
 */
export interface ParametrosArchivos {
  estado?: EstadoArchivo;
  revisor?: string;
  subidoPor?: 'yo';
  pagina?: number;
  limite?: number;
  direccion?: 'asc' | 'desc';
}

/** Los tres criterios de la lista de calidad; el backend solo aprueba con los tres en true. */
export interface CriteriosCalidad {
  legible: boolean;
  completa: boolean;
  datosCorrectos: boolean;
}

export type Decision = { tipo: 'aprobar' } | { tipo: 'rechazar'; motivo: string };
