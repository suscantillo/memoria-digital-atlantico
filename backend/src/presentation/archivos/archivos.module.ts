import { Module } from '@nestjs/common';
import { AprobarEscaneo } from '../../application/archivos/aprobar-escaneo.use-case';
import { CargarEscaneo } from '../../application/archivos/cargar-escaneo.use-case';
import { ListarArchivos } from '../../application/archivos/listar-archivos.use-case';
import { ObtenerContenidoArchivo } from '../../application/archivos/obtener-contenido-archivo.use-case';
import {
  ALMACEN_ARCHIVOS,
  AlmacenArchivos,
  ESCANEOS,
  Escaneos,
} from '../../application/archivos/puertos';
import { RechazarEscaneo } from '../../application/archivos/rechazar-escaneo.use-case';
import {
  ARCHIVO_DIGITAL_REPOSITORIO,
  ArchivoDigitalRepositorio,
} from '../../domain/archivos/archivo-digital.repositorio';
import { AlmacenArchivosDisco } from '../../infrastructure/archivos/almacen-archivos-disco';
import { PrismaArchivoDigitalRepositorio } from '../../infrastructure/archivos/prisma-archivo-digital.repositorio';
import { PrismaEscaneos } from '../../infrastructure/archivos/prisma-escaneos';
import { ArchivosController } from './archivos.controller';

@Module({
  controllers: [ArchivosController],
  providers: [
    { provide: ESCANEOS, useClass: PrismaEscaneos },
    { provide: ALMACEN_ARCHIVOS, useClass: AlmacenArchivosDisco },
    { provide: ARCHIVO_DIGITAL_REPOSITORIO, useClass: PrismaArchivoDigitalRepositorio },
    {
      provide: CargarEscaneo,
      useFactory: (escaneos: Escaneos, almacen: AlmacenArchivos) =>
        new CargarEscaneo(escaneos, almacen),
      inject: [ESCANEOS, ALMACEN_ARCHIVOS],
    },
    {
      provide: ListarArchivos,
      useFactory: (archivos: ArchivoDigitalRepositorio) => new ListarArchivos(archivos),
      inject: [ARCHIVO_DIGITAL_REPOSITORIO],
    },
    {
      provide: ObtenerContenidoArchivo,
      useFactory: (archivos: ArchivoDigitalRepositorio, almacen: AlmacenArchivos) =>
        new ObtenerContenidoArchivo(archivos, almacen),
      inject: [ARCHIVO_DIGITAL_REPOSITORIO, ALMACEN_ARCHIVOS],
    },
    {
      provide: AprobarEscaneo,
      useFactory: (archivos: ArchivoDigitalRepositorio) => new AprobarEscaneo(archivos),
      inject: [ARCHIVO_DIGITAL_REPOSITORIO],
    },
    {
      provide: RechazarEscaneo,
      useFactory: (archivos: ArchivoDigitalRepositorio) => new RechazarEscaneo(archivos),
      inject: [ARCHIVO_DIGITAL_REPOSITORIO],
    },
  ],
})
export class ArchivosModule {}
