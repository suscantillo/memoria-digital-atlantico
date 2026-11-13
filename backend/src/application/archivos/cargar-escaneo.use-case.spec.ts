import { EstadoPieza } from '../../domain/piezas/estado-pieza';
import { FormatoEscaneoNoPermitidoError } from '../../domain/archivos/formato-escaneo';
import {
  CargarEscaneo,
  DatosCargaEscaneo,
  EscaneoYaEnRevisionError,
  MetadatosEscaneoIncompletosError,
  PiezaDelEscaneoNoEncontradaError,
  PiezaNoRegistradaError,
} from './cargar-escaneo.use-case';
import {
  AlmacenArchivos,
  EscaneoRegistrado,
  Escaneos,
  NuevoEscaneo,
  PiezaParaEscaneo,
} from './puertos';

const ID = '11111111-1111-1111-1111-111111111111';
const PDF = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x37]);

class EscaneosMemoria implements Escaneos {
  registrados: NuevoEscaneo[] = [];
  ganaLaCarrera = true;
  constructor(private pieza: PiezaParaEscaneo | null) {}
  piezaParaEscaneo(): Promise<PiezaParaEscaneo | null> {
    return Promise.resolve(this.pieza);
  }
  registrar(escaneo: NuevoEscaneo): Promise<EscaneoRegistrado | null> {
    if (!this.ganaLaCarrera) return Promise.resolve(null);
    this.registrados.push(escaneo);
    return Promise.resolve({ id: 'archivo-1', creadoEn: new Date('2026-11-12T18:00:00Z') });
  }
}

class AlmacenMemoria implements AlmacenArchivos {
  guardados: string[] = [];
  borrados: string[] = [];
  guardar(_: Uint8Array, extension: string): Promise<string> {
    const ruta = `escaneos/prueba-${this.guardados.length + 1}.${extension}`;
    this.guardados.push(ruta);
    return Promise.resolve(ruta);
  }
  borrar(ruta: string): Promise<void> {
    this.borrados.push(ruta);
    return Promise.resolve();
  }
}

const pieza = (estado: EstadoPieza, enRevision = false): PiezaParaEscaneo => ({
  id: ID,
  codigo: 'MDA-2026-0001',
  estado,
  tieneEscaneoEnRevision: enRevision,
});

const datos = (cambios: Partial<DatosCargaEscaneo> = {}): DatosCargaEscaneo => ({
  piezaId: ID,
  usuarioId: 'usuario-1',
  nombreOriginal: 'acta.pdf',
  contenido: PDF,
  tema: ' Carnaval ',
  autor: 'Desconocido',
  palabrasClave: ['Comparsa', 'comparsa', ' desfile ', ''],
  ...cambios,
});

describe('CargarEscaneo', () => {
  it('criterio 1: guarda el archivo EN_REVISION y la pieza pasa a ESCANEADA con sus metadatos', async () => {
    const escaneos = new EscaneosMemoria(pieza('REGISTRADA'));
    const almacen = new AlmacenMemoria();

    const resultado = await new CargarEscaneo(escaneos, almacen).ejecutar(datos());

    expect(resultado).toMatchObject({
      estado: 'EN_REVISION',
      estadoPieza: 'ESCANEADA',
      tipoMime: 'application/pdf',
      tema: 'Carnaval',
      palabrasClave: ['comparsa', 'desfile'],
    });
    expect(escaneos.registrados[0]).toMatchObject({
      rutaAlmacenamiento: 'escaneos/prueba-1.pdf',
      tamanoBytes: PDF.length,
      usuarioId: 'usuario-1',
    });
    expect(almacen.borrados).toEqual([]);
  });

  it('criterio 2: con un escaneo EN_REVISION responde conflicto y no guarda nada', async () => {
    const almacen = new AlmacenMemoria();
    const caso = new CargarEscaneo(new EscaneosMemoria(pieza('ESCANEADA', true)), almacen);

    await expect(caso.ejecutar(datos())).rejects.toBeInstanceOf(EscaneoYaEnRevisionError);
    expect(almacen.guardados).toEqual([]);
  });

  it('si otra carga gana la carrera, borra el archivo y responde conflicto', async () => {
    const escaneos = new EscaneosMemoria(pieza('REGISTRADA'));
    escaneos.ganaLaCarrera = false;
    const almacen = new AlmacenMemoria();

    await expect(new CargarEscaneo(escaneos, almacen).ejecutar(datos())).rejects.toBeInstanceOf(
      EscaneoYaEnRevisionError,
    );
    expect(almacen.borrados).toEqual(almacen.guardados);
  });

  it('solo acepta piezas REGISTRADA', async () => {
    const caso = new CargarEscaneo(new EscaneosMemoria(pieza('PUBLICADA')), new AlmacenMemoria());
    await expect(caso.ejecutar(datos())).rejects.toBeInstanceOf(PiezaNoRegistradaError);
  });

  it('rechaza una pieza que no existe, metadatos vacíos y un formato no permitido', async () => {
    const almacen = new AlmacenMemoria();
    await expect(
      new CargarEscaneo(new EscaneosMemoria(null), almacen).ejecutar(datos()),
    ).rejects.toBeInstanceOf(PiezaDelEscaneoNoEncontradaError);

    const caso = new CargarEscaneo(new EscaneosMemoria(pieza('REGISTRADA')), almacen);
    await expect(caso.ejecutar(datos({ palabrasClave: [' '] }))).rejects.toBeInstanceOf(
      MetadatosEscaneoIncompletosError,
    );
    await expect(
      caso.ejecutar(datos({ contenido: new Uint8Array([0x4d, 0x5a, 0, 0]) })),
    ).rejects.toBeInstanceOf(FormatoEscaneoNoPermitidoError);
    expect(almacen.guardados).toEqual([]);
  });
});
