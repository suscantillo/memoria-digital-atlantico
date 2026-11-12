import {
  CallHandler,
  ExecutionContext,
  Injectable,
  PayloadTooLargeException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Observable } from 'rxjs';
import { TAMANO_MAXIMO_ESCANEO } from '../../domain/archivos/formato-escaneo';

// multer corta la subida apenas pasa el límite, sin esperar a que llegue completa
const Base = FileInterceptor('archivo', {
  limits: { fileSize: TAMANO_MAXIMO_ESCANEO, files: 1, fields: 30 },
});

/** Recibe el campo «archivo» en memoria y responde en español si pesa más de 20 MB. */
@Injectable()
export class InterceptorEscaneo extends Base {
  override async intercept(
    contexto: ExecutionContext,
    siguiente: CallHandler,
  ): Promise<Observable<unknown>> {
    try {
      return await super.intercept(contexto, siguiente);
    } catch (error) {
      if (error instanceof PayloadTooLargeException) {
        throw new PayloadTooLargeException('El escaneo pesa más de 20 MB.');
      }
      throw error;
    }
  }
}
