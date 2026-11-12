import { Module } from '@nestjs/common';
import { BuscarPiezasPortal } from '../../application/portal/buscar-piezas-portal.use-case';
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
    {
      provide: BuscarPiezasPortal,
      useFactory: (piezas: PiezaRepositorio) => new BuscarPiezasPortal(piezas),
      inject: [PIEZA_REPOSITORIO],
    },
  ],
})
export class PortalModule {}
