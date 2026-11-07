import { generarId } from '../comun/identificador';

export interface PropiedadesSesion {
  id: string;
  usuarioId: string;
  jti: string;
  expiraEn: Date;
  revocadaEn: Date | null;
  creadoEn: Date;
}

export class Sesion {
  private constructor(private readonly props: PropiedadesSesion) {}

  static crear(datos: { usuarioId: string; expiraEn: Date }): Sesion {
    return new Sesion({
      id: generarId(),
      usuarioId: datos.usuarioId,
      jti: generarId(),
      expiraEn: datos.expiraEn,
      revocadaEn: null,
      creadoEn: new Date(),
    });
  }

  static reconstruir(props: PropiedadesSesion): Sesion {
    return new Sesion({ ...props });
  }

  get id(): string {
    return this.props.id;
  }
  get usuarioId(): string {
    return this.props.usuarioId;
  }
  get jti(): string {
    return this.props.jti;
  }
  get expiraEn(): Date {
    return this.props.expiraEn;
  }
  get revocadaEn(): Date | null {
    return this.props.revocadaEn;
  }
  get creadoEn(): Date {
    return this.props.creadoEn;
  }

  estaVigente(ahora: Date = new Date()): boolean {
    return this.props.revocadaEn === null && this.props.expiraEn.getTime() > ahora.getTime();
  }
}
