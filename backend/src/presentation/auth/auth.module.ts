import { Module } from '@nestjs/common';
import { CerrarSesion } from '../../application/auth/cerrar-sesion.use-case';
import { IniciarSesion } from '../../application/auth/iniciar-sesion.use-case';
import { ObtenerPerfil } from '../../application/auth/obtener-perfil.use-case';
import {
  HASHER_CONTRASENAS,
  HasherContrasenas,
} from '../../application/auth/ports/hasher-contrasenas';
import { SERVICIO_TOKENS, ServicioTokens } from '../../application/auth/ports/servicio-tokens';
import { RefrescarSesion } from '../../application/auth/refrescar-sesion.use-case';
import { RegistrarUsuario } from '../../application/auth/registrar-usuario.use-case';
import { SESION_REPOSITORIO, SesionRepositorio } from '../../domain/sesiones/sesion.repositorio';
import { USUARIO_REPOSITORIO, UsuarioRepositorio } from '../../domain/usuarios/usuario.repositorio';
import { PrismaSesionRepositorio } from '../../infrastructure/sesiones/prisma-sesion.repositorio';
import { PrismaUsuarioRepositorio } from '../../infrastructure/usuarios/prisma-usuario.repositorio';
import { AuthController } from './auth.controller';

@Module({
  controllers: [AuthController],
  providers: [
    { provide: USUARIO_REPOSITORIO, useClass: PrismaUsuarioRepositorio },
    { provide: SESION_REPOSITORIO, useClass: PrismaSesionRepositorio },
    {
      provide: RegistrarUsuario,
      useFactory: (usuarios: UsuarioRepositorio, hasher: HasherContrasenas) =>
        new RegistrarUsuario(usuarios, hasher),
      inject: [USUARIO_REPOSITORIO, HASHER_CONTRASENAS],
    },
    {
      provide: IniciarSesion,
      useFactory: (
        usuarios: UsuarioRepositorio,
        sesiones: SesionRepositorio,
        hasher: HasherContrasenas,
        tokens: ServicioTokens,
      ) => new IniciarSesion(usuarios, sesiones, hasher, tokens),
      inject: [USUARIO_REPOSITORIO, SESION_REPOSITORIO, HASHER_CONTRASENAS, SERVICIO_TOKENS],
    },
    {
      provide: RefrescarSesion,
      useFactory: (
        usuarios: UsuarioRepositorio,
        sesiones: SesionRepositorio,
        tokens: ServicioTokens,
      ) => new RefrescarSesion(usuarios, sesiones, tokens),
      inject: [USUARIO_REPOSITORIO, SESION_REPOSITORIO, SERVICIO_TOKENS],
    },
    {
      provide: CerrarSesion,
      useFactory: (sesiones: SesionRepositorio, tokens: ServicioTokens) =>
        new CerrarSesion(sesiones, tokens),
      inject: [SESION_REPOSITORIO, SERVICIO_TOKENS],
    },
    {
      provide: ObtenerPerfil,
      useFactory: (usuarios: UsuarioRepositorio) => new ObtenerPerfil(usuarios),
      inject: [USUARIO_REPOSITORIO],
    },
  ],
})
export class AuthModule {}
