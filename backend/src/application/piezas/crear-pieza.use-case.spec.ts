import { CodigoPieza } from '../../domain/piezas/codigo-pieza';
import { Pieza } from '../../domain/piezas/pieza.entity';
import { PiezaRepositorio } from '../../domain/piezas/pieza.repositorio';
import { CrearPieza } from './crear-pieza.use-case';

describe('CrearPieza', () => {
  const piezaRegistrada = Pieza.reconstruir({
    id: 'pieza-id',
    codigo: CodigoPieza.generar(2026, 11),
    titulo: 'Acta histórica',
    tipo: 'DOCUMENTO',
    estado: 'REGISTRADA',
    anio: 1888,
    descripcion: null,
    ubicacionId: 'ubicacion-id',
    creadoEn: new Date('2026-11-09T12:00:00.000Z'),
    actualizadoEn: new Date('2026-11-09T12:00:00.000Z'),
  });
  const registrar = jest.fn<
    ReturnType<PiezaRepositorio['registrar']>,
    Parameters<PiezaRepositorio['registrar']>
  >();
  const repositorio: PiezaRepositorio = {
    registrar: (...argumentos) => registrar(...argumentos),
    buscarFicha: () => Promise.resolve(null),
    editar: () => Promise.reject(new Error('No se esperaba editar una pieza.')),
  };
  let casoDeUso: CrearPieza;

  beforeEach(() => {
    registrar.mockReset().mockResolvedValue(piezaRegistrada);
    casoDeUso = new CrearPieza(repositorio);
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
    });
  });
});
