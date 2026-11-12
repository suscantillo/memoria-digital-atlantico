import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { construirMeta, ResultadoPaginado } from '../../domain/comun/paginacion';
import { CodigoPieza } from '../../domain/piezas/codigo-pieza';
import { Pieza } from '../../domain/piezas/pieza.entity';
import {
  ParametrosListarPublicadas,
  PiezaRepositorio,
} from '../../domain/piezas/pieza.repositorio';
import { PrismaService } from '../prisma/prisma.service';
import { PiezaMapper } from './pieza.mapper';

const CON_UBICACION_Y_ARCHIVO_APROBADO = {
  ubicacion: true,
  archivos: {
    where: { estado: 'APROBADO' },
    orderBy: { revisadoEn: 'desc' },
    take: 1,
    select: { id: true, tipoMime: true },
  },
} satisfies Prisma.PiezaInclude;

@Injectable()
export class PrismaPiezaRepositorio implements PiezaRepositorio {
  constructor(private readonly prisma: PrismaService) {}

  async buscarPorCodigo(codigo: CodigoPieza): Promise<Pieza | null> {
    const fila = await this.prisma.pieza.findUnique({
      where: { codigo: codigo.valor },
      include: CON_UBICACION_Y_ARCHIVO_APROBADO,
    });
    return fila ? PiezaMapper.aEntidad(fila) : null;
  }

  async listarPublicadas(params: ParametrosListarPublicadas): Promise<ResultadoPaginado<Pieza>> {
    const { texto, tipo, decada, incluirRestringidas } = params.filtros;
    const where: Prisma.PiezaWhereInput = { estado: 'PUBLICADA' };
    if (!incluirRestringidas) {
      where.restringida = false;
    }
    if (tipo) {
      where.tipo = tipo;
    }
    if (decada !== undefined) {
      where.anio = { gte: decada, lt: decada + 10 };
    }
    if (texto) {
      const contiene = { contains: texto, mode: 'insensitive' as const };
      where.OR = [{ titulo: contiene }, { descripcion: contiene }];
    }

    const ordenPedido: Prisma.PiezaOrderByWithRelationInput =
      params.orden === 'anio'
        ? { anio: { sort: params.direccion, nulls: 'last' } }
        : { [params.orden]: params.direccion };

    const [total, filas] = await this.prisma.$transaction([
      this.prisma.pieza.count({ where }),
      this.prisma.pieza.findMany({
        where,
        include: CON_UBICACION_Y_ARCHIVO_APROBADO,
        orderBy: [{ restringida: 'asc' }, ordenPedido, { codigo: 'asc' }],
        skip: (params.pagina - 1) * params.limite,
        take: params.limite,
      }),
    ]);

    return {
      datos: filas.map((fila) => PiezaMapper.aEntidad(fila)),
      meta: construirMeta(params, total),
    };
  }
}
