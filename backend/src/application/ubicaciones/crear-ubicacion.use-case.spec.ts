import { ErrorRegla } from '../../domain/comun/errores';
import { UbicacionDuplicadaError } from '../../domain/ubicaciones/ubicacion.errores';
import { UbicacionRepositorioMemoria } from '../../../test/dobles/ubicacion-repositorio.memoria';
import { CrearUbicacion } from './crear-ubicacion.use-case';

describe('CrearUbicacion', () => {
  let repositorio: UbicacionRepositorioMemoria;
  let casoDeUso: CrearUbicacion;

  beforeEach(() => {
    repositorio = new UbicacionRepositorioMemoria();
    casoDeUso = new CrearUbicacion(repositorio);
  });

  it('crea la ubicación y la devuelve con id y etiqueta', async () => {
    const resultado = await casoDeUso.ejecutar({
      deposito: 'Depósito A',
      estanteria: 'Estantería 3',
      caja: 'Caja 12',
      descripcion: 'Fotografías de prueba',
    });

    expect(resultado.id).toMatch(/^[0-9a-f-]{36}$/);
    expect(resultado.etiqueta).toBe('Depósito A / Estantería 3 / Caja 12');
    expect(resultado.descripcion).toBe('Fotografías de prueba');
    expect(repositorio.ubicaciones.size).toBe(1);
  });

  it('recorta espacios y guarda la descripción vacía como null', async () => {
    const resultado = await casoDeUso.ejecutar({
      deposito: '  Depósito A ',
      estanteria: ' Estantería 3',
      caja: 'Caja 12  ',
      descripcion: '   ',
    });

    expect(resultado.deposito).toBe('Depósito A');
    expect(resultado.estanteria).toBe('Estantería 3');
    expect(resultado.caja).toBe('Caja 12');
    expect(resultado.descripcion).toBeNull();
  });

  it('rechaza una terna depósito/estantería/caja repetida', async () => {
    const terna = { deposito: 'Depósito A', estanteria: 'Estantería 3', caja: 'Caja 12' };
    await casoDeUso.ejecutar(terna);

    await expect(casoDeUso.ejecutar({ ...terna, descripcion: 'otra' })).rejects.toBeInstanceOf(
      UbicacionDuplicadaError,
    );
    expect(repositorio.ubicaciones.size).toBe(1);
  });

  it('considera repetida la terna aunque venga con espacios distintos', async () => {
    await casoDeUso.ejecutar({ deposito: 'Depósito A', estanteria: 'E1', caja: 'C1' });

    await expect(
      casoDeUso.ejecutar({ deposito: ' Depósito A ', estanteria: 'E1 ', caja: ' C1' }),
    ).rejects.toBeInstanceOf(UbicacionDuplicadaError);
  });

  it('permite la misma caja en otra estantería', async () => {
    await casoDeUso.ejecutar({ deposito: 'Depósito A', estanteria: 'E1', caja: 'C1' });
    await casoDeUso.ejecutar({ deposito: 'Depósito A', estanteria: 'E2', caja: 'C1' });

    expect(repositorio.ubicaciones.size).toBe(2);
  });

  it('rechaza una terna con campos vacíos', async () => {
    await expect(
      casoDeUso.ejecutar({ deposito: 'Depósito A', estanteria: '   ', caja: 'C1' }),
    ).rejects.toBeInstanceOf(ErrorRegla);
    expect(repositorio.ubicaciones.size).toBe(0);
  });
});
