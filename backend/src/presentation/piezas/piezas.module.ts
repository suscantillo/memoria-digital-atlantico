import { Module } from '@nestjs/common';
import { CrearPieza } from '../../application/piezas/crear-pieza.use-case';
import { EditarPieza } from '../../application/piezas/editar-pieza.use-case';
import { ObtenerFichaPieza } from '../../application/piezas/obtener-ficha-pieza.use-case';
import { PIEZA_REPOSITORIO, PiezaRepositorio } from '../../domain/piezas/pieza.repositorio';
import { PrismaPiezaRepositorio } from '../../infrastructure/piezas/prisma-pieza.repositorio';
import { PiezasController } from './piezas.controller';

@Module({
  controllers: [PiezasController],
  providers: [
    { provide: PIEZA_REPOSITORIO, useClass: PrismaPiezaRepositorio },
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
