import type { ResultadoPaginado } from '../../shared/tipos/api';
import type { RolUsuario, Usuario } from '../../shared/tipos/usuario';

/** Fila de GET /usuarios (HU-17): la cuenta más si está activa y cuándo entró por última vez. */
export interface CuentaUsuario extends Usuario {
  activa: boolean;
  ultimoIngreso: string | null;
  creadoEn: string;
}

export interface ParametrosListarUsuarios {
  pagina: number;
  limite: number;
  rol?: RolUsuario;
  busqueda?: string;
}

export type UsuariosPaginados = ResultadoPaginado<CuentaUsuario>;

/** Solo se crean cuentas del personal: las públicas se registran solas en /auth/registro. */
export interface CrearCuenta {
  nombre: string;
  correo: string;
  rol: Exclude<RolUsuario, 'PUBLICO'>;
  contrasena: string;
}
