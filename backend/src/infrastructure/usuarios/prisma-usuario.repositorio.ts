import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ErrorNoEncontrado } from '../../domain/comun/errores';
import { ResultadoPaginado, construirMeta } from '../../domain/comun/paginacion';
import { CorreoUsuarioDuplicadoError } from '../../domain/usuarios/usuario.errores';
import { RolUsuario } from '../../domain/usuarios/rol-usuario';
import { Usuario } from '../../domain/usuarios/usuario.entity';
import {
  ParametrosListadoUsuarios,
  UsuarioRepositorio,
} from '../../domain/usuarios/usuario.repositorio';
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
          creadoEn: usuario.creadoEn,
          actualizadoEn: usuario.actualizadoEn,
        },
      });
      return UsuarioMapper.aEntidad(fila);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002' &&
        Array.isArray(error.meta?.target) &&
        error.meta.target.includes('correo')
      ) {
        throw new CorreoUsuarioDuplicadoError(usuario.correo);
      }
      throw error;
    }
  }

  async listarPersonal(params: ParametrosListadoUsuarios): Promise<ResultadoPaginado<Usuario>> {
    const termino = params.busqueda?.trim() ?? '';
    const where: Prisma.UsuarioWhereInput = {
      rol: { in: ['ADMIN', 'PERSONAL'] },
      ...(termino
        ? {
            OR: [
              { nombre: { contains: termino, mode: 'insensitive' } },
              { correo: { contains: termino, mode: 'insensitive' } },
            ],
          }
        : {}),
    };
    const [filas, total] = await this.prisma.$transaction([
      this.prisma.usuario.findMany({
        where,
        orderBy: [{ [params.orden]: params.direccion }, { id: 'asc' }],
        skip: (params.pagina - 1) * params.limite,
        take: params.limite,
      }),
      this.prisma.usuario.count({ where }),
    ]);
    return {
      datos: filas.map((fila) => UsuarioMapper.aEntidad(fila)),
      meta: construirMeta(params, total),
    };
  }

  async cambiarRol(id: string, rol: RolUsuario, fecha: Date): Promise<Usuario> {
    try {
      const fila = await this.prisma.$transaction(async (transaccion) => {
        const usuario = await transaccion.usuario.update({
          where: { id, rol: { in: ['ADMIN', 'PERSONAL'] } },
          data: { rol },
        });
        await transaccion.sesion.updateMany({
          where: { usuarioId: id, revocadaEn: null },
          data: { revocadaEn: fecha },
        });
        return usuario;
      });
      return UsuarioMapper.aEntidad(fila);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new ErrorNoEncontrado(`No se encontró el usuario "${id}".`);
      }
      throw error;
    }
  }

  async desactivar(id: string, fecha: Date): Promise<Usuario> {
    try {
      const fila = await this.prisma.$transaction(async (transaccion) => {
        const usuario = await transaccion.usuario.update({
          where: { id, rol: { in: ['ADMIN', 'PERSONAL'] } },
          data: { activo: false },
        });
        await transaccion.sesion.updateMany({
          where: { usuarioId: id, revocadaEn: null },
          data: { revocadaEn: fecha },
        });
        return usuario;
      });
      return UsuarioMapper.aEntidad(fila);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new ErrorNoEncontrado(`No se encontró el usuario "${id}".`);
      }
      throw error;
    }
  }

  async reactivar(id: string): Promise<Usuario> {
    try {
      const fila = await this.prisma.usuario.update({
        where: { id, rol: { in: ['ADMIN', 'PERSONAL'] } },
        data: { activo: true },
      });
      return UsuarioMapper.aEntidad(fila);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new ErrorNoEncontrado(`No se encontró el usuario "${id}".`);
      }
      throw error;
    }
  }
}
