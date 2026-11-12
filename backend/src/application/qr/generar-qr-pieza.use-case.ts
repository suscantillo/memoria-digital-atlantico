import { ErrorNoEncontrado } from '../../domain/comun/errores';
import { CodigosDePieza, GeneradorQr } from './puertos';

export class QrPiezaNoEncontradaError extends ErrorNoEncontrado {
  constructor(id: string) {
    super(`No encontramos la pieza con id "${id}".`);
  }
}

export interface QrDePieza {
  codigo: string;
  /** Lo que guarda el QR: la ficha pública de la pieza, marcada como abierta desde el QR. */
  enlace: string;
  png: Buffer;
}

/**
 * HU-11: el QR que se pega en la carpeta o la caja de la pieza. Se genera para cualquier estado:
 * mientras la pieza no esté PUBLICADA, la ficha pública responde que no la encuentra.
 */
export class GenerarQrPieza {
  constructor(
    private readonly codigos: CodigosDePieza,
    private readonly generador: GeneradorQr,
    private readonly urlPublica: string,
  ) {}

  async ejecutar(id: string): Promise<QrDePieza> {
    const codigo = await this.codigos.codigoPorId(id);
    if (!codigo) {
      throw new QrPiezaNoEncontradaError(id);
    }
    const base = this.urlPublica.replace(/\/+$/, '');
    const enlace = `${base}/p/${codigo.valor}?qr=1`;
    return { codigo: codigo.valor, enlace, png: await this.generador.png(enlace) };
  }
}
