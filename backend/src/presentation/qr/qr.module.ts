import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GenerarQrPieza } from '../../application/qr/generar-qr-pieza.use-case';
import {
  CODIGOS_DE_PIEZA,
  CodigosDePieza,
  GENERADOR_QR,
  GeneradorQr,
} from '../../application/qr/puertos';
import { Configuracion } from '../../infrastructure/config/configuracion';
import { PrismaCodigosDePieza } from '../../infrastructure/qr/prisma-codigos-de-pieza';
import { QrcodeGenerador } from '../../infrastructure/qr/qrcode-generador';
import { QrController } from './qr.controller';

@Module({
  controllers: [QrController],
  providers: [
    { provide: CODIGOS_DE_PIEZA, useClass: PrismaCodigosDePieza },
    { provide: GENERADOR_QR, useClass: QrcodeGenerador },
    {
      provide: GenerarQrPieza,
      useFactory: (
        codigos: CodigosDePieza,
        generador: GeneradorQr,
        config: ConfigService<Configuracion, true>,
      ) => new GenerarQrPieza(codigos, generador, config.get('PUBLIC_WEB_URL', { infer: true })),
      inject: [CODIGOS_DE_PIEZA, GENERADOR_QR, ConfigService],
    },
  ],
})
export class QrModule {}
