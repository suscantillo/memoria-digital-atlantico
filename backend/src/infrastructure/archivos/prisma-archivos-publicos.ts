import { Injectable } from '@nestjs/common';
import { ArchivoPublicable, ArchivosPublicos } from '../../application/archivos/puertos';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PrismaArchivosPublicos implements ArchivosPublicos {
  constructor(private readonly prisma: PrismaService) {}

  buscarPublicable(id: string): Promise<ArchivoPublicable | null> {
    return this.prisma.archivoDigital.findFirst({
      where: {
        id,
        estado: 'APROBADO',
        pieza: { estado: 'PUBLICADA', restringida: false },
      },
      select: { id: true, nombreOriginal: true, rutaAlmacenamiento: true, tipoMime: true },
    });
  }
}
