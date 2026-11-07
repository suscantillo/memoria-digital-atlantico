import { Module } from '@nestjs/common';
import { CrearUbicacion } from '../../application/ubicaciones/crear-ubicacion.use-case';
import { ListarUbicaciones } from '../../application/ubicaciones/listar-ubicaciones.use-case';
import {
  UBICACION_REPOSITORIO,
  UbicacionRepositorio,
} from '../../domain/ubicaciones/ubicacion.repositorio';
import { PrismaUbicacionRepositorio } from '../../infrastructure/ubicaciones/prisma-ubicacion.repositorio';
import { UbicacionesController } from './ubicaciones.controller';

@Module({
  controllers: [UbicacionesController],
  providers: [
    { provide: UBICACION_REPOSITORIO, useClass: PrismaUbicacionRepositorio },
    {
      provide: CrearUbicacion,
      useFactory: (repositorio: UbicacionRepositorio) => new CrearUbicacion(repositorio),
      inject: [UBICACION_REPOSITORIO],
    },
    {
      provide: ListarUbicaciones,
      useFactory: (repositorio: UbicacionRepositorio) => new ListarUbicaciones(repositorio),
      inject: [UBICACION_REPOSITORIO],
    },
  ],
})
export class UbicacionesModule {}
