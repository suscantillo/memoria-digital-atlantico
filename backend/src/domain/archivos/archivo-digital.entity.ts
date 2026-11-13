import { ErrorConflicto, ErrorNoEncontrado, ErrorRegla } from '../comun/errores';
import { EstadoArchivoDigital } from './estado-archivo-digital';

export interface PropiedadesArchivoDigital {
  id: string;
  piezaId: string;
  nombreOriginal: string;
  rutaAlmacenamiento: string;
  tipoMime: string;
  tamanoBytes: number;
  estado: EstadoArchivoDigital;
  motivoRechazo: string | null;
  subidoPorId: string;
  revisadoPorId: string | null;
  revisadoEn: Date | null;
  creadoEn: Date;
}

export class ArchivoDigital {
  private constructor(private readonly props: PropiedadesArchivoDigital) {}

  static reconstruir(props: PropiedadesArchivoDigital): ArchivoDigital {
    return new ArchivoDigital({ ...props });
  }

  aprobar(revisorId: string): void {
    this.exigirEnRevision();
    this.props.estado = 'APROBADO';
    this.props.motivoRechazo = null;
    this.marcarRevision(revisorId);
  }

  rechazar(revisorId: string, motivo: string): void {
    const motivoLimpio = (motivo ?? '').trim();
    if (motivoLimpio.length === 0) {
      throw new MotivoRechazoObligatorioError();
    }
    this.exigirEnRevision();
    this.props.estado = 'RECHAZADO';
    this.props.motivoRechazo = motivoLimpio;
    this.marcarRevision(revisorId);
  }

  private exigirEnRevision(): void {
    if (this.props.estado !== 'EN_REVISION') {
      throw new ArchivoYaRevisadoError(this.props.estado);
    }
  }

  private marcarRevision(revisorId: string): void {
    this.props.revisadoPorId = revisorId;
    this.props.revisadoEn = new Date();
  }

  get id(): string {
    return this.props.id;
  }
  get piezaId(): string {
    return this.props.piezaId;
  }
  get nombreOriginal(): string {
    return this.props.nombreOriginal;
  }
  get rutaAlmacenamiento(): string {
    return this.props.rutaAlmacenamiento;
  }
  get tipoMime(): string {
    return this.props.tipoMime;
  }
  get tamanoBytes(): number {
    return this.props.tamanoBytes;
  }
  get estado(): EstadoArchivoDigital {
    return this.props.estado;
  }
  get motivoRechazo(): string | null {
    return this.props.motivoRechazo;
  }
  get subidoPorId(): string {
    return this.props.subidoPorId;
  }
  get revisadoPorId(): string | null {
    return this.props.revisadoPorId;
  }
  get revisadoEn(): Date | null {
    return this.props.revisadoEn;
  }
  get creadoEn(): Date {
    return this.props.creadoEn;
  }
}

export class ArchivoNoEncontradoError extends ErrorNoEncontrado {
  constructor(id: string) {
    super(`No encontramos el archivo con id "${id}".`);
  }
}

export class ArchivoYaRevisadoError extends ErrorConflicto {
  constructor(estado: EstadoArchivoDigital) {
    super(`Este escaneo ya fue revisado y está ${estado}.`);
  }
}

export class MotivoRechazoObligatorioError extends ErrorRegla {
  constructor() {
    super('Para rechazar un escaneo hay que escribir el motivo.');
  }
}
