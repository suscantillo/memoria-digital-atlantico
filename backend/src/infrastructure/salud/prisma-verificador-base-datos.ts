import { Injectable, Logger } from '@nestjs/common';
import { VerificadorBaseDatos } from '../../application/salud/ports/verificador-base-datos';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PrismaVerificadorBaseDatos implements VerificadorBaseDatos {
  private readonly logger = new Logger(PrismaVerificadorBaseDatos.name);

  constructor(private readonly prisma: PrismaService) {}

  async estaDisponible(): Promise<boolean> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      this.logger.error(
        'La base de datos no responde',
        error instanceof Error ? error.stack : error,
      );
      return false;
    }
  }
}
