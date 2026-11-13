import { ArchivoDigitalDto } from './dto/archivo-digital.dto';
import { RevisarEscaneo } from './revisar-escaneo.use-case';

/** HU-10: el escaneo pasa a APROBADO y su pieza a PUBLICADA. */
export class AprobarEscaneo extends RevisarEscaneo {
  ejecutar(archivoId: string, revisorId: string): Promise<ArchivoDigitalDto> {
    return this.revisar(archivoId, ({ archivo, pieza }) => {
      archivo.aprobar(revisorId);
      pieza.publicarPorEscaneoAprobado();
      return {
        accion: 'PUBLICADA',
        detalle: `Escaneo «${archivo.nombreOriginal}» aprobado: legible, completo y con datos correctos.`,
      };
    });
  }
}
