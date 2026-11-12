import { ArchivoDigital } from '../../src/domain/archivos/archivo-digital.entity';
import {
  ArchivoDigitalRepositorio,
  DetalleArchivoDigital,
  EventoRevision,
  ParametrosListarArchivos,
  RevisionEscaneo,
} from '../../src/domain/archivos/archivo-digital.repositorio';
import { construirMeta, ResultadoPaginado } from '../../src/domain/comun/paginacion';
import { Pieza } from '../../src/domain/piezas/pieza.entity';

export class ArchivoDigitalRepositorioMemoria implements ArchivoDigitalRepositorio {
  readonly archivos = new Map<string, ArchivoDigital>();
  readonly piezas = new Map<string, Pieza>();
  readonly eventos: (EventoRevision & { piezaId: string; usuarioId: string | null })[] = [];
  /** Simula que otra revisión se guardó primero. */
  otraRevisionGano = false;

  agregar(archivo: ArchivoDigital, pieza: Pieza): void {
    this.archivos.set(archivo.id, archivo);
    this.piezas.set(pieza.id, pieza);
  }

  listar(params: ParametrosListarArchivos): Promise<ResultadoPaginado<DetalleArchivoDigital>> {
    const filas = [...this.archivos.values()]
      .filter((archivo) => !params.estado || archivo.estado === params.estado)
      .sort((a, b) => a.creadoEn.getTime() - b.creadoEn.getTime());
    if (params.direccion === 'desc') filas.reverse();
    const inicio = (params.pagina - 1) * params.limite;
    return Promise.resolve({
      datos: filas.slice(inicio, inicio + params.limite).map((archivo) => this.detalle(archivo)),
      meta: construirMeta(params, filas.length),
    });
  }

  buscarDetalle(id: string): Promise<DetalleArchivoDigital | null> {
    const archivo = this.archivos.get(id);
    return Promise.resolve(archivo ? this.detalle(archivo) : null);
  }

  buscarPorId(id: string): Promise<ArchivoDigital | null> {
    return Promise.resolve(this.archivos.get(id) ?? null);
  }

  buscarRevision(id: string): Promise<RevisionEscaneo | null> {
    const archivo = this.archivos.get(id);
    const pieza = archivo && this.piezas.get(archivo.piezaId);
    return Promise.resolve(archivo && pieza ? { archivo, pieza } : null);
  }

  guardarRevision({ archivo, pieza }: RevisionEscaneo, evento: EventoRevision): Promise<boolean> {
    if (this.otraRevisionGano) return Promise.resolve(false);
    this.archivos.set(archivo.id, archivo);
    this.piezas.set(pieza.id, pieza);
    this.eventos.push({ ...evento, piezaId: pieza.id, usuarioId: archivo.revisadoPorId });
    return Promise.resolve(true);
  }

  private detalle(archivo: ArchivoDigital): DetalleArchivoDigital {
    const pieza = this.piezas.get(archivo.piezaId) as Pieza;
    return {
      id: archivo.id,
      nombreOriginal: archivo.nombreOriginal,
      tipoMime: archivo.tipoMime,
      tamanoBytes: archivo.tamanoBytes,
      estado: archivo.estado,
      motivoRechazo: archivo.motivoRechazo,
      creadoEn: archivo.creadoEn,
      revisadoEn: archivo.revisadoEn,
      subidoPor: { nombre: 'Personal de prueba', correo: 'personal@prueba.local' },
      pieza: {
        id: pieza.id,
        codigo: pieza.codigo.valor,
        titulo: pieza.titulo,
        tipo: pieza.tipo,
        estado: pieza.estado,
        anio: pieza.anio,
        tema: 'Carnaval',
        autor: 'Desconocido',
        palabrasClave: ['comparsa'],
      },
    };
  }
}
