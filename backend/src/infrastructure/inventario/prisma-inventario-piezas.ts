import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  FilaInventario,
  InventarioPiezas,
  ParametrosInventario,
} from '../../application/inventario/puertos';
import { construirMeta, ResultadoPaginado } from '../../domain/comun/paginacion';
import { PrismaService } from '../prisma/prisma.service';

const COLUMNAS = {
  id: true,
  codigo: true,
  titulo: true,
  tipo: true,
  estado: true,
  anio: true,
  restringida: true,
  actualizadoEn: true,
  ubicacion: { select: { id: true, deposito: true, estanteria: true, caja: true } },
} satisfies Prisma.PiezaSelect;

@Injectable()
export class PrismaInventarioPiezas implements InventarioPiezas {
  constructor(private readonly prisma: PrismaService) {}

  async listar(params: ParametrosInventario): Promise<ResultadoPaginado<FilaInventario>> {
    const { texto, tipo, estado, ubicacionId } = params.filtros;
    const where: Prisma.PiezaWhereInput = {};
    if (tipo) where.tipo = tipo;
    if (estado) where.estado = estado;
    if (ubicacionId) where.ubicacionId = ubicacionId;
    if (texto) {
      const contiene = { contains: texto, mode: 'insensitive' as const };
      where.OR = [{ codigo: contiene }, { titulo: contiene }, { descripcion: contiene }];
    }

    const ordenPedido: Prisma.PiezaOrderByWithRelationInput =
      params.orden === 'anio'
        ? { anio: { sort: params.direccion, nulls: 'last' } }
        : { [params.orden]: params.direccion };

    const [total, filas] = await this.prisma.$transaction([
      this.prisma.pieza.count({ where }),
      this.prisma.pieza.findMany({
        where,
        select: COLUMNAS,
        // el código desempata para que una pieza no salte de página al ordenar por estado o año
        orderBy: [ordenPedido, { codigo: 'asc' }],
        skip: (params.pagina - 1) * params.limite,
        take: params.limite,
      }),
    ]);

    return { datos: filas, meta: construirMeta(params, total) };
  }
}
