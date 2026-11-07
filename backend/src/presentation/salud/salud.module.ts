import { Module } from '@nestjs/common';
import {
  VERIFICADOR_BASE_DATOS,
  VerificadorBaseDatos,
} from '../../application/salud/ports/verificador-base-datos';
import { VerificarSalud } from '../../application/salud/verificar-salud.use-case';
import { PrismaVerificadorBaseDatos } from '../../infrastructure/salud/prisma-verificador-base-datos';
import { SaludController } from './salud.controller';

@Module({
  controllers: [SaludController],
  providers: [
    { provide: VERIFICADOR_BASE_DATOS, useClass: PrismaVerificadorBaseDatos },
    {
      provide: VerificarSalud,
      useFactory: (baseDatos: VerificadorBaseDatos) => new VerificarSalud(baseDatos),
      inject: [VERIFICADOR_BASE_DATOS],
    },
  ],
})
export class SaludModule {}
