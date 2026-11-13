import { ErrorRegla } from '../../domain/comun/errores';
import { VERSION_AVISO_PRIVACIDAD } from '../../domain/usuarios/aviso-privacidad';
import { CorreoUsuarioDuplicadoError } from '../../domain/usuarios/usuario.errores';
import { HasherContrasenasFalso } from '../../../test/dobles/seguridad.memoria';
import { UsuarioRepositorioMemoria } from '../../../test/dobles/usuario-repositorio.memoria';
import { RegistrarUsuario } from './registrar-usuario.use-case';

describe('RegistrarUsuario', () => {
  let usuarios: UsuarioRepositorioMemoria;
  let registrar: RegistrarUsuario;

  const datos = {
    nombre: 'Visitante de prueba',
    correo: 'Visitante@prueba.local',
    contrasena: 'Secreta.123',
    aceptaPrivacidad: true,
    versionPrivacidad: VERSION_AVISO_PRIVACIDAD,
  };

  beforeEach(() => {
    usuarios = new UsuarioRepositorioMemoria();
    registrar = new RegistrarUsuario(usuarios, new HasherContrasenasFalso());
  });

  it('crea la cuenta PUBLICO con hash y deja fecha y versión del consentimiento', async () => {
    const antes = Date.now();
    const resultado = await registrar.ejecutar(datos);

    expect(resultado).toMatchObject({
      nombre: 'Visitante de prueba',
      correo: 'visitante@prueba.local',
      rol: 'PUBLICO',
      versionPrivacidad: VERSION_AVISO_PRIVACIDAD,
    });
    expect(new Date(resultado.consentimientoEn ?? 0).getTime()).toBeGreaterThanOrEqual(antes);

    const guardado = await usuarios.buscarPorCorreo('visitante@prueba.local');
    expect(guardado?.contrasenaHash).toBe('hash(Secreta.123)');
    expect(guardado?.puedeIniciarSesion()).toBe(true);
  });

  it('no devuelve la contraseña ni su hash', async () => {
    const resultado = await registrar.ejecutar(datos);

    expect(JSON.stringify(resultado)).not.toContain('Secreta.123');
  });

  it('rechaza el registro sin consentimiento y no crea la cuenta', async () => {
    await expect(registrar.ejecutar({ ...datos, aceptaPrivacidad: false })).rejects.toThrow(
      ErrorRegla,
    );
    expect(usuarios.usuarios.size).toBe(0);
  });

  it('rechaza una versión del aviso que no es la vigente', async () => {
    await expect(registrar.ejecutar({ ...datos, versionPrivacidad: '0' })).rejects.toThrow(
      ErrorRegla,
    );
    expect(usuarios.usuarios.size).toBe(0);
  });

  it('rechaza un correo ya registrado aunque cambien las mayúsculas', async () => {
    await registrar.ejecutar(datos);

    await expect(
      registrar.ejecutar({ ...datos, correo: 'VISITANTE@prueba.local' }),
    ).rejects.toThrow(CorreoUsuarioDuplicadoError);
    expect(usuarios.usuarios.size).toBe(1);
  });
});
