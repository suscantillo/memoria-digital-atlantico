import { construirMeta, ResultadoPaginado } from '../../src/domain/comun/paginacion';
import { TernaUbicacion, Ubicacion } from '../../src/domain/ubicaciones/ubicacion.entity';
import {
  ParametrosListarUbicaciones,
  UbicacionRepositorio,
} from '../../src/domain/ubicaciones/ubicacion.repositorio';

export class UbicacionRepositorioMemoria implements UbicacionRepositorio {
  readonly ubicaciones = new Map<string, Ubicacion>();

  guardar(ubicacion: Ubicacion): Promise<Ubicacion> {
    this.ubicaciones.set(ubicacion.id, ubicacion);
    return Promise.resolve(ubicacion);
  }

  buscarPorId(id: string): Promise<Ubicacion | null> {
    return Promise.resolve(this.ubicaciones.get(id) ?? null);
  }

  buscarPorTerna(terna: TernaUbicacion): Promise<Ubicacion | null> {
    const encontrada = [...this.ubicaciones.values()].find(
      (u) =>
        u.deposito === terna.deposito && u.estanteria === terna.estanteria && u.caja === terna.caja,
    );
    return Promise.resolve(encontrada ?? null);
  }

  listar(params: ParametrosListarUbicaciones): Promise<ResultadoPaginado<Ubicacion>> {
    const texto = params.filtros.busqueda?.toLowerCase();
    const filtradas = [...this.ubicaciones.values()]
      .filter((u) => !params.filtros.deposito || u.deposito === params.filtros.deposito)
      .filter(
        (u) =>
          !texto ||
          [u.deposito, u.estanteria, u.caja, u.descripcion ?? '']
            .join(' ')
            .toLowerCase()
            .includes(texto),
      )
      .sort((a, b) => {
        const va = String(
          a[params.orden] instanceof Date ? a[params.orden].valueOf() : a[params.orden],
        );
        const vb = String(
          b[params.orden] instanceof Date ? b[params.orden].valueOf() : b[params.orden],
        );
        return params.direccion === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
      });

    const inicio = (params.pagina - 1) * params.limite;
    return Promise.resolve({
      datos: filtradas.slice(inicio, inicio + params.limite),
      meta: construirMeta(params, filtradas.length),
    });
  }
}
