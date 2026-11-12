import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ErrorNoEncontrado } from '../../domain/comun/errores';
import { CodigoPieza } from '../../domain/piezas/codigo-pieza';
import { DatosNuevaPieza, Pieza } from '../../domain/piezas/pieza.entity';
import { PiezaRepositorio } from '../../domain/piezas/pieza.repositorio';
import { PrismaService } from '../prisma/prisma.service';
import { PiezaMapper } from './pieza.mapper';

@Injectable()
export class PrismaPiezaRepositorio implements PiezaRepositorio {
  constructor(private readonly prisma: PrismaService) {}

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

      const pieza = Pieza.crear({
        ...datos,
        codigo,
        estado: 'REGISTRADA',
      });

      const fila = await transaccion.pieza.create({
        data: {
          codigo: pieza.codigo.valor,
          titulo: pieza.titulo,
          tipo: pieza.tipo,
          estado: pieza.estado,
          anio: pieza.anio,
          ubicacionId: pieza.ubicacionId,
        },
      });

      await transaccion.eventoPieza.create({
        data: {
          piezaId: fila.id,
          usuarioId,
          accion: pieza.estado,
          detalle: `Pieza registrada con código ${pieza.codigo.valor}.`,
        },
      });

      return PiezaMapper.aEntidad(fila);
    });
  }
}
