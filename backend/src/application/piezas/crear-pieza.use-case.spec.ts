import { CodigoPieza } from '../../domain/piezas/codigo-pieza';
import { Pieza } from '../../domain/piezas/pieza.entity';
import { PiezaRepositorio } from '../../domain/piezas/pieza.repositorio';
import { CrearPieza } from './crear-pieza.use-case';

describe('CrearPieza', () => {
  const piezaRegistrada = Pieza.reconstruir({
    id: 'pieza-id',
    codigo: CodigoPieza.generar(2026, 11),
    titulo: 'Acta histórica',
    descripcion: null,
    tipo: 'DOCUMENTO',
    estado: 'REGISTRADA',
    anio: 1888,
    restringida: false,
    ubicacion: {
      id: 'ubicacion-id',
      deposito: 'Depósito 1',
      estanteria: 'Estantería A',
      caja: 'Caja 01',
    },
    archivoAprobado: null,
    creadoEn: new Date('2026-11-09T12:00:00.000Z'),
    actualizadoEn: new Date('2026-11-09T12:00:00.000Z'),
  });

  let registrar: jest.MockedFunction<PiezaRepositorio['registrar']>;
  let casoDeUso: CrearPieza;

  beforeEach(() => {
    registrar = jest.fn().mockResolvedValue(piezaRegistrada);
    casoDeUso = new CrearPieza({ registrar });
  });

  it('registra la pieza con el usuario autenticado y devuelve el código generado', async () => {
    const resultado = await casoDeUso.ejecutar(
      {
        tipo: 'DOCUMENTO',
        titulo: ' Acta histórica ',
        anio: 1888,
        ubicacionId: 'ubicacion-id',
      },
      'personal-id',
    );

    expect(registrar).toHaveBeenCalledTimes(1);

    expect(registrar).toHaveBeenCalledWith(
      {
        tipo: 'DOCUMENTO',
        titulo: 'Acta histórica',
        anio: 1888,
        ubicacionId: 'ubicacion-id',
      },
      'personal-id',
    );

    expect(resultado).toMatchObject({
      codigo: 'MDA-2026-0011',
      titulo: 'Acta histórica',
      estado: 'REGISTRADA',
      anio: 1888,
      ubicacionId: 'ubicacion-id',
    });
  });
});
