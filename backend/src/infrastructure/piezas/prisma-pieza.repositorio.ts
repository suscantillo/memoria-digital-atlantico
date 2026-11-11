import { Injectable } from '@nestjs/common';
import { CodigoPieza } from '../../domain/piezas/codigo-pieza';
import { Pieza } from '../../domain/piezas/pieza.entity';
import { PiezaRepositorio } from '../../domain/piezas/pieza.repositorio';
import { PrismaService } from '../prisma/prisma.service';
import { PiezaMapper } from './pieza.mapper';

@Injectable()
export class PrismaPiezaRepositorio implements PiezaRepositorio {
  constructor(private readonly prisma: PrismaService) {}

  async buscarPorCodigo(codigo: CodigoPieza): Promise<Pieza | null> {
    const fila = await this.prisma.pieza.findUnique({
      where: { codigo: codigo.valor },
      include: {
        ubicacion: true,
        archivos: {
          where: { estado: 'APROBADO' },
          orderBy: { revisadoEn: 'desc' },
          take: 1,
          select: { id: true, tipoMime: true },
        },
      },
    });
    return fila ? PiezaMapper.aEntidad(fila) : null;
  }
}
