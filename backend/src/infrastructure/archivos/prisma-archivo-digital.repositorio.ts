import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ArchivoDigital } from '../../domain/archivos/archivo-digital.entity';
import {
  ArchivoDigitalRepositorio,
  DetalleArchivoDigital,
  EventoRevision,
  ParametrosListarArchivos,
  RevisionEscaneo,
} from '../../domain/archivos/archivo-digital.repositorio';
import { construirMeta, ResultadoPaginado } from '../../domain/comun/paginacion';
import { PiezaMapper } from '../piezas/pieza.mapper';
import { PrismaService } from '../prisma/prisma.service';

const DETALLE = {
  id: true,
  nombreOriginal: true,
  tipoMime: true,
  tamanoBytes: true,
  estado: true,
  motivoRechazo: true,
  creadoEn: true,
  revisadoEn: true,
  subidoPor: { select: { nombre: true, correo: true } },
  pieza: {
    select: {
      id: true,
      codigo: true,
      titulo: true,
      tipo: true,
      estado: true,
      anio: true,
      tema: true,
      autor: true,
      palabrasClave: true,
    },
  },
} satisfies Prisma.ArchivoDigitalSelect;

const PIEZA_COMPLETA = {
  ubicacion: true,
  archivos: {
    where: { estado: 'APROBADO' },
    orderBy: { revisadoEn: 'desc' },
    take: 1,
    select: { id: true, tipoMime: true },
  },
} satisfies Prisma.PiezaInclude;

type FilaArchivo = Prisma.ArchivoDigitalGetPayload<object>;

function aEntidad(fila: FilaArchivo): ArchivoDigital {
  return ArchivoDigital.reconstruir({
    id: fila.id,
    piezaId: fila.piezaId,
    nombreOriginal: fila.nombreOriginal,
    rutaAlmacenamiento: fila.rutaAlmacenamiento,
    tipoMime: fila.tipoMime,
    tamanoBytes: fila.tamanoBytes,
    estado: fila.estado,
    motivoRechazo: fila.motivoRechazo,
    subidoPorId: fila.subidoPorId,
    revisadoPorId: fila.revisadoPorId,
    revisadoEn: fila.revisadoEn,
    revisorAsignadoId: fila.revisorAsignadoId,
    creadoEn: fila.creadoEn,
  });
}

@Injectable()
export class PrismaArchivoDigitalRepositorio implements ArchivoDigitalRepositorio {
  constructor(private readonly prisma: PrismaService) {}

  async listar(
    params: ParametrosListarArchivos,
  ): Promise<ResultadoPaginado<DetalleArchivoDigital>> {
    const where: Prisma.ArchivoDigitalWhereInput = params.estado ? { estado: params.estado } : {};
    const [total, filas] = await this.prisma.$transaction([
      this.prisma.archivoDigital.count({ where }),
      this.prisma.archivoDigital.findMany({
        where,
        select: DETALLE,
        // el id desempata para que un archivo no salte de página
        orderBy: [{ [params.orden]: params.direccion }, { id: 'asc' }],
        skip: (params.pagina - 1) * params.limite,
        take: params.limite,
      }),
    ]);
    return { datos: filas, meta: construirMeta(params, total) };
  }

  buscarDetalle(id: string): Promise<DetalleArchivoDigital | null> {
    return this.prisma.archivoDigital.findUnique({ where: { id }, select: DETALLE });
  }

  async buscarPorId(id: string): Promise<ArchivoDigital | null> {
    const fila = await this.prisma.archivoDigital.findUnique({ where: { id } });
    return fila ? aEntidad(fila) : null;
  }

  async buscarRevision(id: string): Promise<RevisionEscaneo | null> {
    const fila = await this.prisma.archivoDigital.findUnique({
      where: { id },
      include: { pieza: { include: PIEZA_COMPLETA } },
    });
    if (!fila) return null;
    const { pieza, ...archivo } = fila;
    return { archivo: aEntidad(archivo), pieza: PiezaMapper.aEntidad(pieza) };
  }

  async guardarRevision(
    { archivo, pieza }: RevisionEscaneo,
    evento: EventoRevision,
  ): Promise<boolean> {
    return this.prisma.$transaction(async (tx) => {
      // la condición de estado hace de candado: de dos revisiones simultáneas solo entra una
      const cambio = await tx.archivoDigital.updateMany({
        where: { id: archivo.id, estado: 'EN_REVISION' },
        data: {
          estado: archivo.estado,
          motivoRechazo: archivo.motivoRechazo,
          revisadoPorId: archivo.revisadoPorId,
          revisadoEn: archivo.revisadoEn,
        },
      });
      if (cambio.count === 0) return false;

      await tx.pieza.update({ where: { id: pieza.id }, data: { estado: pieza.estado } });
      await tx.eventoPieza.create({
        data: {
          piezaId: pieza.id,
          usuarioId: archivo.revisadoPorId,
          accion: evento.accion,
          detalle: evento.detalle,
        },
      });
      return true;
    });
  }
}
