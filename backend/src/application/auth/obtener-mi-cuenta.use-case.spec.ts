import { UsuarioRepositorioMemoria } from '../../../test/dobles/usuario-repositorio.memoria';
import { ErrorNoAutorizado } from '../../domain/comun/errores';
import { VERSION_AVISO_PRIVACIDAD } from '../../domain/usuarios/aviso-privacidad';
import { Usuario } from '../../domain/usuarios/usuario.entity';
import { ObtenerMiCuenta } from './obtener-mi-cuenta.use-case';

describe('ObtenerMiCuenta', () => {
  let usuarios: UsuarioRepositorioMemoria;
  let obtener: ObtenerMiCuenta;

  beforeEach(() => {
    usuarios = new UsuarioRepositorioMemoria();
    obtener = new ObtenerMiCuenta(usuarios);
  });

  it('muestra nombre, correo y consentimiento de una cuenta del portal, sin la contraseña', async () => {
    const ana = Usuario.registrarPublico({
      nombre: 'Ana Pérez',
      correo: 'ana@ejemplo.com',
      contrasenaHash: 'hash-secreto',
      aceptaPrivacidad: true,
      versionPrivacidad: VERSION_AVISO_PRIVACIDAD,
    });
    usuarios.agregar(ana);

    const cuenta = await obtener.ejecutar(ana.id);

    expect(cuenta).toMatchObject({
      nombre: 'Ana Pérez',
      correo: 'ana@ejemplo.com',
      rol: 'PUBLICO',
      versionPrivacidad: VERSION_AVISO_PRIVACIDAD,
      puedeEliminarla: true,
    });
    expect(cuenta.consentimientoEn).toBeInstanceOf(Date);
    expect(JSON.stringify(cuenta)).not.toContain('hash-secreto');
  });

  it('una cuenta del personal se ve, pero no se puede eliminar desde aquí', async () => {
    const personal = Usuario.crear({
      nombre: 'Luis',
      correo: 'luis@clena.org',
      contrasenaHash: 'hash',
      rol: 'PERSONAL',
    });
    usuarios.agregar(personal);

    const cuenta = await obtener.ejecutar(personal.id);

    expect(cuenta).toMatchObject({ consentimientoEn: null, puedeEliminarla: false });
  });

  it('una cuenta que ya no existe responde 401', async () => {
    await expect(obtener.ejecutar('no-existe')).rejects.toBeInstanceOf(ErrorNoAutorizado);
  });
});
