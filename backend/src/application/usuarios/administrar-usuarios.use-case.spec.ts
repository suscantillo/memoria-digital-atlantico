import { ErrorRegla } from '../../domain/comun/errores';
import { CorreoUsuarioDuplicadoError } from '../../domain/usuarios/usuario.errores';
import { Usuario } from '../../domain/usuarios/usuario.entity';
import { UsuarioRepositorioMemoria } from '../../../test/dobles/usuario-repositorio.memoria';
import { CambiarRolUsuario } from './cambiar-rol-usuario.use-case';
import { CrearCuentaPersonal } from './crear-cuenta-personal.use-case';
import { DesactivarUsuario } from './desactivar-usuario.use-case';
import { ListarUsuarios } from './listar-usuarios.use-case';

describe('Administración de usuarios', () => {
  let repositorio: UsuarioRepositorioMemoria;

  beforeEach(() => {
    repositorio = new UsuarioRepositorioMemoria();
  });

  it('crea una cuenta PERSONAL con la contraseña hasheada', async () => {
    const hasher = {
      hash: jest.fn((contrasena: string) => Promise.resolve(`hash:${contrasena}`)),
      comparar: jest.fn(() => Promise.resolve(false)),
    };
    const casoDeUso = new CrearCuentaPersonal(repositorio, hasher);

    const resultado = await casoDeUso.ejecutar({
      nombre: ' Ana Personal ',
      correo: ' ANA@CLENA.ORG ',
      contrasenaTemporal: 'clave-segura-123',
    });

    expect(resultado).toMatchObject({
      nombre: 'Ana Personal',
      correo: 'ana@clena.org',
      rol: 'PERSONAL',
      activo: true,
    });
    await expect(repositorio.buscarPorCorreo('ana@clena.org')).resolves.toMatchObject({
      contrasenaHash: 'hash:clave-segura-123',
    });
  });

  it('rechaza un correo ya registrado', async () => {
    repositorio.agregar(
      Usuario.crear({
        nombre: 'Ana',
        correo: 'ana@clena.org',
        contrasenaHash: 'hash',
        rol: 'PERSONAL',
      }),
    );
    const casoDeUso = new CrearCuentaPersonal(repositorio, {
      hash: jest.fn(() => Promise.resolve('hash')),
      comparar: jest.fn(() => Promise.resolve(false)),
    });

    await expect(
      casoDeUso.ejecutar({
        nombre: 'Ana duplicada',
        correo: 'ana@clena.org',
        contrasenaTemporal: 'clave-segura-123',
      }),
    ).rejects.toBeInstanceOf(CorreoUsuarioDuplicadoError);
  });

  it('lista solamente cuentas de ADMIN y PERSONAL, con paginación', async () => {
    repositorio.agregar(
      Usuario.crear({
        nombre: 'Berta',
        correo: 'berta@clena.org',
        contrasenaHash: 'hash',
        rol: 'PERSONAL',
      }),
    );
    repositorio.agregar(
      Usuario.crear({
        nombre: 'Admin',
        correo: 'admin@clena.org',
        contrasenaHash: 'hash',
        rol: 'ADMIN',
      }),
    );
    repositorio.agregar(
      Usuario.crear({
        nombre: 'Visitante',
        correo: 'publico@clena.org',
        contrasenaHash: 'hash',
        rol: 'PUBLICO',
      }),
    );

    const resultado = await new ListarUsuarios(repositorio).ejecutar({
      pagina: 1,
      limite: 1,
      direccion: 'asc',
      orden: 'nombre',
    });

    expect(resultado.datos).toHaveLength(1);
    expect(resultado.meta).toMatchObject({ pagina: 1, limite: 1, total: 2, totalPaginas: 2 });
  });

  it('cambia el rol y evita que el administrador cambie su propio rol', async () => {
    const personal = Usuario.crear({
      nombre: 'Ana',
      correo: 'ana@clena.org',
      contrasenaHash: 'hash',
      rol: 'PERSONAL',
    });
    repositorio.agregar(personal);
    const casoDeUso = new CambiarRolUsuario(repositorio);

    await expect(casoDeUso.ejecutar(personal.id, 'ADMIN', 'otro-id')).resolves.toMatchObject({
      rol: 'ADMIN',
    });
    await expect(casoDeUso.ejecutar(personal.id, 'PERSONAL', personal.id)).rejects.toBeInstanceOf(
      ErrorRegla,
    );
  });

  it('desactiva una cuenta y evita que el administrador se desactive a sí mismo', async () => {
    const personal = Usuario.crear({
      nombre: 'Ana',
      correo: 'ana@clena.org',
      contrasenaHash: 'hash',
      rol: 'PERSONAL',
    });
    repositorio.agregar(personal);
    const casoDeUso = new DesactivarUsuario(repositorio);

    await expect(casoDeUso.ejecutar(personal.id, 'admin-id')).resolves.toMatchObject({
      activo: false,
    });
    await expect(casoDeUso.ejecutar(personal.id, personal.id)).rejects.toBeInstanceOf(ErrorRegla);
  });
});
