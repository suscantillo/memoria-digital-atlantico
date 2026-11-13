import { ErrorConflicto, ErrorNoEncontrado, ErrorRegla } from '../comun/errores';
import { generarId } from '../comun/identificador';
import { TernaUbicacion } from '../ubicaciones/ubicacion.entity';
import { CodigoPieza } from './codigo-pieza';
import { EstadoPieza } from './estado-pieza';
import { TIPOS_PIEZA, TipoPieza } from './tipo-pieza';

export interface UbicacionPieza extends TernaUbicacion {
  id: string;
}

export interface ArchivoAprobadoPieza {
  id: string;
  tipoMime: string;
}

export interface DatosNuevaPieza {
  titulo: string;
  tipo: TipoPieza;
  anio: number;
  ubicacionId: string;
}

export interface DatosCrearPieza {
  codigo: CodigoPieza;
  titulo: string;
  tipo: TipoPieza;
  anio: number;
  ubicacion: UbicacionPieza;
}

export interface PropiedadesPieza {
  id: string;
  codigo: CodigoPieza;
  titulo: string;
  descripcion: string | null;
  tipo: TipoPieza;
  estado: EstadoPieza;
  anio: number | null;
  restringida: boolean;
  ubicacion: UbicacionPieza;
  archivoAprobado: ArchivoAprobadoPieza | null;
  creadoEn: Date;
  actualizadoEn: Date;
}

export class Pieza {
  private constructor(private readonly props: PropiedadesPieza) {}

  static crear(datos: DatosCrearPieza): Pieza {
    const titulo = (datos.titulo ?? '').trim();

    if (titulo.length === 0) {
      throw new ErrorRegla('El título de la pieza es obligatorio.');
    }

    if (!(TIPOS_PIEZA as readonly string[]).includes(datos.tipo)) {
      throw new ErrorRegla('El tipo de pieza no es válido.');
    }

    if (!Number.isInteger(datos.anio) || datos.anio < 1500 || datos.anio > 2100) {
      throw new ErrorRegla('El año de la pieza debe estar entre 1500 y 2100.');
    }

    const ahora = new Date();

    return new Pieza({
      id: generarId(),
      codigo: datos.codigo,
      titulo,
      descripcion: null,
      tipo: datos.tipo,
      estado: 'REGISTRADA',
      anio: datos.anio,
      restringida: false,
      ubicacion: { ...datos.ubicacion },
      archivoAprobado: null,
      creadoEn: ahora,
      actualizadoEn: ahora,
    });
  }

  static reconstruir(props: PropiedadesPieza): Pieza {
    return new Pieza({ ...props });
  }

  get id(): string {
    return this.props.id;
  }

  get codigo(): CodigoPieza {
    return this.props.codigo;
  }

  get titulo(): string {
    return this.props.titulo;
  }

  get descripcion(): string | null {
    return this.props.descripcion;
  }

  get tipo(): TipoPieza {
    return this.props.tipo;
  }

  get estado(): EstadoPieza {
    return this.props.estado;
  }

  get anio(): number | null {
    return this.props.anio;
  }

  get restringida(): boolean {
    return this.props.restringida;
  }

  get ubicacion(): UbicacionPieza {
    return this.props.ubicacion;
  }

  get archivoAprobado(): ArchivoAprobadoPieza | null {
    return this.props.archivoAprobado;
  }

  get creadoEn(): Date {
    return this.props.creadoEn;
  }

  get actualizadoEn(): Date {
    return this.props.actualizadoEn;
  }

  estaPublicada(): boolean {
    return this.props.estado === 'PUBLICADA';
  }

  /** Control de calidad: con el escaneo aprobado la pieza queda visible en el portal. */
  publicarPorEscaneoAprobado(): void {
    this.exigirEscaneada();
    this.cambiarEstado('PUBLICADA');
  }

  /** Control de calidad: con el escaneo rechazado la pieza vuelve a esperar una carga. */
  devolverPorEscaneoRechazado(): void {
    this.exigirEscaneada();
    this.cambiarEstado('REGISTRADA');
  }

  private exigirEscaneada(): void {
    if (this.props.estado !== 'ESCANEADA') {
      throw new PiezaSinEscaneoPorRevisarError(this.props.codigo.valor, this.props.estado);
    }
  }

  private cambiarEstado(estado: EstadoPieza): void {
    this.props.estado = estado;
    this.props.actualizadoEn = new Date();
  }
}

export class PiezaNoEncontradaError extends ErrorNoEncontrado {
  constructor(codigo: string) {
    super(`No encontramos la pieza con código "${codigo}".`);
  }
}

export class PiezaSinEscaneoPorRevisarError extends ErrorConflicto {
  constructor(codigo: string, estado: EstadoPieza) {
    super(`${codigo} está ${estado}: solo se revisa el escaneo de una pieza ESCANEADA.`);
  }
}
