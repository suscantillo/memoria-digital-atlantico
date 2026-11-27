import { HasherContrasenasFalso } from '../../../test/dobles/seguridad.memoria';
import { UsuarioRepositorioMemoria } from '../../../test/dobles/usuario-repositorio.memoria';
import { ErrorNoAutorizado, ErrorProhibido, ErrorRegla } from '../../domain/comun/errores';
import { VERSION_AVISO_PRIVACIDAD } from '../../domain/usuarios/aviso-privacidad';
import { Usuario } from '../../domain/usuarios/usuario.entity';
import { EliminarMiCuenta } from './eliminar-mi-cuenta.use-case';

describe('EliminarMiCuenta', () => {
  let usuarios: UsuarioRepositorioMemoria;
  let eliminar: EliminarMiCuenta;
  let ana: Usuario;

  beforeEach(() => {
    usuarios = new UsuarioRepositorioMemoria();
    eliminar = new EliminarMiCuenta(usuarios, new HasherContrasenasFalso());
    ana = Usuario.registrarPublico({
      nombre: 'Ana Pérez',
      correo: 'ana@ejemplo.com',
      contrasenaHash: 'hash(Clave.2026)',
      aceptaPrivacidad: true,
      versionPrivacidad: VERSION_AVISO_PRIVACIDAD,
    });
    usuarios.agregar(ana);
  });

  it('con la contraseña correcta elimina la cuenta del portal', async () => {
    await eliminar.ejecutar(ana.id, { contrasena: 'Clave.2026' });

    expect(await usuarios.buscarPorId(ana.id)).toBeNull();
  });

  it('con otra contraseña no elimina nada y responde 422, no 401', async () => {
    await expect(eliminar.ejecutar(ana.id, { contrasena: 'otra' })).rejects.toBeInstanceOf(
      ErrorRegla,
    );
    expect(await usuarios.buscarPorId(ana.id)).not.toBeNull();
  });

  it('una cuenta del personal no se puede eliminar a sí misma', async () => {
    const personal = Usuario.crear({
      nombre: 'Luis',
      correo: 'luis@clena.org',
      contrasenaHash: 'hash(Clave.2026)',
      rol: 'PERSONAL',
    });
    usuarios.agregar(personal);

    await expect(
      eliminar.ejecutar(personal.id, { contrasena: 'Clave.2026' }),
    ).rejects.toBeInstanceOf(ErrorProhibido);
    expect(await usuarios.buscarPorId(personal.id)).not.toBeNull();
  });

  it('una cuenta que ya no existe responde 401', async () => {
    await expect(
      eliminar.ejecutar('no-existe', { contrasena: 'Clave.2026' }),
    ).rejects.toBeInstanceOf(ErrorNoAutorizado);
  });
});
