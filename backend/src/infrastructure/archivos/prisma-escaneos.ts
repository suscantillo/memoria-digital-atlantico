import { Injectable } from '@nestjs/common';
import {
  EscaneoRegistrado,
  Escaneos,
  NuevoEscaneo,
  PiezaParaEscaneo,
} from '../../application/archivos/puertos';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PrismaEscaneos implements Escaneos {
  constructor(private readonly prisma: PrismaService) {}

  async piezaParaEscaneo(piezaId: string): Promise<PiezaParaEscaneo | null> {
    const fila = await this.prisma.pieza.findUnique({
      where: { id: piezaId },
      select: {
        id: true,
        codigo: true,
        estado: true,
        _count: { select: { archivos: { where: { estado: 'EN_REVISION' } } } },
      },
    });
    if (!fila) return null;
    return {
      id: fila.id,
      codigo: fila.codigo,
      estado: fila.estado,
      tieneEscaneoEnRevision: fila._count.archivos > 0,
    };
  }

  async registrar(escaneo: NuevoEscaneo): Promise<EscaneoRegistrado | null> {
    return this.prisma.$transaction(async (tx) => {
      // la condición de estado hace de candado: si dos cargas llegan juntas, solo una cambia la pieza
      const cambio = await tx.pieza.updateMany({
        where: { id: escaneo.piezaId, estado: 'REGISTRADA' },
        data: {
          estado: 'ESCANEADA',
          tema: escaneo.tema,
          autor: escaneo.autor,
          palabrasClave: escaneo.palabrasClave,
        },
      });
      if (cambio.count === 0) return null;

      const archivo = await tx.archivoDigital.create({
        data: {
          piezaId: escaneo.piezaId,
          nombreOriginal: escaneo.nombreOriginal,
          rutaAlmacenamiento: escaneo.rutaAlmacenamiento,
          tipoMime: escaneo.tipoMime,
          tamanoBytes: escaneo.tamanoBytes,
          estado: 'EN_REVISION',
          subidoPorId: escaneo.usuarioId,
        },
        select: { id: true, creadoEn: true },
      });
      await tx.eventoPieza.create({
        data: {
          piezaId: escaneo.piezaId,
          usuarioId: escaneo.usuarioId,
          accion: 'ESCANEADA',
          detalle: `Escaneo «${escaneo.nombreOriginal}» cargado; queda EN_REVISION.`,
        },
      });
      return archivo;
    });
  }
}
