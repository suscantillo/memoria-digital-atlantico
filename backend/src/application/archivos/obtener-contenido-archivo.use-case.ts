import { evaluarAccesoArchivo } from '../../domain/archivos/acceso-archivo';
import { ArchivoNoEncontradoError } from '../../domain/archivos/archivo-digital.entity';
import { ArchivoDigitalRepositorio } from '../../domain/archivos/archivo-digital.repositorio';
import { ErrorNoAutorizado } from '../../domain/comun/errores';
import { RolUsuario } from '../../domain/usuarios/rol-usuario';
import { ContenidoAlmacenado, LectorArchivos } from './puertos';

export interface ContenidoArchivo extends ContenidoAlmacenado {
  nombreOriginal: string;
  tipoMime: string;
}

export class SesionRequeridaParaPdfError extends ErrorNoAutorizado {
  constructor() {
    super('Inicia sesión para leer este documento.');
  }
}

/**
 * Entrega el escaneo según quién lo pide: el revisor (HU-10), el visor del portal (HU-14) y quien
 * lee un PDF con su cuenta (HU-15). Lo que el público no puede ver responde igual que un archivo
 * que no existe, para no delatar piezas restringidas ni escaneos en revisión.
 */
export class ObtenerContenidoArchivo {
  constructor(
    private readonly archivos: ArchivoDigitalRepositorio,
    private readonly lector: LectorArchivos,
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

    const contenido = await this.lector.abrir(archivo.rutaAlmacenamiento);
    if (!contenido) {
      throw new ArchivoNoEncontradoError(archivoId);
    }
    return { nombreOriginal: archivo.nombreOriginal, tipoMime: archivo.tipoMime, ...contenido };
  }
}
