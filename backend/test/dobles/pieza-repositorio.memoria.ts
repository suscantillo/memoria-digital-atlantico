import { construirMeta, ResultadoPaginado } from '../../src/domain/comun/paginacion';
import { CodigoPieza } from '../../src/domain/piezas/codigo-pieza';
import { Pieza } from '../../src/domain/piezas/pieza.entity';
import {
  ParametrosListarPublicadas,
  PiezaRepositorio,
} from '../../src/domain/piezas/pieza.repositorio';

export class PiezaRepositorioMemoria implements PiezaRepositorio {
  readonly piezas = new Map<string, Pieza>();

  agregar(pieza: Pieza): void {
    this.piezas.set(pieza.codigo.valor, pieza);
  }

  buscarPorCodigo(codigo: CodigoPieza): Promise<Pieza | null> {
    return Promise.resolve(this.piezas.get(codigo.valor) ?? null);
  }

  listarPublicadas(params: ParametrosListarPublicadas): Promise<ResultadoPaginado<Pieza>> {
    const { texto, tipo, decada, incluirRestringidas } = params.filtros;
    const buscado = texto?.toLowerCase();
    const clave = (pieza: Pieza): string | number =>
      params.orden === 'anio'
        ? (pieza.anio ?? Number.POSITIVE_INFINITY)
        : params.orden === 'codigo'
          ? pieza.codigo.valor
          : pieza.titulo.toLowerCase();

    const filtradas = [...this.piezas.values()]
      .filter((p) => p.estaPublicada())
      .filter((p) => incluirRestringidas || !p.restringida)
      .filter((p) => !tipo || p.tipo === tipo)
      .filter(
        (p) =>
          decada === undefined || (p.anio !== null && p.anio >= decada && p.anio < decada + 10),
      )
      .filter(
        (p) => !buscado || `${p.titulo} ${p.descripcion ?? ''}`.toLowerCase().includes(buscado),
      )
      .sort((a, b) => {
        if (a.restringida !== b.restringida) {
          return a.restringida ? 1 : -1;
        }
        const [va, vb] = [clave(a), clave(b)];
        const comparacion = va < vb ? -1 : va > vb ? 1 : 0;
        return params.direccion === 'asc' ? comparacion : -comparacion;
      });

    const inicio = (params.pagina - 1) * params.limite;
    return Promise.resolve({
      datos: filtradas.slice(inicio, inicio + params.limite),
      meta: construirMeta(params, filtradas.length),
    });
  }
}
