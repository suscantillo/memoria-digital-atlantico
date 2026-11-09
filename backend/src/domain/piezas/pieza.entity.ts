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
