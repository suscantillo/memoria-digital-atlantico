import { ErrorNoEncontrado } from '../../domain/comun/errores';
import {
  ArchivoPublicable,
  ArchivosPublicos,
  ContenidoAlmacenado,
  LectorArchivos,
} from './puertos';

export class ArchivoNoDisponibleError extends ErrorNoEncontrado {
  constructor(id: string) {
    super(`El archivo "${id}" no existe o no está publicado.`);
  }
}

export type ContenidoArchivo = Omit<ArchivoPublicable, 'rutaAlmacenamiento'> & ContenidoAlmacenado;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Entrega el escaneo aprobado de una pieza publicada para el visor del portal (HU-14).
 * Si no se puede ver responde igual que si no existiera: así no se revela qué hay en el archivo.
 */
export class ObtenerContenidoArchivo {
  constructor(
    private readonly archivos: ArchivosPublicos,
    private readonly lector: LectorArchivos,
  ) {}

  async ejecutar(id: string): Promise<ContenidoArchivo> {
    const archivo = UUID.test(id) ? await this.archivos.buscarPublicable(id) : null;
    if (!archivo) throw new ArchivoNoDisponibleError(id);

    const contenido = await this.lector.abrir(archivo.rutaAlmacenamiento);
    if (!contenido) throw new ArchivoNoDisponibleError(id);

    return {
      id: archivo.id,
      nombreOriginal: archivo.nombreOriginal,
      tipoMime: archivo.tipoMime,
      ...contenido,
    };
  }
}
