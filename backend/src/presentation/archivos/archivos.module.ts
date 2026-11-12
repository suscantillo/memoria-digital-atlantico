import { Module } from '@nestjs/common';
import { CargarEscaneo } from '../../application/archivos/cargar-escaneo.use-case';
import { ObtenerContenidoArchivo } from '../../application/archivos/obtener-contenido-archivo.use-case';
import {
  ALMACEN_ARCHIVOS,
  AlmacenArchivos,
  ARCHIVOS_PUBLICOS,
  ArchivosPublicos,
  ESCANEOS,
  Escaneos,
  LECTOR_ARCHIVOS,
  LectorArchivos,
} from '../../application/archivos/puertos';
import { AlmacenArchivosDisco } from '../../infrastructure/archivos/almacen-archivos-disco';
import { PrismaArchivosPublicos } from '../../infrastructure/archivos/prisma-archivos-publicos';
import { PrismaEscaneos } from '../../infrastructure/archivos/prisma-escaneos';
import { ArchivosController } from './archivos.controller';

@Module({
  controllers: [ArchivosController],
  providers: [
    { provide: ESCANEOS, useClass: PrismaEscaneos },
    { provide: ARCHIVOS_PUBLICOS, useClass: PrismaArchivosPublicos },
    AlmacenArchivosDisco,
    { provide: ALMACEN_ARCHIVOS, useExisting: AlmacenArchivosDisco },
    { provide: LECTOR_ARCHIVOS, useExisting: AlmacenArchivosDisco },
    {
      provide: CargarEscaneo,
      useFactory: (escaneos: Escaneos, almacen: AlmacenArchivos) =>
        new CargarEscaneo(escaneos, almacen),
      inject: [ESCANEOS, ALMACEN_ARCHIVOS],
    },
    {
      provide: ObtenerContenidoArchivo,
      useFactory: (archivos: ArchivosPublicos, lector: LectorArchivos) =>
        new ObtenerContenidoArchivo(archivos, lector),
      inject: [ARCHIVOS_PUBLICOS, LECTOR_ARCHIVOS],
    },
  ],
})
export class ArchivosModule {}
