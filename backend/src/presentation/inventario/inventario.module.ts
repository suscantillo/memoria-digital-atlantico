import { Module } from '@nestjs/common';
import { ListarInventario } from '../../application/inventario/listar-inventario.use-case';
import { INVENTARIO_PIEZAS, InventarioPiezas } from '../../application/inventario/puertos';
import { PrismaInventarioPiezas } from '../../infrastructure/inventario/prisma-inventario-piezas';
import { InventarioController } from './inventario.controller';

@Module({
  controllers: [InventarioController],
  providers: [
    { provide: INVENTARIO_PIEZAS, useClass: PrismaInventarioPiezas },
    {
      provide: ListarInventario,
      useFactory: (inventario: InventarioPiezas) => new ListarInventario(inventario),
      inject: [INVENTARIO_PIEZAS],
    },
  ],
})
export class InventarioModule {}
