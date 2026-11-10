import { ErrorNoEncontrado } from '../../domain/comun/errores';
import { CodigoPieza } from '../../domain/piezas/codigo-pieza';
import { FichaPieza, Pieza } from '../../domain/piezas/pieza.entity';
import { PiezaRepositorio } from '../../domain/piezas/pieza.repositorio';
import { ObtenerFichaPieza } from './obtener-ficha-pieza.use-case';

describe('ObtenerFichaPieza', () => {
  const creadaEn = new Date('2026-11-09T12:00:00.000Z');
  const ficha: FichaPieza = {
    pieza: Pieza.reconstruir({
      id: 'pieza-id',
      codigo: CodigoPieza.generar(2026, 11),
      titulo: 'Acta histórica',
      tipo: 'DOCUMENTO',
      estado: 'REGISTRADA',
      anio: 1888,
      descripcion: null,
      ubicacionId: 'ubicacion-id',
      creadoEn: creadaEn,
      actualizadoEn: creadaEn,
    }),
    ubicacion: {
      id: 'ubicacion-id',
      deposito: 'Depósito A',
      estanteria: 'Estantería 1',
      caja: 'Caja 01',
    },
    eventos: [
      {
        id: 'evento-id',
        usuarioId: 'personal-id',
        usuarioNombre: 'Personal de prueba',
        accion: 'REGISTRADA',
        detalle: 'Registro inicial.',
        creadoEn: creadaEn,
      },
    ],
  };
  const buscarFicha = jest.fn<
    ReturnType<PiezaRepositorio['buscarFicha']>,
    Parameters<PiezaRepositorio['buscarFicha']>
  >();
  const piezas: PiezaRepositorio = {
    registrar: () => Promise.reject(new Error('No se esperaba registrar una pieza.')),
    buscarFicha: (...argumentos) => buscarFicha(...argumentos),
    editar: () => Promise.reject(new Error('No se esperaba editar una pieza.')),
  };
  const casoDeUso = new ObtenerFichaPieza(piezas);

  beforeEach(() => {
    buscarFicha.mockReset().mockResolvedValue(ficha);
  });

  it('devuelve los datos, ubicación e historial de la ficha', async () => {
    await expect(casoDeUso.ejecutar('pieza-id')).resolves.toMatchObject({
      codigo: 'MDA-2026-0011',
      estado: 'REGISTRADA',
      ubicacion: { deposito: 'Depósito A', estanteria: 'Estantería 1', caja: 'Caja 01' },
      eventos: [{ accion: 'REGISTRADA', usuarioNombre: 'Personal de prueba' }],
    });
  });

  it('rechaza una pieza inexistente', async () => {
    buscarFicha.mockResolvedValue(null);

    await expect(casoDeUso.ejecutar('inexistente')).rejects.toBeInstanceOf(ErrorNoEncontrado);
  });
});
