import { construirMeta, ResultadoPaginado } from '../../domain/comun/paginacion';
import { ListarInventarioDto } from './dto/listar-inventario.dto';
import { ListarInventario } from './listar-inventario.use-case';
import { FilaInventario, InventarioPiezas, ParametrosInventario } from './puertos';

const fila: FilaInventario = {
  id: '11111111-1111-1111-1111-111111111111',
  codigo: 'MDA-2026-0003',
  titulo: 'Acta ficticia',
  tipo: 'DOCUMENTO',
  estado: 'REGISTRADA',
  anio: 1930,
  restringida: true,
  ubicacion: { id: 'u1', deposito: 'Depósito A', estanteria: 'Estantería 1', caja: 'Caja 01' },
  actualizadoEn: new Date('2026-11-10T15:00:00Z'),
};

class InventarioEspia implements InventarioPiezas {
  pedidos: ParametrosInventario[] = [];
  listar(params: ParametrosInventario): Promise<ResultadoPaginado<FilaInventario>> {
    this.pedidos.push(params);
    return Promise.resolve({ datos: [fila], meta: construirMeta(params, 21) });
  }
}

function consulta(cambios: Partial<ListarInventarioDto> = {}): ListarInventarioDto {
  return Object.assign(new ListarInventarioDto(), cambios);
}

describe('ListarInventario', () => {
  it('pasa filtros, página y orden al inventario y devuelve total y páginas', async () => {
    const espia = new InventarioEspia();
    const resultado = await new ListarInventario(espia).ejecutar(
      consulta({ pagina: 2, limite: 10, estado: 'REGISTRADA', tipo: 'DOCUMENTO', orden: 'titulo' }),
    );

    expect(espia.pedidos[0]).toEqual({
      pagina: 2,
      limite: 10,
      orden: 'titulo',
      direccion: 'asc',
      filtros: {
        texto: undefined,
        tipo: 'DOCUMENTO',
        estado: 'REGISTRADA',
        ubicacionId: undefined,
      },
    });
    expect(resultado.meta).toEqual({ pagina: 2, limite: 10, total: 21, totalPaginas: 3 });
  });

  it('el personal ve todo: una pieza restringida conserva su título y su año', async () => {
    const resultado = await new ListarInventario(new InventarioEspia()).ejecutar(consulta());

    expect(resultado.datos[0]).toMatchObject({
      codigo: 'MDA-2026-0003',
      titulo: 'Acta ficticia',
      anio: 1930,
      restringida: true,
      actualizadoEn: '2026-11-10T15:00:00.000Z',
    });
  });

  it('ignora una búsqueda vacía o de solo espacios', async () => {
    const espia = new InventarioEspia();
    await new ListarInventario(espia).ejecutar(consulta({ busqueda: '   ' }));

    expect(espia.pedidos[0]?.filtros.texto).toBeUndefined();
  });
});
