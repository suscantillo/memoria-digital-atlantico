import { Pieza, PiezaNoEncontradaError, PropiedadesPieza } from '../../domain/piezas/pieza.entity';
import { PiezaRepositorioMemoria } from '../../../test/dobles/pieza-repositorio.memoria';
import { ObtenerPiezaPortal } from './obtener-pieza-portal.use-case';

function fabricarPieza(parcial: Partial<PropiedadesPieza> = {}): Pieza {
  const ahora = new Date('2026-11-10T00:00:00.000Z');
  return Pieza.reconstruir({
    id: '11111111-1111-1111-1111-111111111111',
    codigo: 'MDA-2026-0004',
    titulo: 'Fotografía ficticia de una fábrica textil',
    descripcion: 'Descripción de prueba de la pieza',
    tipo: 'FOTOGRAFIA',
    estado: 'PUBLICADA',
    anio: 1948,
    restringida: false,
    ubicacion: {
      id: '22222222-2222-2222-2222-222222222222',
      deposito: 'Depósito A',
      estanteria: 'Estantería 1',
      caja: 'Caja 02',
    },
    archivoAprobado: {
      id: '33333333-3333-3333-3333-333333333333',
      tipoMime: 'image/png',
    },
    creadoEn: ahora,
    actualizadoEn: ahora,
    ...parcial,
  });
}

describe('ObtenerPiezaPortal', () => {
  let repositorio: PiezaRepositorioMemoria;
  let casoDeUso: ObtenerPiezaPortal;

  beforeEach(() => {
    repositorio = new PiezaRepositorioMemoria();
    casoDeUso = new ObtenerPiezaPortal(repositorio);
  });

  it('devuelve la ficha pública con archivo y ubicación cuando la pieza existe', async () => {
    repositorio.agregar(fabricarPieza());

    const resultado = await casoDeUso.ejecutar('  mda-2026-0004 ');

    expect(resultado).toEqual({
      codigo: 'MDA-2026-0004',
      tipo: 'FOTOGRAFIA',
      restringida: false,
      titulo: 'Fotografía ficticia de una fábrica textil',
      descripcion: 'Descripción de prueba de la pieza',
      anio: 1948,
      archivo: {
        url: '/api/v1/archivos/33333333-3333-3333-3333-333333333333/contenido',
        tipoMime: 'image/png',
      },
      ubicacion: {
        id: '22222222-2222-2222-2222-222222222222',
        deposito: 'Depósito A',
        estanteria: 'Estantería 1',
        caja: 'Caja 02',
      },
    });
  });

  it('devuelve archivo null si la pieza aún no tiene copia digital aprobada', async () => {
    repositorio.agregar(
      fabricarPieza({ codigo: 'MDA-2026-0001', estado: 'REGISTRADA', archivoAprobado: null }),
    );

    const resultado = await casoDeUso.ejecutar('MDA-2026-0001');

    expect(resultado.archivo).toBeNull();
    expect(resultado.titulo).toBe('Fotografía ficticia de una fábrica textil');
    expect(resultado.ubicacion.caja).toBe('Caja 02');
  });

  it('oculta título, descripción, año y archivo cuando la pieza es restringida', async () => {
    repositorio.agregar(fabricarPieza({ codigo: 'MDA-2026-0007', restringida: true }));

    const resultado = await casoDeUso.ejecutar('MDA-2026-0007');

    expect(resultado).toEqual({
      codigo: 'MDA-2026-0007',
      tipo: 'FOTOGRAFIA',
      restringida: true,
      titulo: null,
      descripcion: null,
      anio: null,
      archivo: null,
      ubicacion: {
        id: '22222222-2222-2222-2222-222222222222',
        deposito: 'Depósito A',
        estanteria: 'Estantería 1',
        caja: 'Caja 02',
      },
    });
  });

  it('lanza PiezaNoEncontradaError cuando el código no existe', async () => {
    await expect(casoDeUso.ejecutar('MDA-2026-9999')).rejects.toBeInstanceOf(
      PiezaNoEncontradaError,
    );
  });
});
