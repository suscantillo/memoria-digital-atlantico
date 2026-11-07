import { Injectable } from '@nestjs/common';
import { Sesion as SesionFila } from '@prisma/client';
import { Sesion } from '../../domain/sesiones/sesion.entity';
import { SesionRepositorio } from '../../domain/sesiones/sesion.repositorio';
import { PrismaService } from '../prisma/prisma.service';

function aEntidad(fila: SesionFila): Sesion {
  return Sesion.reconstruir({
    id: fila.id,
    usuarioId: fila.usuarioId,
    jti: fila.jti,
    expiraEn: fila.expiraEn,
    revocadaEn: fila.revocadaEn,
    creadoEn: fila.creadoEn,
  });
}

@Injectable()
export class PrismaSesionRepositorio implements SesionRepositorio {
  constructor(private readonly prisma: PrismaService) {}

  async guardar(sesion: Sesion): Promise<Sesion> {
    const fila = await this.prisma.sesion.create({
      data: {
        id: sesion.id,
        usuarioId: sesion.usuarioId,
        jti: sesion.jti,
        expiraEn: sesion.expiraEn,
        revocadaEn: sesion.revocadaEn,
        creadoEn: sesion.creadoEn,
      },
    });
    return aEntidad(fila);
  }

  async buscarPorJti(jti: string): Promise<Sesion | null> {
    const fila = await this.prisma.sesion.findUnique({ where: { jti } });
    return fila ? aEntidad(fila) : null;
  }

  async revocar(id: string, fecha: Date): Promise<void> {
    await this.prisma.sesion.updateMany({
      where: { id, revocadaEn: null },
      data: { revocadaEn: fecha },
    });
  }

  async revocarTodasDelUsuario(usuarioId: string, fecha: Date): Promise<void> {
    await this.prisma.sesion.updateMany({
      where: { usuarioId, revocadaEn: null },
      data: { revocadaEn: fecha },
    });
  }
}
