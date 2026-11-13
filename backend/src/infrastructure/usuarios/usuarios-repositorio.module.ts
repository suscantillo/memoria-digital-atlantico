import { Global, Module } from '@nestjs/common';
import { USUARIO_REPOSITORIO } from '../../domain/usuarios/usuario.repositorio';
import { PrismaUsuarioRepositorio } from './prisma-usuario.repositorio';

@Global()
@Module({
  providers: [{ provide: USUARIO_REPOSITORIO, useClass: PrismaUsuarioRepositorio }],
  exports: [USUARIO_REPOSITORIO],
})
export class UsuariosRepositorioModule {}
