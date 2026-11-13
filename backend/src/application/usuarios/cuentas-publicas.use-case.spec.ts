import { ErrorNoEncontrado } from '../../domain/comun/errores';
import { Usuario } from '../../domain/usuarios/usuario.entity';
import { UsuarioRepositorioMemoria } from '../../../test/dobles/usuario-repositorio.memoria';
import {
  DesactivarCuentaPublica,
  ListarCuentasPublicas,
  ReactivarCuentaPublica,
} from './cuentas-publicas.use-case';

const CONSULTA = { pagina: 1, limite: 20, orden: 'nombre', direccion: 'asc' } as const;

describe('Cuentas del portal', () => {
  let repositorio: UsuarioRepositorioMemoria;
  let lectora: Usuario;
  let personal: Usuario;

  beforeEach(() => {
    repositorio = new UsuarioRepositorioMemoria();
    lectora = Usuario.registrarPublico({
      nombre: 'Lectora del portal',
      correo: 'lectora@correo.co',
      contrasenaHash: 'hash',
      aceptaPrivacidad: true,
      versionPrivacidad: '1',
    });
    personal = Usuario.crear({
      nombre: 'Ana',
      correo: 'ana@clena.org',
      contrasenaHash: 'hash',
      rol: 'PERSONAL',
    });
    repositorio.agregar(lectora);
    repositorio.agregar(personal);
  });

  it('lista solo las cuentas PUBLICO, con su consentimiento', async () => {
    const resultado = await new ListarCuentasPublicas(repositorio).ejecutar({ ...CONSULTA });

    expect(resultado.meta.total).toBe(1);
    expect(resultado.datos[0]).toMatchObject({
      correo: 'lectora@correo.co',
      activo: true,
      versionPrivacidad: '1',
    });
    expect(resultado.datos[0].consentimientoEn).not.toBeNull();
    expect(resultado.datos[0]).not.toHaveProperty('rol');
  });

  it('busca por nombre o correo', async () => {
    const resultado = await new ListarCuentasPublicas(repositorio).ejecutar({
      ...CONSULTA,
      busqueda: 'nadie',
    });
    expect(resultado.datos).toEqual([]);
  });

  it('desactiva y reactiva una cuenta del portal', async () => {
    await expect(
      new DesactivarCuentaPublica(repositorio).ejecutar(lectora.id),
    ).resolves.toMatchObject({ activo: false });
    await expect(
      new ReactivarCuentaPublica(repositorio).ejecutar(lectora.id),
    ).resolves.toMatchObject({ activo: true });
  });

  it('no toca cuentas del personal por estas rutas', async () => {
    await expect(
      new DesactivarCuentaPublica(repositorio).ejecutar(personal.id),
    ).rejects.toBeInstanceOf(ErrorNoEncontrado);
  });
});
