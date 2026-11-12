import { PiezaRepositorioMemoria } from '../../../test/dobles/pieza-repositorio.memoria';
import { CodigoPieza } from '../../domain/piezas/codigo-pieza';
import { Pieza, PropiedadesPieza } from '../../domain/piezas/pieza.entity';
import { BuscarPiezasPortal } from './buscar-piezas-portal.use-case';
import { BuscarPiezasPortalDto } from './dto/buscar-piezas-portal.dto';

let consecutivo = 0;

function pieza(parcial: Partial<PropiedadesPieza> = {}): Pieza {
  consecutivo += 1;
  const ahora = new Date('2026-11-10T00:00:00.000Z');
  return Pieza.reconstruir({
    id: `00000000-0000-0000-0000-${String(consecutivo).padStart(12, '0')}`,
    codigo: CodigoPieza.generar(2026, consecutivo),
    titulo: `Pieza ${consecutivo}`,
    descripcion: null,
    tipo: 'DOCUMENTO',
    estado: 'PUBLICADA',
    anio: 1900,
    restringida: false,
    ubicacion: { id: 'u-1', deposito: 'Depósito A', estanteria: 'Estantería 1', caja: 'Caja 01' },
    archivoAprobado: null,
    creadoEn: ahora,
    actualizadoEn: ahora,
    ...parcial,
  });
}

function consulta(parcial: Partial<BuscarPiezasPortalDto> = {}): BuscarPiezasPortalDto {
  return Object.assign(new BuscarPiezasPortalDto(), parcial);
}

describe('BuscarPiezasPortal', () => {
  let repositorio: PiezaRepositorioMemoria;
  let buscar: BuscarPiezasPortal;

  beforeEach(() => {
    consecutivo = 0;
    repositorio = new PiezaRepositorioMemoria();
    buscar = new BuscarPiezasPortal(repositorio);
    repositorio.agregar(
      pieza({ titulo: 'Comparsa de carnaval en la plaza', tipo: 'FOTOGRAFIA', anio: 1946 }),
    );
    repositorio.agregar(
      pieza({ titulo: 'Crónica del Carnaval de 1921', tipo: 'PERIODICO', anio: 1921 }),
    );
    repositorio.agregar(
      pieza({
        titulo: 'Acta de un cabildo',
        descripcion: 'Menciona los permisos del carnaval',
        anio: 1925,
      }),
    );
    repositorio.agregar(
      pieza({ titulo: 'Reina del carnaval sin publicar', tipo: 'FOTOGRAFIA', estado: 'REVISADA' }),
    );
    repositorio.agregar(
      pieza({ titulo: 'Expediente del carnaval reservado', anio: 1924, restringida: true }),
    );
  });

  it('sin filtros lista solo las publicadas, con las restringidas al final y sin sus datos', async () => {
    const resultado = await buscar.ejecutar(consulta());

    expect(resultado.meta).toEqual({ pagina: 1, limite: 20, total: 4, totalPaginas: 1 });
    expect(resultado.datos.map((p) => p.titulo)).toEqual([
      'Acta de un cabildo',
      'Comparsa de carnaval en la plaza',
      'Crónica del Carnaval de 1921',
      null,
    ]);
    const restringida = resultado.datos[3];
    expect(restringida).toMatchObject({ restringida: true, tipo: 'DOCUMENTO', anio: null });
    expect(restringida.ubicacion.deposito).toBe('Depósito A');
  });

  it('busca el texto en título y descripción sin distinguir mayúsculas', async () => {
    const resultado = await buscar.ejecutar(consulta({ busqueda: '  CARNAVAL ' }));

    expect(resultado.datos.map((p) => p.codigo)).toEqual([
      'MDA-2026-0003',
      'MDA-2026-0001',
      'MDA-2026-0002',
    ]);
  });

  it('combina texto y tipo', async () => {
    const resultado = await buscar.ejecutar(consulta({ busqueda: 'carnaval', tipo: 'FOTOGRAFIA' }));

    expect(resultado.meta.total).toBe(1);
    expect(resultado.datos[0].titulo).toBe('Comparsa de carnaval en la plaza');
  });

  it('filtra por década', async () => {
    const resultado = await buscar.ejecutar(consulta({ decada: 1920, orden: 'anio' }));

    expect(resultado.datos.map((p) => p.anio)).toEqual([1921, 1925]);
  });

  it('no encuentra piezas restringidas por texto ni por década', async () => {
    const porTexto = await buscar.ejecutar(consulta({ busqueda: 'reservado' }));
    const porDecada = await buscar.ejecutar(consulta({ decada: 1920 }));

    expect(porTexto.meta.total).toBe(0);
    expect(porDecada.datos.every((p) => !p.restringida)).toBe(true);
  });

  it('el filtro por tipo sí incluye las restringidas', async () => {
    const resultado = await buscar.ejecutar(consulta({ tipo: 'DOCUMENTO' }));

    expect(resultado.datos.map((p) => p.restringida)).toEqual([false, true]);
  });

  it('pagina y ordena de forma descendente', async () => {
    const resultado = await buscar.ejecutar(
      consulta({ limite: 2, pagina: 2, orden: 'codigo', direccion: 'desc' }),
    );

    expect(resultado.meta).toEqual({ pagina: 2, limite: 2, total: 4, totalPaginas: 2 });
    expect(resultado.datos.map((p) => p.codigo)).toEqual(['MDA-2026-0001', 'MDA-2026-0005']);
  });

  it('sin coincidencias devuelve la lista vacía', async () => {
    const resultado = await buscar.ejecutar(consulta({ busqueda: 'tranvía' }));

    expect(resultado.datos).toEqual([]);
    expect(resultado.meta).toMatchObject({ total: 0, totalPaginas: 0 });
  });
});
