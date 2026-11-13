import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { ErrorNoEncontrado } from '../../domain/comun/errores';
import { construirMeta, ResultadoPaginado } from '../../domain/comun/paginacion';
import { CodigoPieza } from '../../domain/piezas/codigo-pieza';
import { CambiosPieza, DatosNuevaPieza, FichaPieza, Pieza } from '../../domain/piezas/pieza.entity';
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

const NAMESPACE_BLOQUEO_CODIGO = 'memoria-digital-atlantico:codigo-pieza';

@Injectable()
export class PrismaPiezaRepositorio implements PiezaRepositorio {
  constructor(private readonly prisma: PrismaService) {}

  private readonly incluirFicha = {
    ...CON_UBICACION_Y_ARCHIVO_APROBADO,
    eventos: {
      orderBy: [{ creadoEn: 'asc' as const }, { id: 'asc' as const }],
      include: { usuario: { select: { id: true, nombre: true } } },
    },
  } satisfies Prisma.PiezaInclude;

  async registrar(datos: DatosNuevaPieza, usuarioId: string): Promise<Pieza> {
    const anioRegistro = new Date().getFullYear();
    const prefijo = `MDA-${anioRegistro}-`;

    return this.prisma.$transaction(async (tx) => {
      await tx.$executeRaw(
        Prisma.sql`SELECT pg_advisory_xact_lock(
          hashtext(${NAMESPACE_BLOQUEO_CODIGO}),
          CAST(${anioRegistro} AS INTEGER)
        )`,
      );

      const ultimoRegistro = await tx.pieza.findFirst({
        where: {
          codigo: {
            startsWith: prefijo,
          },
        },
        orderBy: {
          codigo: 'desc',
        },
        select: {
          codigo: true,
        },
      });

      const ultimoConsecutivo = ultimoRegistro
        ? CodigoPieza.desde(ultimoRegistro.codigo).consecutivo
        : 0;

      const codigo = CodigoPieza.generar(anioRegistro, ultimoConsecutivo + 1);

      const ubicacion = await tx.ubicacion.findUnique({
        where: { id: datos.ubicacionId },
        select: {
          id: true,
          deposito: true,
          estanteria: true,
          caja: true,
        },
      });

      if (!ubicacion) {
        throw new ErrorNoEncontrado(`No encontramos la ubicación "${datos.ubicacionId}".`);
      }

      const pieza = Pieza.crear({
        codigo,
        titulo: datos.titulo,
        tipo: datos.tipo,
        anio: datos.anio,
        ubicacion,
      });

      const fila = await tx.pieza.create({
        data: {
          id: pieza.id,
          codigo: pieza.codigo.valor,
          titulo: pieza.titulo,
          descripcion: pieza.descripcion,
          tipo: pieza.tipo,
          estado: pieza.estado,
          anio: pieza.anio,
          restringida: pieza.restringida,
          creadoEn: pieza.creadoEn,
          actualizadoEn: pieza.actualizadoEn,
          ubicacion: {
            connect: {
              id: pieza.ubicacion.id,
            },
          },
          eventos: {
            create: {
              accion: pieza.estado,
              detalle: `Pieza registrada con código ${pieza.codigo.valor}.`,
              usuario: {
                connect: {
                  id: usuarioId,
                },
              },
            },
          },
        },
        include: CON_UBICACION_Y_ARCHIVO_APROBADO,
      });

      return PiezaMapper.aEntidad(fila);
    });
  }

  async buscarPorCodigo(codigo: CodigoPieza): Promise<Pieza | null> {
    const fila = await this.prisma.pieza.findUnique({
      where: { codigo: codigo.valor },
      include: CON_UBICACION_Y_ARCHIVO_APROBADO,
    });

    return fila ? PiezaMapper.aEntidad(fila) : null;
  }

  async listarPublicadas(params: ParametrosListarPublicadas): Promise<ResultadoPaginado<Pieza>> {
    const { texto, tipo, decada, incluirRestringidas } = params.filtros;

    const where: Prisma.PiezaWhereInput = {
      estado: 'PUBLICADA',
    };

    if (!incluirRestringidas) {
      where.restringida = false;
    }

    if (tipo) {
      where.tipo = tipo;
    }

    if (decada !== undefined) {
      where.anio = {
        gte: decada,
        lt: decada + 10,
      };
    }

    if (texto) {
      const contiene = {
        contains: texto,
        mode: 'insensitive' as const,
      };

      where.OR = [{ titulo: contiene }, { descripcion: contiene }];
    }

    const ordenPedido: Prisma.PiezaOrderByWithRelationInput =
      params.orden === 'anio'
        ? {
            anio: {
              sort: params.direccion,
              nulls: 'last',
            },
          }
        : {
            [params.orden]: params.direccion,
          };

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

  async buscarFicha(id: string): Promise<FichaPieza | null> {
    const fila = await this.prisma.pieza.findUnique({
      where: { id },
      include: this.incluirFicha,
    });

    return fila ? this.aFicha(fila) : null;
  }

  async editar(id: string, cambios: CambiosPieza, usuarioId: string): Promise<FichaPieza> {
    return this.prisma.$transaction(async (transaccion) => {
      const existente = await transaccion.pieza.findUnique({ where: { id } });

      if (!existente) {
        throw new ErrorNoEncontrado(`No se encontró la pieza "${id}".`);
      }

      const datos: Prisma.PiezaUpdateInput = {};

      if (cambios.titulo !== undefined) {
        datos.titulo = cambios.titulo;
      }

      if (cambios.descripcion !== undefined) {
        datos.descripcion = cambios.descripcion;
      }

      await transaccion.pieza.update({
        where: { id },
        data: datos,
      });

      const campos = [
        ...(cambios.titulo !== undefined ? ['título'] : []),
        ...(cambios.descripcion !== undefined ? ['descripción'] : []),
      ];

      await transaccion.eventoPieza.create({
        data: {
          piezaId: id,
          usuarioId,
          accion: 'EDITADA',
          detalle: `Se actualizó ${campos.join(' y ')}.`,
        },
      });

      const ficha = await this.fichaDeTransaccion(transaccion, id);

      if (!ficha) {
        throw new ErrorNoEncontrado(`No se encontró la pieza "${id}".`);
      }

      return this.aFicha(ficha);
    });
  }

  private async fichaDeTransaccion(transaccion: Prisma.TransactionClient, id: string) {
    return transaccion.pieza.findUnique({
      where: { id },
      include: this.incluirFicha,
    });
  }

  private aFicha(
    fila: NonNullable<Awaited<ReturnType<PrismaPiezaRepositorio['fichaDeTransaccion']>>>,
  ): FichaPieza {
    return {
      pieza: PiezaMapper.aEntidad(fila),
      ubicacion: fila.ubicacion,
      eventos: fila.eventos.map((evento) => ({
        id: evento.id,
        usuarioId: evento.usuarioId,
        usuarioNombre: evento.usuario?.nombre ?? null,
        accion: evento.accion,
        detalle: evento.detalle,
        creadoEn: evento.creadoEn,
      })),
    };
  }
}
