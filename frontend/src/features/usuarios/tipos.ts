import type { DireccionOrden, ResultadoPaginado } from '../../shared/tipos/api';
import type { RolUsuario } from '../../shared/tipos/usuario';

export type RolAdministrable = Extract<RolUsuario, 'ADMIN' | 'PERSONAL'>;
export type CampoOrdenUsuario = 'nombre' | 'correo' | 'rol' | 'creadoEn';

export interface UsuarioAdministrado {
  id: string;
  nombre: string;
  correo: string;
  rol: RolAdministrable;
  activo: boolean;
  creadoEn: string;
}

export interface ParametrosListarUsuarios {
  pagina: number;
  limite: number;
  orden: CampoOrdenUsuario;
  direccion: DireccionOrden;
  busqueda: string;
}

export interface CrearCuentaPersonal {
  nombre: string;
  correo: string;
  contrasenaTemporal: string;
}

export type UsuariosPaginados = ResultadoPaginado<UsuarioAdministrado>;
