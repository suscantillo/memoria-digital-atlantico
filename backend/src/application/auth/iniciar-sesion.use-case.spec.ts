import { ErrorNoAutorizado } from '../../domain/comun/errores';
import { Usuario } from '../../domain/usuarios/usuario.entity';
import {
  HasherContrasenasFalso,
  ServicioTokensFalso,
} from '../../../test/dobles/seguridad.memoria';
import { SesionRepositorioMemoria } from '../../../test/dobles/sesion-repositorio.memoria';
import { UsuarioRepositorioMemoria } from '../../../test/dobles/usuario-repositorio.memoria';
import { IniciarSesion } from './iniciar-sesion.use-case';
import { RefrescarSesion } from './refrescar-sesion.use-case';

describe('IniciarSesion y RefrescarSesion', () => {
  let usuarios: UsuarioRepositorioMemoria;
  let sesiones: SesionRepositorioMemoria;
  let hasher: HasherContrasenasFalso;
  let tokens: ServicioTokensFalso;
  let iniciar: IniciarSesion;
  let refrescar: RefrescarSesion;
  let admin: Usuario;

  beforeEach(async () => {
    usuarios = new UsuarioRepositorioMemoria();
    sesiones = new SesionRepositorioMemoria();
    hasher = new HasherContrasenasFalso();
    tokens = new ServicioTokensFalso();
    iniciar = new IniciarSesion(usuarios, sesiones, hasher, tokens);
    refrescar = new RefrescarSesion(usuarios, sesiones, tokens);

    admin = Usuario.crear({
      nombre: 'Admin de prueba',
      correo: 'admin@prueba.local',
      contrasenaHash: await hasher.hash('Secreta.123'),
      rol: 'ADMIN',
    });
    usuarios.agregar(admin);
  });

  it('entrega tokens y usuario con credenciales correctas', async () => {
    const sesion = await iniciar.ejecutar({
      correo: 'ADMIN@prueba.local',
      contrasena: 'Secreta.123',
    });

    expect(sesion.tokenAcceso).toBe(`acceso:${admin.id}:ADMIN`);
    expect(sesion.tokenRefresco).toBe('refresco-1');
    expect(sesion.usuario).toEqual({
      id: admin.id,
      nombre: 'Admin de prueba',
      correo: 'admin@prueba.local',
      rol: 'ADMIN',
    });
    expect(sesiones.sesiones.size).toBe(1);
  });

  it('persiste el refresco hasheado, nunca en claro', async () => {
    const sesion = await iniciar.ejecutar({
      correo: 'admin@prueba.local',
      contrasena: 'Secreta.123',
    });
    const guardada = [...sesiones.sesiones.values()][0];

    expect(guardada.tokenHash).toBe(tokens.hashRefresco(sesion.tokenRefresco));
    expect(guardada.tokenHash).not.toBe(sesion.tokenRefresco);
  });

  it('rechaza una contraseña incorrecta sin revelar si el correo existe', async () => {
    await expect(
      iniciar.ejecutar({ correo: 'admin@prueba.local', contrasena: 'otra' }),
    ).rejects.toThrow(ErrorNoAutorizado);
    await expect(
      iniciar.ejecutar({ correo: 'nadie@prueba.local', contrasena: 'otra' }),
    ).rejects.toThrow('Correo o contraseña incorrectos.');
    expect(sesiones.sesiones.size).toBe(0);
  });

  it('rota el token de refresco: el anterior deja de servir', async () => {
    const primera = await iniciar.ejecutar({
      correo: 'admin@prueba.local',
      contrasena: 'Secreta.123',
    });
    const segunda = await refrescar.ejecutar({ tokenRefresco: primera.tokenRefresco });

    expect(segunda.tokenRefresco).not.toBe(primera.tokenRefresco);
    await expect(refrescar.ejecutar({ tokenRefresco: primera.tokenRefresco })).rejects.toThrow(
      ErrorNoAutorizado,
    );
  });

  it('rechaza un token de refresco desconocido', async () => {
    await expect(refrescar.ejecutar({ tokenRefresco: 'inventado' })).rejects.toThrow(
      ErrorNoAutorizado,
    );
  });
});
