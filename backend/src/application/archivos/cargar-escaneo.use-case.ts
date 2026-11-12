import { ErrorConflicto, ErrorNoEncontrado, ErrorRegla } from '../../domain/comun/errores';
import { EXTENSION_ESCANEO, validarEscaneo } from '../../domain/archivos/formato-escaneo';
import { AlmacenArchivos, Escaneos } from './puertos';

export class PiezaDelEscaneoNoEncontradaError extends ErrorNoEncontrado {
  constructor(id: string) {
    super(`No encontramos la pieza con id "${id}".`);
  }
}

export class EscaneoYaEnRevisionError extends ErrorConflicto {
  constructor(codigo: string) {
    super(
      `${codigo} ya tiene un escaneo esperando revisión. Cuando lo aprueben o lo rechacen podrás cargar otro.`,
    );
  }
}

export class PiezaNoRegistradaError extends ErrorConflicto {
  constructor(codigo: string, estado: string) {
    super(`${codigo} está ${estado}: solo se carga el escaneo de una pieza REGISTRADA.`);
  }
}

export class MetadatosEscaneoIncompletosError extends ErrorRegla {
  constructor() {
    super('El escaneo necesita tema, autor y al menos una palabra clave.');
  }
}

export interface DatosCargaEscaneo {
  piezaId: string;
  usuarioId: string;
  nombreOriginal: string;
  contenido: Uint8Array;
  tema: string;
  autor: string;
  palabrasClave: string[];
}

export interface EscaneoCargado {
  id: string;
  piezaId: string;
  codigo: string;
  estado: 'EN_REVISION';
  estadoPieza: 'ESCANEADA';
  nombreOriginal: string;
  tipoMime: string;
  tamanoBytes: number;
  tema: string;
  autor: string;
  palabrasClave: string[];
  creadoEn: Date;
}

/** Las palabras clave se guardan en minúscula, sin repetir y sin vacías. */
function limpiarPalabras(palabras: string[]): string[] {
  return [...new Set(palabras.map((p) => p.trim().toLowerCase()).filter(Boolean))];
}

/** HU-09: el personal sube el escaneo de una pieza REGISTRADA y queda EN_REVISION. */
export class CargarEscaneo {
  constructor(
    private readonly escaneos: Escaneos,
    private readonly almacen: AlmacenArchivos,
  ) {}

  async ejecutar(datos: DatosCargaEscaneo): Promise<EscaneoCargado> {
    const tema = datos.tema.trim();
    const autor = datos.autor.trim();
    const palabrasClave = limpiarPalabras(datos.palabrasClave);
    if (!tema || !autor || palabrasClave.length === 0) {
      throw new MetadatosEscaneoIncompletosError();
    }
    const tipoMime = validarEscaneo(datos.contenido);

    const pieza = await this.escaneos.piezaParaEscaneo(datos.piezaId);
    if (!pieza) throw new PiezaDelEscaneoNoEncontradaError(datos.piezaId);
    if (pieza.tieneEscaneoEnRevision) throw new EscaneoYaEnRevisionError(pieza.codigo);
    if (pieza.estado !== 'REGISTRADA') throw new PiezaNoRegistradaError(pieza.codigo, pieza.estado);

    const ruta = await this.almacen.guardar(datos.contenido, EXTENSION_ESCANEO[tipoMime]);
    let registrado;
    try {
      registrado = await this.escaneos.registrar({
        piezaId: pieza.id,
        usuarioId: datos.usuarioId,
        nombreOriginal: datos.nombreOriginal,
        rutaAlmacenamiento: ruta,
        tipoMime,
        tamanoBytes: datos.contenido.length,
        tema,
        autor,
        palabrasClave,
      });
    } catch (error) {
      // si la base falla no queda un archivo huérfano en el disco
      await this.almacen.borrar(ruta);
      throw error;
    }
    if (!registrado) {
      await this.almacen.borrar(ruta);
      throw new EscaneoYaEnRevisionError(pieza.codigo);
    }

    return {
      id: registrado.id,
      piezaId: pieza.id,
      codigo: pieza.codigo,
      estado: 'EN_REVISION',
      estadoPieza: 'ESCANEADA',
      nombreOriginal: datos.nombreOriginal,
      tipoMime,
      tamanoBytes: datos.contenido.length,
      tema,
      autor,
      palabrasClave,
      creadoEn: registrado.creadoEn,
    };
  }
}
