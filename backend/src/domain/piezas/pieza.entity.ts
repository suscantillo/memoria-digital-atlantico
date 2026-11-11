import { ErrorNoEncontrado } from '../comun/errores';
import { TernaUbicacion } from '../ubicaciones/ubicacion.entity';

export const TIPOS_PIEZA = ['DOCUMENTO', 'FOTOGRAFIA', 'PERIODICO'] as const;
export type TipoPieza = (typeof TIPOS_PIEZA)[number];

export const ESTADOS_PIEZA = ['REGISTRADA', 'ESCANEADA', 'REVISADA', 'PUBLICADA'] as const;
export type EstadoPieza = (typeof ESTADOS_PIEZA)[number];

export interface UbicacionPieza extends TernaUbicacion {
  id: string;
}

export interface ArchivoAprobadoPieza {
  id: string;
  tipoMime: string;
}

export interface PropiedadesPieza {
  id: string;
  codigo: string;
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

  static reconstruir(props: PropiedadesPieza): Pieza {
    return new Pieza({ ...props });
  }

  get id(): string {
    return this.props.id;
  }
  get codigo(): string {
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
}

export class PiezaNoEncontradaError extends ErrorNoEncontrado {
  constructor(codigo: string) {
    super(`No encontramos la pieza con código "${codigo}".`);
  }
}
