import { Module } from '@nestjs/common';
import { AprobarEscaneo } from '../../application/archivos/aprobar-escaneo.use-case';
import { AsignarRevisor } from '../../application/archivos/asignar-revisor.use-case';
import { ListarRevisores } from '../../application/archivos/listar-revisores.use-case';
import { CargarEscaneo } from '../../application/archivos/cargar-escaneo.use-case';
import { ListarArchivos } from '../../application/archivos/listar-archivos.use-case';
import { ObtenerContenidoArchivo } from '../../application/archivos/obtener-contenido-archivo.use-case';
import {
  ALMACEN_ARCHIVOS,
  AlmacenArchivos,
  ESCANEOS,
  Escaneos,
  LECTOR_ARCHIVOS,
  LectorArchivos,
  REVISORES,
  Revisores,
} from '../../application/archivos/puertos';
import { RechazarEscaneo } from '../../application/archivos/rechazar-escaneo.use-case';
import {
  ARCHIVO_DIGITAL_REPOSITORIO,
  ArchivoDigitalRepositorio,
} from '../../domain/archivos/archivo-digital.repositorio';
import { AlmacenArchivosDisco } from '../../infrastructure/archivos/almacen-archivos-disco';
import { PrismaArchivoDigitalRepositorio } from '../../infrastructure/archivos/prisma-archivo-digital.repositorio';
import { PrismaEscaneos } from '../../infrastructure/archivos/prisma-escaneos';
import { PrismaRevisores } from '../../infrastructure/archivos/prisma-revisores';
import { ArchivosController } from './archivos.controller';

@Module({
  controllers: [ArchivosController],
  providers: [
    { provide: ESCANEOS, useClass: PrismaEscaneos },
    AlmacenArchivosDisco,
    { provide: ALMACEN_ARCHIVOS, useExisting: AlmacenArchivosDisco },
    { provide: LECTOR_ARCHIVOS, useExisting: AlmacenArchivosDisco },
    { provide: ARCHIVO_DIGITAL_REPOSITORIO, useClass: PrismaArchivoDigitalRepositorio },
    { provide: REVISORES, useClass: PrismaRevisores },
    {
      provide: AsignarRevisor,
      useFactory: (archivos: ArchivoDigitalRepositorio, revisores: Revisores) =>
        new AsignarRevisor(archivos, revisores),
      inject: [ARCHIVO_DIGITAL_REPOSITORIO, REVISORES],
    },
    {
      provide: ListarRevisores,
      useFactory: (revisores: Revisores) => new ListarRevisores(revisores),
      inject: [REVISORES],
    },
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
      useFactory: (archivos: ArchivoDigitalRepositorio, lector: LectorArchivos) =>
        new ObtenerContenidoArchivo(archivos, lector),
      inject: [ARCHIVO_DIGITAL_REPOSITORIO, LECTOR_ARCHIVOS],
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
