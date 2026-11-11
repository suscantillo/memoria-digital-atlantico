import { Module } from '@nestjs/common';
import { ObtenerPiezaPortal } from '../../application/portal/obtener-pieza-portal.use-case';
import { PIEZA_REPOSITORIO, PiezaRepositorio } from '../../domain/piezas/pieza.repositorio';
import { PrismaPiezaRepositorio } from '../../infrastructure/piezas/prisma-pieza.repositorio';
import { PortalController } from './portal.controller';

@Module({
  controllers: [PortalController],
  providers: [
    { provide: PIEZA_REPOSITORIO, useClass: PrismaPiezaRepositorio },
    {
      provide: ObtenerPiezaPortal,
      useFactory: (piezas: PiezaRepositorio) => new ObtenerPiezaPortal(piezas),
      inject: [PIEZA_REPOSITORIO],
    },
  ],
})
export class PortalModule {}
