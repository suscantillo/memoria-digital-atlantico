import { ErrorRegla } from '../comun/errores';
import { generarId } from '../comun/identificador';
import { textoObligatorio } from '../comun/texto';
import { VERSION_AVISO_PRIVACIDAD } from './aviso-privacidad';
import { RolUsuario } from './rol-usuario';

export interface PropiedadesUsuario {
  id: string;
  nombre: string;
  correo: string;
  contrasenaHash: string;
  rol: RolUsuario;
  activo: boolean;
  consentimientoEn: Date | null;
  versionPrivacidad: string | null;
  creadoEn: Date;
  actualizadoEn: Date;
}

export interface DatosNuevoUsuario {
  nombre: string;
  correo: string;
  contrasenaHash: string;
  rol: RolUsuario;
}

export interface DatosRegistroPublico {
  nombre: string;
  correo: string;
  contrasenaHash: string;
  aceptaPrivacidad: boolean;
  versionPrivacidad: string;
}

const CORREO_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class Usuario {
  private constructor(private readonly props: PropiedadesUsuario) {}

  static crear(datos: DatosNuevoUsuario): Usuario {
    return Usuario.nuevo(datos, null);
  }

  static registrarPublico(datos: DatosRegistroPublico): Usuario {
    if (datos.aceptaPrivacidad !== true) {
      throw new ErrorRegla('Debes aceptar el aviso de privacidad para crear la cuenta.');
    }
    if (datos.versionPrivacidad !== VERSION_AVISO_PRIVACIDAD) {
      throw new ErrorRegla('La versión del aviso de privacidad aceptada no es la vigente.');
    }
    return Usuario.nuevo({ ...datos, rol: 'PUBLICO' }, datos.versionPrivacidad);
  }

  private static nuevo(datos: DatosNuevoUsuario, versionPrivacidad: string | null): Usuario {
    const correo = textoObligatorio(datos.correo, 'correo').toLowerCase();
    if (!CORREO_VALIDO.test(correo)) {
      throw new ErrorRegla('El correo no tiene un formato válido.');
    }
    const ahora = new Date();
    return new Usuario({
      id: generarId(),
      nombre: textoObligatorio(datos.nombre, 'nombre'),
      correo,
      contrasenaHash: textoObligatorio(datos.contrasenaHash, 'contrasenaHash'),
      rol: datos.rol,
      activo: true,
      consentimientoEn: versionPrivacidad ? ahora : null,
      versionPrivacidad,
      creadoEn: ahora,
      actualizadoEn: ahora,
    });
  }

  static reconstruir(props: PropiedadesUsuario): Usuario {
    return new Usuario({ ...props });
  }

  get id(): string {
    return this.props.id;
  }
  get nombre(): string {
    return this.props.nombre;
  }
  get correo(): string {
    return this.props.correo;
  }
  get contrasenaHash(): string {
    return this.props.contrasenaHash;
  }
  get rol(): RolUsuario {
    return this.props.rol;
  }
  get activo(): boolean {
    return this.props.activo;
  }
  get consentimientoEn(): Date | null {
    return this.props.consentimientoEn;
  }
  get versionPrivacidad(): string | null {
    return this.props.versionPrivacidad;
  }
  get creadoEn(): Date {
    return this.props.creadoEn;
  }
  get actualizadoEn(): Date {
    return this.props.actualizadoEn;
  }

  puedeIniciarSesion(): boolean {
    return this.props.activo;
  }

  tieneAlgunRol(roles: readonly RolUsuario[]): boolean {
    return roles.includes(this.props.rol);
  }
}
