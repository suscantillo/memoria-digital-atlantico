import { Module } from '@nestjs/common';
import { CrearPieza } from '../../application/piezas/crear-pieza.use-case';
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
  ],
})
export class PiezasModule {}
