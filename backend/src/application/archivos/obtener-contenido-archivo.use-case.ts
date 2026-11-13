import { evaluarAccesoArchivo } from '../../domain/archivos/acceso-archivo';
import { ArchivoNoEncontradoError } from '../../domain/archivos/archivo-digital.entity';
import { ArchivoDigitalRepositorio } from '../../domain/archivos/archivo-digital.repositorio';
import { ErrorNoAutorizado } from '../../domain/comun/errores';
import { RolUsuario } from '../../domain/usuarios/rol-usuario';
import { AlmacenArchivos } from './puertos';

export interface ContenidoArchivo {
  nombreOriginal: string;
  tipoMime: string;
  contenido: Uint8Array;
}

export class SesionRequeridaParaPdfError extends ErrorNoAutorizado {
  constructor() {
    super('Inicia sesión para leer este documento.');
  }
}

/**
 * HU-10 y HU-15: entrega el escaneo según quién lo pide. Lo que el público no puede ver responde
 * igual que un archivo que no existe, para no delatar piezas restringidas ni escaneos en revisión.
 */
export class ObtenerContenidoArchivo {
  constructor(
    private readonly archivos: ArchivoDigitalRepositorio,
    private readonly almacen: AlmacenArchivos,
  ) {}

  async ejecutar(archivoId: string, rol: RolUsuario | null): Promise<ContenidoArchivo> {
    const encontrado = await this.archivos.buscarRevision(archivoId);
    if (!encontrado) {
      throw new ArchivoNoEncontradoError(archivoId);
    }
    const { archivo, pieza } = encontrado;

    const acceso = evaluarAccesoArchivo(archivo, pieza, rol);
    if (acceso === 'NO_VISIBLE') {
      throw new ArchivoNoEncontradoError(archivoId);
    }
    if (acceso === 'REQUIERE_SESION') {
      throw new SesionRequeridaParaPdfError();
    }

    const contenido = await this.almacen.leer(archivo.rutaAlmacenamiento);
    if (!contenido) {
      throw new ArchivoNoEncontradoError(archivoId);
    }
    return { nombreOriginal: archivo.nombreOriginal, tipoMime: archivo.tipoMime, contenido };
  }
}
