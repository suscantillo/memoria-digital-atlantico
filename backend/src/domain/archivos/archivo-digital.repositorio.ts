import { DireccionOrden, ParametrosPaginacion, ResultadoPaginado } from '../comun/paginacion';
import { EstadoPieza } from '../piezas/estado-pieza';
import { Pieza } from '../piezas/pieza.entity';
import { TipoPieza } from '../piezas/tipo-pieza';
import { ArchivoDigital } from './archivo-digital.entity';
import { EstadoArchivoDigital } from './estado-archivo-digital';

export const ARCHIVO_DIGITAL_REPOSITORIO = Symbol('ARCHIVO_DIGITAL_REPOSITORIO');

export const CAMPOS_ORDEN_ARCHIVO = ['creadoEn', 'nombreOriginal', 'tamanoBytes'] as const;
export type CampoOrdenArchivo = (typeof CAMPOS_ORDEN_ARCHIVO)[number];

export interface ParametrosListarArchivos extends ParametrosPaginacion {
  estado?: EstadoArchivoDigital;
  orden: CampoOrdenArchivo;
  direccion: DireccionOrden;
}

/** Lo que el revisor compara contra el escaneo: el archivo, quién lo subió y los datos de su pieza. */
export interface DetalleArchivoDigital {
  id: string;
  nombreOriginal: string;
  tipoMime: string;
  tamanoBytes: number;
  estado: EstadoArchivoDigital;
  motivoRechazo: string | null;
  creadoEn: Date;
  revisadoEn: Date | null;
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

export interface RevisionEscaneo {
  archivo: ArchivoDigital;
  pieza: Pieza;
}

export interface EventoRevision {
  accion: string;
  detalle: string;
}

export interface ArchivoDigitalRepositorio {
  listar(params: ParametrosListarArchivos): Promise<ResultadoPaginado<DetalleArchivoDigital>>;
  buscarDetalle(id: string): Promise<DetalleArchivoDigital | null>;
  buscarPorId(id: string): Promise<ArchivoDigital | null>;
  buscarRevision(id: string): Promise<RevisionEscaneo | null>;
  /**
   * Guarda el archivo revisado, el nuevo estado de su pieza y el evento del historial, todo o nada.
   * Devuelve false si otra revisión llegó primero y el archivo ya no estaba EN_REVISION.
   */
  guardarRevision(revision: RevisionEscaneo, evento: EventoRevision): Promise<boolean>;
}
