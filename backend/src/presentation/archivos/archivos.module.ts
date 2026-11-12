import { Module } from '@nestjs/common';
import { CargarEscaneo } from '../../application/archivos/cargar-escaneo.use-case';
import {
  ALMACEN_ARCHIVOS,
  AlmacenArchivos,
  ESCANEOS,
  Escaneos,
} from '../../application/archivos/puertos';
import { AlmacenArchivosDisco } from '../../infrastructure/archivos/almacen-archivos-disco';
import { PrismaEscaneos } from '../../infrastructure/archivos/prisma-escaneos';
import { ArchivosController } from './archivos.controller';

@Module({
  controllers: [ArchivosController],
  providers: [
    { provide: ESCANEOS, useClass: PrismaEscaneos },
    { provide: ALMACEN_ARCHIVOS, useClass: AlmacenArchivosDisco },
    {
      provide: CargarEscaneo,
      useFactory: (escaneos: Escaneos, almacen: AlmacenArchivos) =>
        new CargarEscaneo(escaneos, almacen),
      inject: [ESCANEOS, ALMACEN_ARCHIVOS],
    },
  ],
})
export class ArchivosModule {}
