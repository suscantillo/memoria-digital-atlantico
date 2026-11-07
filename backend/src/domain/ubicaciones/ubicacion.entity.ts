import { generarId } from '../comun/identificador';
import { textoObligatorio, textoOpcional } from '../comun/texto';

export interface TernaUbicacion {
  deposito: string;
  estanteria: string;
  caja: string;
}

export interface PropiedadesUbicacion extends TernaUbicacion {
  id: string;
  descripcion: string | null;
  creadoEn: Date;
  actualizadoEn: Date;
}

export interface DatosNuevaUbicacion extends TernaUbicacion {
  descripcion?: string | null;
}

export class Ubicacion {
  private constructor(private readonly props: PropiedadesUbicacion) {}

  static crear(datos: DatosNuevaUbicacion): Ubicacion {
    const ahora = new Date();
    return new Ubicacion({
      id: generarId(),
      ...Ubicacion.normalizarTerna(datos),
      descripcion: textoOpcional(datos.descripcion),
      creadoEn: ahora,
      actualizadoEn: ahora,
    });
  }

  static reconstruir(props: PropiedadesUbicacion): Ubicacion {
    return new Ubicacion({ ...props });
  }

  static normalizarTerna(terna: TernaUbicacion): TernaUbicacion {
    return {
      deposito: textoObligatorio(terna.deposito, 'deposito'),
      estanteria: textoObligatorio(terna.estanteria, 'estanteria'),
      caja: textoObligatorio(terna.caja, 'caja'),
    };
  }

  get id(): string {
    return this.props.id;
  }
  get deposito(): string {
    return this.props.deposito;
  }
  get estanteria(): string {
    return this.props.estanteria;
  }
  get caja(): string {
    return this.props.caja;
  }
  get descripcion(): string | null {
    return this.props.descripcion;
  }
  get creadoEn(): Date {
    return this.props.creadoEn;
  }
  get actualizadoEn(): Date {
    return this.props.actualizadoEn;
  }

  get terna(): TernaUbicacion {
    const { deposito, estanteria, caja } = this.props;
    return { deposito, estanteria, caja };
  }

  get etiqueta(): string {
    return `${this.props.deposito} / ${this.props.estanteria} / ${this.props.caja}`;
  }
}
