import { Usuario } from '../../src/domain/usuarios/usuario.entity';
import { UsuarioRepositorio } from '../../src/domain/usuarios/usuario.repositorio';
import { construirMeta } from '../../src/domain/comun/paginacion';
import { RolUsuario } from '../../src/domain/usuarios/rol-usuario';
import { ErrorNoEncontrado } from '../../src/domain/comun/errores';
import { ParametrosListadoUsuarios } from '../../src/domain/usuarios/usuario.repositorio';

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

  crear(usuario: Usuario): Promise<Usuario> {
    this.agregar(usuario);
    return Promise.resolve(usuario);
  }

  listarPersonal(params: ParametrosListadoUsuarios) {
    return this.listarPorRoles(['ADMIN', 'PERSONAL'], params);
  }

  listarPublico(params: ParametrosListadoUsuarios) {
    return this.listarPorRoles(['PUBLICO'], params);
  }

  private listarPorRoles(roles: RolUsuario[], params: ParametrosListadoUsuarios) {
    const termino = params.busqueda?.toLowerCase() ?? '';
    const filtrados = [...this.usuarios.values()]
      .filter((usuario) => roles.includes(usuario.rol))
      .filter(
        (usuario) =>
          !termino ||
          usuario.nombre.toLowerCase().includes(termino) ||
          usuario.correo.includes(termino),
      )
      .sort((a, b) => {
        const comparacion = String(a[params.orden]).localeCompare(String(b[params.orden]));
        return (
          (params.direccion === 'asc' ? comparacion : -comparacion) || a.id.localeCompare(b.id)
        );
      });
    const inicio = (params.pagina - 1) * params.limite;
    return Promise.resolve({
      datos: filtrados.slice(inicio, inicio + params.limite),
      meta: construirMeta(params, filtrados.length),
    });
  }

  cambiarRol(id: string, rol: RolUsuario, fecha?: Date): Promise<Usuario> {
    const usuario = this.usuarios.get(id);
    if (!usuario)
      return Promise.reject(new ErrorNoEncontrado(`No se encontró el usuario "${id}".`));
    const actualizado = Usuario.reconstruir({
      id: usuario.id,
      nombre: usuario.nombre,
      correo: usuario.correo,
      contrasenaHash: usuario.contrasenaHash,
      rol,
      activo: usuario.activo,
      consentimientoEn: usuario.consentimientoEn,
      versionPrivacidad: usuario.versionPrivacidad,
      creadoEn: usuario.creadoEn,
      actualizadoEn: fecha ?? new Date(),
    });
    this.usuarios.set(id, actualizado);
    return Promise.resolve(actualizado);
  }

  desactivar(
    id: string,
    fecha?: Date,
    roles: RolUsuario[] = ['ADMIN', 'PERSONAL'],
  ): Promise<Usuario> {
    const usuario = this.usuarios.get(id);
    if (!usuario || !roles.includes(usuario.rol))
      return Promise.reject(new ErrorNoEncontrado(`No se encontró el usuario "${id}".`));
    const actualizado = Usuario.reconstruir({
      id: usuario.id,
      nombre: usuario.nombre,
      correo: usuario.correo,
      contrasenaHash: usuario.contrasenaHash,
      rol: usuario.rol,
      activo: false,
      consentimientoEn: usuario.consentimientoEn,
      versionPrivacidad: usuario.versionPrivacidad,
      creadoEn: usuario.creadoEn,
      actualizadoEn: fecha ?? new Date(),
    });
    this.usuarios.set(id, actualizado);
    return Promise.resolve(actualizado);
  }

  reactivar(id: string, roles: RolUsuario[] = ['ADMIN', 'PERSONAL']): Promise<Usuario> {
    const usuario = this.usuarios.get(id);
    if (!usuario || !roles.includes(usuario.rol))
      return Promise.reject(new ErrorNoEncontrado(`No se encontró el usuario "${id}".`));
    const actualizado = Usuario.reconstruir({
      id: usuario.id,
      nombre: usuario.nombre,
      correo: usuario.correo,
      contrasenaHash: usuario.contrasenaHash,
      rol: usuario.rol,
      activo: true,
      consentimientoEn: usuario.consentimientoEn,
      versionPrivacidad: usuario.versionPrivacidad,
      creadoEn: usuario.creadoEn,
      actualizadoEn: new Date(),
    });
    this.usuarios.set(id, actualizado);
    return Promise.resolve(actualizado);
  }
}
