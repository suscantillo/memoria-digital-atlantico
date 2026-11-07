import { Injectable } from '@nestjs/common';
import { Usuario } from '../../domain/usuarios/usuario.entity';
import { UsuarioRepositorio } from '../../domain/usuarios/usuario.repositorio';
import { PrismaService } from '../prisma/prisma.service';
import { UsuarioMapper } from './usuario.mapper';

@Injectable()
export class PrismaUsuarioRepositorio implements UsuarioRepositorio {
  constructor(private readonly prisma: PrismaService) {}

  async buscarPorId(id: string): Promise<Usuario | null> {
    const fila = await this.prisma.usuario.findUnique({ where: { id } });
    return fila ? UsuarioMapper.aEntidad(fila) : null;
  }

  async buscarPorCorreo(correo: string): Promise<Usuario | null> {
    const fila = await this.prisma.usuario.findUnique({ where: { correo } });
    return fila ? UsuarioMapper.aEntidad(fila) : null;
  }
}
