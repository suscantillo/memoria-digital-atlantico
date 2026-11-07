import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { construirMeta, ResultadoPaginado } from '../../domain/comun/paginacion';
import { TernaUbicacion, Ubicacion } from '../../domain/ubicaciones/ubicacion.entity';
import { UbicacionDuplicadaError } from '../../domain/ubicaciones/ubicacion.errores';
import {
  ParametrosListarUbicaciones,
  UbicacionRepositorio,
} from '../../domain/ubicaciones/ubicacion.repositorio';
import { PrismaService } from '../prisma/prisma.service';
import { UbicacionMapper } from './ubicacion.mapper';

const CODIGO_VIOLACION_UNICIDAD = 'P2002';

@Injectable()
export class PrismaUbicacionRepositorio implements UbicacionRepositorio {
  constructor(private readonly prisma: PrismaService) {}

  async guardar(ubicacion: Ubicacion): Promise<Ubicacion> {
    try {
      const fila = await this.prisma.ubicacion.upsert({
        where: { id: ubicacion.id },
        create: UbicacionMapper.aFilaCreacion(ubicacion),
        update: UbicacionMapper.aFilaActualizacion(ubicacion),
      });
      return UbicacionMapper.aEntidad(fila);
    } catch (error) {
      // por si hubo una carrera: la restricción única de la BD lo atrapa
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === CODIGO_VIOLACION_UNICIDAD
      ) {
        throw new UbicacionDuplicadaError(ubicacion.terna);
      }
      throw error;
    }
  }

  async buscarPorId(id: string): Promise<Ubicacion | null> {
    const fila = await this.prisma.ubicacion.findUnique({ where: { id } });
    return fila ? UbicacionMapper.aEntidad(fila) : null;
  }

  async buscarPorTerna(terna: TernaUbicacion): Promise<Ubicacion | null> {
    const fila = await this.prisma.ubicacion.findUnique({
      where: { deposito_estanteria_caja: terna },
    });
    return fila ? UbicacionMapper.aEntidad(fila) : null;
  }

  async listar(params: ParametrosListarUbicaciones): Promise<ResultadoPaginado<Ubicacion>> {
    const where: Prisma.UbicacionWhereInput = {};
    if (params.filtros.deposito) {
      where.deposito = params.filtros.deposito;
    }
    if (params.filtros.busqueda) {
      const contiene = { contains: params.filtros.busqueda, mode: 'insensitive' as const };
      where.OR = [
        { deposito: contiene },
        { estanteria: contiene },
        { caja: contiene },
        { descripcion: contiene },
      ];
    }

    const [total, filas] = await this.prisma.$transaction([
      this.prisma.ubicacion.count({ where }),
      this.prisma.ubicacion.findMany({
        where,
        orderBy: [{ [params.orden]: params.direccion }, { creadoEn: 'asc' }],
        skip: (params.pagina - 1) * params.limite,
        take: params.limite,
      }),
    ]);

    return {
      datos: filas.map((fila) => UbicacionMapper.aEntidad(fila)),
      meta: construirMeta(params, total),
    };
  }
}
