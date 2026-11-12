import { Usuario } from './usuario.entity';

export const USUARIO_REPOSITORIO = Symbol('USUARIO_REPOSITORIO');

export interface UsuarioRepositorio {
  buscarPorId(id: string): Promise<Usuario | null>;
  buscarPorCorreo(correo: string): Promise<Usuario | null>;
  crear(usuario: Usuario): Promise<Usuario>;
}
