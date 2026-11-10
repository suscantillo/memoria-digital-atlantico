import { ErrorRegla } from '../../domain/comun/errores';
import { CodigoPieza } from '../../domain/piezas/codigo-pieza';
import { FichaPieza, Pieza } from '../../domain/piezas/pieza.entity';
import { PiezaRepositorio } from '../../domain/piezas/pieza.repositorio';
import { EditarPieza } from './editar-pieza.use-case';

describe('EditarPieza', () => {
  const fecha = new Date('2026-11-09T12:00:00.000Z');
  const ficha: FichaPieza = {
    pieza: Pieza.reconstruir({
      id: 'pieza-id',
      codigo: CodigoPieza.generar(2026, 11),
      titulo: 'Acta corregida',
      tipo: 'DOCUMENTO',
      estado: 'REGISTRADA',
      anio: 1888,
      descripcion: 'Descripción actualizada',
      ubicacionId: 'ubicacion-id',
      creadoEn: fecha,
      actualizadoEn: fecha,
    }),
    ubicacion: {
      id: 'ubicacion-id',
      deposito: 'Depósito A',
      estanteria: 'Estantería 1',
      caja: 'Caja 01',
    },
    eventos: [],
  };
  const editar = jest.fn<
    ReturnType<PiezaRepositorio['editar']>,
    Parameters<PiezaRepositorio['editar']>
  >();
  const piezas: PiezaRepositorio = {
    registrar: () => Promise.reject(new Error('No se esperaba registrar una pieza.')),
    buscarFicha: () => Promise.resolve(null),
    editar: (...argumentos) => editar(...argumentos),
  };
  const casoDeUso = new EditarPieza(piezas);

  beforeEach(() => {
    editar.mockReset().mockResolvedValue(ficha);
  });

  it('normaliza y persiste únicamente los campos editados con el usuario', async () => {
    await expect(
      casoDeUso.ejecutar(
        'pieza-id',
        { titulo: ' Acta corregida ', descripcion: ' Descripción actualizada ' },
        'personal-id',
      ),
    ).resolves.toMatchObject({
      titulo: 'Acta corregida',
      descripcion: 'Descripción actualizada',
    });
    expect(editar).toHaveBeenCalledWith(
      'pieza-id',
      { titulo: 'Acta corregida', descripcion: 'Descripción actualizada' },
      'personal-id',
    );
  });

  it('rechaza guardar cuando no se indicó ningún campo', async () => {
    await expect(casoDeUso.ejecutar('pieza-id', {}, 'personal-id')).rejects.toBeInstanceOf(
      ErrorRegla,
    );
    expect(editar).not.toHaveBeenCalled();
  });

  it('rechaza un título vacío', async () => {
    await expect(
      casoDeUso.ejecutar('pieza-id', { titulo: '   ' }, 'personal-id'),
    ).rejects.toBeInstanceOf(ErrorRegla);
  });
});
