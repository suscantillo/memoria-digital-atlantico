import { QuienRevisa } from '../../domain/archivos/archivo-digital.entity';
import { ArchivoDigitalDto } from './dto/archivo-digital.dto';
import { RevisarEscaneo } from './revisar-escaneo.use-case';

/** HU-10: el escaneo pasa a APROBADO y su pieza a PUBLICADA. */
export class AprobarEscaneo extends RevisarEscaneo {
  ejecutar(archivoId: string, quien: QuienRevisa): Promise<ArchivoDigitalDto> {
    return this.revisar(archivoId, quien, ({ archivo, pieza }) => {
      archivo.aprobar(quien.id);
      pieza.publicarPorEscaneoAprobado();
      return {
        accion: 'PUBLICADA',
        detalle: `Escaneo «${archivo.nombreOriginal}» aprobado: legible, completo y con datos correctos.`,
      };
    });
  }
}
