import { Module } from '@nestjs/common';
import {
  RetirarPieza,
  VolverAPublicarPieza,
} from '../../application/piezas/cambiar-publicacion.use-case';
import { CrearPieza } from '../../application/piezas/crear-pieza.use-case';
import { EditarPieza } from '../../application/piezas/editar-pieza.use-case';
import { ObtenerFichaPieza } from '../../application/piezas/obtener-ficha-pieza.use-case';
import { PIEZA_REPOSITORIO, PiezaRepositorio } from '../../domain/piezas/pieza.repositorio';
import { PUBLICACION_PIEZAS, PublicacionPiezas } from '../../domain/piezas/publicacion-piezas';
import { PrismaPiezaRepositorio } from '../../infrastructure/piezas/prisma-pieza.repositorio';
import { PiezasController } from './piezas.controller';

@Module({
  controllers: [PiezasController],
  providers: [
    PrismaPiezaRepositorio,
    { provide: PIEZA_REPOSITORIO, useExisting: PrismaPiezaRepositorio },
    { provide: PUBLICACION_PIEZAS, useExisting: PrismaPiezaRepositorio },
    {
      provide: RetirarPieza,
      useFactory: (piezas: PiezaRepositorio, publicacion: PublicacionPiezas) =>
        new RetirarPieza(piezas, publicacion),
      inject: [PIEZA_REPOSITORIO, PUBLICACION_PIEZAS],
    },
    {
      provide: VolverAPublicarPieza,
      useFactory: (piezas: PiezaRepositorio, publicacion: PublicacionPiezas) =>
        new VolverAPublicarPieza(piezas, publicacion),
      inject: [PIEZA_REPOSITORIO, PUBLICACION_PIEZAS],
    },
    {
      provide: CrearPieza,
      useFactory: (repositorio: PiezaRepositorio) => new CrearPieza(repositorio),
      inject: [PIEZA_REPOSITORIO],
    },
    {
      provide: ObtenerFichaPieza,
      useFactory: (repositorio: PiezaRepositorio) => new ObtenerFichaPieza(repositorio),
      inject: [PIEZA_REPOSITORIO],
    },
    {
      provide: EditarPieza,
      useFactory: (repositorio: PiezaRepositorio) => new EditarPieza(repositorio),
      inject: [PIEZA_REPOSITORIO],
    },
  ],
})
export class PiezasModule {}
