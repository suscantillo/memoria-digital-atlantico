import { DireccionOrden, ParametrosPaginacion, ResultadoPaginado } from '../comun/paginacion';
import { RolUsuario } from './rol-usuario';
import { Usuario } from './usuario.entity';

export const USUARIO_REPOSITORIO = Symbol('USUARIO_REPOSITORIO');

export type CampoOrdenUsuario = 'nombre' | 'correo' | 'rol' | 'creadoEn';

export interface ParametrosListadoUsuarios extends ParametrosPaginacion {
  busqueda?: string;
  orden: CampoOrdenUsuario;
  direccion: DireccionOrden;
}

export interface UsuarioRepositorio {
  buscarPorId(id: string): Promise<Usuario | null>;
  buscarPorCorreo(correo: string): Promise<Usuario | null>;
  crear(usuario: Usuario): Promise<Usuario>;
  listarPersonal(params: ParametrosListadoUsuarios): Promise<ResultadoPaginado<Usuario>>;
  /** Cuentas PUBLICO del portal, para que el ADMIN las consulte. */
  listarPublico(params: ParametrosListadoUsuarios): Promise<ResultadoPaginado<Usuario>>;
  cambiarRol(id: string, rol: RolUsuario, fecha: Date): Promise<Usuario>;
  /** `roles`: a qué cuentas aplica; por defecto las del personal. */
  desactivar(id: string, fecha: Date, roles?: RolUsuario[]): Promise<Usuario>;
  reactivar(id: string, roles?: RolUsuario[]): Promise<Usuario>;
}
