import { ErrorRegla } from '../comun/errores';
import { generarId } from '../comun/identificador';
import { textoObligatorio } from '../comun/texto';
import { CodigoPieza } from './codigo-pieza';
import { ESTADOS_PIEZA, EstadoPieza } from './estado-pieza';
import { TIPOS_PIEZA, TipoPieza } from './tipo-pieza';

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

export interface DatosPiezaRegistrada extends DatosNuevaPieza {
  codigo: CodigoPieza;
  estado?: EstadoPieza;
}

export class Pieza {
  private constructor(private readonly props: PropiedadesPieza) {}

  static crear(datos: DatosPiezaRegistrada): Pieza {
    const titulo = textoObligatorio(datos.titulo, 'titulo');
    if (!TIPOS_PIEZA.includes(datos.tipo)) {
      throw new ErrorRegla(`El tipo de pieza "${datos.tipo}" no es válido.`);
    }
    if (!Number.isInteger(datos.anio) || datos.anio < 1500 || datos.anio > 2100) {
      throw new ErrorRegla('El año de la pieza debe estar entre 1500 y 2100.');
    }
    const estado = datos.estado ?? 'REGISTRADA';
    if (!ESTADOS_PIEZA.includes(estado)) {
      throw new ErrorRegla(`El estado de la pieza "${estado}" no es válido.`);
    }

    const ahora = new Date();
    return new Pieza({
      id: generarId(),
      codigo: CodigoPieza.desde(datos.codigo.toString()),
      titulo,
      tipo: datos.tipo,
      estado,
      anio: datos.anio,
      ubicacionId: textoObligatorio(datos.ubicacionId, 'ubicacionId'),
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
