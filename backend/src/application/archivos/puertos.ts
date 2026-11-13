import type { Readable } from 'node:stream';
import { EstadoPieza } from '../../domain/piezas/estado-pieza';

export const ESCANEOS = Symbol('ESCANEOS');
export const REVISORES = Symbol('REVISORES');

/** HU-23: una cuenta PERSONAL activa a la que se le puede asignar una revisión. */
export interface RevisorDisponible {
  id: string;
  nombre: string;
  correo: string;
}

export interface Revisores {
  listarDisponibles(): Promise<RevisorDisponible[]>;
  /** null si no existe, no es PERSONAL o está desactivada. */
  buscarDisponible(id: string): Promise<RevisorDisponible | null>;
}
export const ALMACEN_ARCHIVOS = Symbol('ALMACEN_ARCHIVOS');

export interface PiezaParaEscaneo {
  id: string;
  codigo: string;
  estado: EstadoPieza;
  /** Ya hay un ArchivoDigital EN_REVISION de esta pieza. */
  tieneEscaneoEnRevision: boolean;
}

export interface NuevoEscaneo {
  piezaId: string;
  usuarioId: string;
  nombreOriginal: string;
  rutaAlmacenamiento: string;
  tipoMime: string;
  tamanoBytes: number;
  tema: string;
  autor: string;
  palabrasClave: string[];
}

export interface EscaneoRegistrado {
  id: string;
  creadoEn: Date;
}

export interface Escaneos {
  piezaParaEscaneo(piezaId: string): Promise<PiezaParaEscaneo | null>;
  /**
   * En una sola transacción: crea el ArchivoDigital EN_REVISION, pasa la pieza de REGISTRADA a
   * ESCANEADA con sus metadatos y deja el EventoPieza. Devuelve null si otra carga ganó la carrera
   * y la pieza ya no está REGISTRADA.
   */
  registrar(escaneo: NuevoEscaneo): Promise<EscaneoRegistrado | null>;
}

/** Donde se guarda el archivo; la base solo guarda la ruta. */
export interface AlmacenArchivos {
  guardar(contenido: Uint8Array, extension: string): Promise<string>;
  borrar(ruta: string): Promise<void>;
}

export const LECTOR_ARCHIVOS = Symbol('LECTOR_ARCHIVOS');

export interface ContenidoAlmacenado {
  flujo: Readable;
  tamanoBytes: number;
}

/** Lee del almacenamiento; null si el archivo ya no está. */
export interface LectorArchivos {
  abrir(ruta: string): Promise<ContenidoAlmacenado | null>;
}
