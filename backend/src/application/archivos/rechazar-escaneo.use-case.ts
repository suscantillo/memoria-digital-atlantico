import { QuienRevisa } from '../../domain/archivos/archivo-digital.entity';
import { ArchivoDigitalDto } from './dto/archivo-digital.dto';
import { RevisarEscaneo } from './revisar-escaneo.use-case';

/** HU-10: el escaneo pasa a RECHAZADO, su pieza vuelve a REGISTRADA y el motivo queda en el historial. */
export class RechazarEscaneo extends RevisarEscaneo {
  ejecutar(archivoId: string, quien: QuienRevisa, motivo: string): Promise<ArchivoDigitalDto> {
    return this.revisar(archivoId, quien, ({ archivo, pieza }) => {
      archivo.rechazar(quien.id, motivo);
      pieza.devolverPorEscaneoRechazado();
      return {
        accion: 'RECHAZADA',
        detalle: `Escaneo «${archivo.nombreOriginal}» rechazado: ${archivo.motivoRechazo}`,
      };
    });
  }
}
