import { ArchivoNoEncontradoError } from '../../domain/archivos/archivo-digital.entity';
import { ArchivoDigitalRepositorio } from '../../domain/archivos/archivo-digital.repositorio';
import { AlmacenArchivos } from './puertos';

export interface ContenidoArchivo {
  nombreOriginal: string;
  tipoMime: string;
  contenido: Uint8Array;
}

/** HU-10: el revisor abre el escaneo, en cualquier estado, para compararlo con la ficha. */
export class ObtenerContenidoArchivo {
  constructor(
    private readonly archivos: ArchivoDigitalRepositorio,
    private readonly almacen: AlmacenArchivos,
  ) {}

  async ejecutar(archivoId: string): Promise<ContenidoArchivo> {
    const archivo = await this.archivos.buscarPorId(archivoId);
    if (!archivo) {
      throw new ArchivoNoEncontradoError(archivoId);
    }
    const contenido = await this.almacen.leer(archivo.rutaAlmacenamiento);
    if (!contenido) {
      throw new ArchivoNoEncontradoError(archivoId);
    }
    return { nombreOriginal: archivo.nombreOriginal, tipoMime: archivo.tipoMime, contenido };
  }
}
