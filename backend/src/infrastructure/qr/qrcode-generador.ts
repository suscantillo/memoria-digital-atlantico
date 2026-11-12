import { Injectable } from '@nestjs/common';
import { toBuffer } from 'qrcode';
import { GeneradorQr } from '../../application/qr/puertos';

@Injectable()
export class QrcodeGenerador implements GeneradorQr {
  png(texto: string): Promise<Buffer> {
    // corrección media (15 %): aguanta una etiqueta algo gastada sin que el QR crezca de más
    return toBuffer(texto, { type: 'png', errorCorrectionLevel: 'M', margin: 2, width: 512 });
  }
}
