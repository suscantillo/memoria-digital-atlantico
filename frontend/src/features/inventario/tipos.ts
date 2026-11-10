import type { DireccionOrden, ResultadoPaginado } from '../../shared/tipos/api';
import type { EstadoArchivo } from '../calidad/tipos';

export type TipoPieza = 'DOCUMENTO' | 'FOTOGRAFIA' | 'PERIODICO';
export type EstadoPieza = 'REGISTRADA' | 'ESCANEADA' | 'REVISADA' | 'PUBLICADA';

export const ESTADOS_PIEZA: EstadoPieza[] = ['REGISTRADA', 'ESCANEADA', 'REVISADA', 'PUBLICADA'];

export const NOMBRE_TIPO: Record<TipoPieza, string> = {
  DOCUMENTO: 'Documento',
  FOTOGRAFIA: 'Fotografía',
  PERIODICO: 'Periódico',
};

/** Fila de GET /piezas: la pieza que devuelve POST /piezas, más su ubicación y si es restringida. */
export interface PiezaInventario {
  id: string;
  codigo: string;
  titulo: string;
  tipo: TipoPieza;
  estado: EstadoPieza;
  anio: number;
  restringida: boolean;
  creadoEn: string;
  ubicacion: { id: string; etiqueta: string };
}

export type CampoOrdenPieza = 'codigo' | 'titulo' | 'creadoEn';

export interface ParametrosListarPiezas {
  pagina: number;
  limite: number;
  orden: CampoOrdenPieza;
  direccion: DireccionOrden;
  busqueda?: string;
  estado?: EstadoPieza;
  tipo?: TipoPieza;
  ubicacionId?: string;
}

export type PiezasPaginadas = ResultadoPaginado<PiezaInventario>;

/** GET /piezas/contadores (HU-18): cuántas piezas hay en cada estado. */
export type ContadoresPiezas = Record<EstadoPieza, number> & { total: number };

/** Entrada del historial: quién, qué y cuándo (EventoPieza en el glosario). */
export interface EventoPieza {
  id: string;
  descripcion: string;
  creadoEn: string;
  usuario: { nombre: string } | null;
}

export interface ArchivoDePieza {
  id: string;
  nombre: string;
  tipoMime: string;
  estado: EstadoArchivo;
  motivoRechazo: string | null;
  tema: string;
  autor: string;
  palabrasClave: string[];
  creadoEn: string;
}

/** GET /piezas/:id: la fila del inventario con su descripción, escaneos e historial. */
export interface FichaPieza extends PiezaInventario {
  descripcion: string | null;
  /** Del más reciente al más antiguo. */
  archivos: ArchivoDePieza[];
  /** En orden cronológico. */
  eventos: EventoPieza[];
}

/** POST /piezas (HU-06). */
export interface CrearPieza {
  tipo: TipoPieza;
  titulo: string;
  anio: number;
  ubicacionId: string;
}

/** PATCH /piezas/:id (HU-08). */
export interface EditarPieza {
  titulo: string;
  descripcion: string | null;
}

/** POST /archivos, multipart (HU-09). */
export interface CargarArchivo {
  archivo: File;
  tema: string;
  autor: string;
  palabrasClave: string[];
}

export const ANIO_MINIMO = 1500;
export const ANIO_MAXIMO = 2100;
