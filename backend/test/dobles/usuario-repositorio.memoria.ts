import { Usuario } from '../../src/domain/usuarios/usuario.entity';
import { UsuarioRepositorio } from '../../src/domain/usuarios/usuario.repositorio';

export class UsuarioRepositorioMemoria implements UsuarioRepositorio {
  readonly usuarios = new Map<string, Usuario>();

  agregar(usuario: Usuario): void {
    this.usuarios.set(usuario.id, usuario);
  }

  buscarPorId(id: string): Promise<Usuario | null> {
    return Promise.resolve(this.usuarios.get(id) ?? null);
  }

  buscarPorCorreo(correo: string): Promise<Usuario | null> {
    return Promise.resolve([...this.usuarios.values()].find((u) => u.correo === correo) ?? null);
  }
}
