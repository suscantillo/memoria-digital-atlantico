import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Usuario } from '../../domain/usuarios/usuario.entity';
import { CorreoUsuarioDuplicadoError } from '../../domain/usuarios/usuario.errores';
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

  async crear(usuario: Usuario): Promise<Usuario> {
    try {
      const fila = await this.prisma.usuario.create({
        data: {
          id: usuario.id,
          nombre: usuario.nombre,
          correo: usuario.correo,
          contrasenaHash: usuario.contrasenaHash,
          rol: usuario.rol,
          activo: usuario.activo,
          consentimientoEn: usuario.consentimientoEn,
          versionPrivacidad: usuario.versionPrivacidad,
          creadoEn: usuario.creadoEn,
          actualizadoEn: usuario.actualizadoEn,
        },
      });
      return UsuarioMapper.aEntidad(fila);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new CorreoUsuarioDuplicadoError(usuario.correo);
      }
      throw error;
    }
  }
}
