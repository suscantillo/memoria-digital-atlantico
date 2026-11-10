import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ErrorNoEncontrado } from '../../domain/comun/errores';
import { CodigoPieza } from '../../domain/piezas/codigo-pieza';
import { CambiosPieza, DatosNuevaPieza, FichaPieza, Pieza } from '../../domain/piezas/pieza.entity';
import { PiezaRepositorio } from '../../domain/piezas/pieza.repositorio';
import { PrismaService } from '../prisma/prisma.service';
import { PiezaMapper } from './pieza.mapper';

@Injectable()
export class PrismaPiezaRepositorio implements PiezaRepositorio {
  constructor(private readonly prisma: PrismaService) {}

  private readonly incluirFicha = {
    ubicacion: { select: { id: true, deposito: true, estanteria: true, caja: true } },
    eventos: {
      orderBy: [{ creadoEn: 'asc' as const }, { id: 'asc' as const }],
      include: { usuario: { select: { id: true, nombre: true } } },
    },
  };

  async registrar(datos: DatosNuevaPieza, usuarioId: string): Promise<Pieza> {
    const anioRegistro = new Date().getUTCFullYear();

    return this.prisma.$transaction(async (transaccion) => {
      const ubicacion = await transaccion.ubicacion.findUnique({
        where: { id: datos.ubicacionId },
        select: { id: true },
      });
      if (!ubicacion) {
        throw new ErrorNoEncontrado('La ubicación seleccionada no existe.');
      }

      await transaccion.$queryRaw(
        Prisma.sql`SELECT 1 WHERE pg_advisory_xact_lock(hashtext('memoria-digital-atlantico:codigo-pieza'), CAST(${anioRegistro} AS INTEGER)) IS NULL`,
      );

      const ultimaPieza = await transaccion.pieza.findFirst({
        where: { codigo: { startsWith: `MDA-${anioRegistro}-` } },
        orderBy: { codigo: 'desc' },
        select: { codigo: true },
      });
      const siguiente = ultimaPieza ? CodigoPieza.desde(ultimaPieza.codigo).consecutivo + 1 : 1;
      const codigo = CodigoPieza.generar(anioRegistro, siguiente);

      const fila = await transaccion.pieza.create({
        data: {
          codigo: codigo.valor,
          titulo: datos.titulo,
          tipo: datos.tipo,
          estado: 'REGISTRADA',
          anio: datos.anio,
          ubicacionId: datos.ubicacionId,
        },
      });

      await transaccion.eventoPieza.create({
        data: {
          piezaId: fila.id,
          usuarioId,
          accion: 'REGISTRADA',
          detalle: `Pieza registrada con código ${codigo.valor}.`,
        },
      });

      return PiezaMapper.aEntidad(fila);
    });
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
      if (cambios.titulo !== undefined) datos.titulo = cambios.titulo;
      if (cambios.descripcion !== undefined) datos.descripcion = cambios.descripcion;

      await transaccion.pieza.update({ where: { id }, data: datos });
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
