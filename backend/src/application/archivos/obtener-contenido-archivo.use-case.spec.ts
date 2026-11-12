import { Readable } from 'node:stream';
import {
  ArchivoNoDisponibleError,
  ObtenerContenidoArchivo,
} from './obtener-contenido-archivo.use-case';
import { ArchivoPublicable, ArchivosPublicos, LectorArchivos } from './puertos';

const ID = '3f1c2b9a-6d4e-4c1a-9b7e-2a5d8c0f1e23';

const publicable: ArchivoPublicable = {
  id: ID,
  nombreOriginal: '1903-camellon-abello.jpg',
  rutaAlmacenamiento: 'semilla/MDA-2026-0016.jpg',
  tipoMime: 'image/jpeg',
};

class ArchivosEnMemoria implements ArchivosPublicos {
  consultas: string[] = [];
  constructor(private readonly archivo: ArchivoPublicable | null) {}
  buscarPublicable(id: string): Promise<ArchivoPublicable | null> {
    this.consultas.push(id);
    return Promise.resolve(this.archivo?.id === id ? this.archivo : null);
  }
}

class LectorEnMemoria implements LectorArchivos {
  rutas: string[] = [];
  constructor(private readonly existe = true) {}
  abrir(ruta: string) {
    this.rutas.push(ruta);
    return Promise.resolve(
      this.existe ? { flujo: Readable.from([Buffer.from('jpg')]), tamanoBytes: 3 } : null,
    );
  }
}

describe('ObtenerContenidoArchivo', () => {
  it('entrega el contenido con su tipo y nombre cuando el archivo es publicable', async () => {
    const lector = new LectorEnMemoria();
    const caso = new ObtenerContenidoArchivo(new ArchivosEnMemoria(publicable), lector);

    const contenido = await caso.ejecutar(ID);

    expect(contenido).toMatchObject({
      id: ID,
      nombreOriginal: '1903-camellon-abello.jpg',
      tipoMime: 'image/jpeg',
      tamanoBytes: 3,
    });
    expect(contenido).not.toHaveProperty('rutaAlmacenamiento');
    expect(lector.rutas).toEqual(['semilla/MDA-2026-0016.jpg']);
  });

  it('responde no encontrado cuando el archivo no es publicable (en revisión, restringido o sin publicar)', async () => {
    const caso = new ObtenerContenidoArchivo(new ArchivosEnMemoria(null), new LectorEnMemoria());

    await expect(caso.ejecutar(ID)).rejects.toBeInstanceOf(ArchivoNoDisponibleError);
  });

  it('no consulta la base si el id no es un UUID', async () => {
    const archivos = new ArchivosEnMemoria(publicable);
    const caso = new ObtenerContenidoArchivo(archivos, new LectorEnMemoria());

    await expect(caso.ejecutar('../../etc/passwd')).rejects.toBeInstanceOf(
      ArchivoNoDisponibleError,
    );
    expect(archivos.consultas).toEqual([]);
  });

  it('responde no encontrado si la fila existe pero el archivo ya no está en el almacenamiento', async () => {
    const caso = new ObtenerContenidoArchivo(
      new ArchivosEnMemoria(publicable),
      new LectorEnMemoria(false),
    );

    await expect(caso.ejecutar(ID)).rejects.toBeInstanceOf(ArchivoNoDisponibleError);
  });
});
