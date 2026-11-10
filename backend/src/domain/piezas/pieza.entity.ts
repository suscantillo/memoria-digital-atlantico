import { CodigoPieza } from './codigo-pieza';
import { EstadoPieza } from './estado-pieza';
import { TipoPieza } from './tipo-pieza';

export interface PropiedadesPieza {
  id: string;
  codigo: CodigoPieza;
  titulo: string;
  tipo: TipoPieza;
  estado: EstadoPieza;
  anio: number;
  descripcion: string | null;
  ubicacionId: string;
  creadoEn: Date;
  actualizadoEn: Date;
}

export interface DatosNuevaPieza {
  titulo: string;
  tipo: TipoPieza;
  anio: number;
  ubicacionId: string;
}

export interface UbicacionDePieza {
  id: string;
  deposito: string;
  estanteria: string;
  caja: string;
}

export interface EventoDePieza {
  id: string;
  usuarioId: string | null;
  usuarioNombre: string | null;
  accion: string;
  detalle: string | null;
  creadoEn: Date;
}

export interface FichaPieza {
  pieza: Pieza;
  ubicacion: UbicacionDePieza;
  eventos: EventoDePieza[];
}

export interface CambiosPieza {
  titulo?: string;
  descripcion?: string | null;
}

export class Pieza {
  private constructor(private readonly props: PropiedadesPieza) {}

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
  get tipo(): TipoPieza {
    return this.props.tipo;
  }
  get estado(): EstadoPieza {
    return this.props.estado;
  }
  get anio(): number {
    return this.props.anio;
  }
  get descripcion(): string | null {
    return this.props.descripcion;
  }
  get ubicacionId(): string {
    return this.props.ubicacionId;
  }
  get creadoEn(): Date {
    return this.props.creadoEn;
  }
  get actualizadoEn(): Date {
    return this.props.actualizadoEn;
  }
}
