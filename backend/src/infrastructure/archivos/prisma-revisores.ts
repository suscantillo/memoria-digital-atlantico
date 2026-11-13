import { Injectable } from '@nestjs/common';
import { RevisorDisponible, Revisores } from '../../application/archivos/puertos';
import { PrismaService } from '../prisma/prisma.service';

const DISPONIBLE = { rol: 'PERSONAL', activo: true } as const;
const CAMPOS = { id: true, nombre: true, correo: true } as const;

/** HU-23: solo las cuentas PERSONAL activas revisan escaneos asignados. */
@Injectable()
export class PrismaRevisores implements Revisores {
  constructor(private readonly prisma: PrismaService) {}

  listarDisponibles(): Promise<RevisorDisponible[]> {
    return this.prisma.usuario.findMany({
      where: DISPONIBLE,
      select: CAMPOS,
      orderBy: [{ nombre: 'asc' }, { id: 'asc' }],
    });
  }

  buscarDisponible(id: string): Promise<RevisorDisponible | null> {
    return this.prisma.usuario.findFirst({ where: { id, ...DISPONIBLE }, select: CAMPOS });
  }
}
