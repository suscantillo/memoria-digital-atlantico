import { Injectable } from '@nestjs/common';
import { CodigosDePieza } from '../../application/qr/puertos';
import { CodigoPieza } from '../../domain/piezas/codigo-pieza';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PrismaCodigosDePieza implements CodigosDePieza {
  constructor(private readonly prisma: PrismaService) {}

  async codigoPorId(id: string): Promise<CodigoPieza | null> {
    const fila = await this.prisma.pieza.findUnique({ where: { id }, select: { codigo: true } });
    return fila ? CodigoPieza.desde(fila.codigo) : null;
  }
}
