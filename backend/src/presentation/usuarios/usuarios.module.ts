import { Module } from '@nestjs/common';
import { CambiarRolUsuario } from '../../application/usuarios/cambiar-rol-usuario.use-case';
import {
  DesactivarCuentaPublica,
  ListarCuentasPublicas,
  ReactivarCuentaPublica,
} from '../../application/usuarios/cuentas-publicas.use-case';
import { CrearCuentaPersonal } from '../../application/usuarios/crear-cuenta-personal.use-case';
import { DesactivarUsuario } from '../../application/usuarios/desactivar-usuario.use-case';
import { ListarUsuarios } from '../../application/usuarios/listar-usuarios.use-case';
import { ReactivarUsuario } from '../../application/usuarios/reactivar-usuario.use-case';
import {
  HASHER_CONTRASENAS,
  HasherContrasenas,
} from '../../application/auth/ports/hasher-contrasenas';
import { USUARIO_REPOSITORIO, UsuarioRepositorio } from '../../domain/usuarios/usuario.repositorio';
import { UsuariosController } from './usuarios.controller';

@Module({
  controllers: [UsuariosController],
  providers: [
    ...[ListarCuentasPublicas, DesactivarCuentaPublica, ReactivarCuentaPublica].map(
      (CasoDeUso) => ({
        provide: CasoDeUso,
        useFactory: (usuarios: UsuarioRepositorio) => new CasoDeUso(usuarios),
        inject: [USUARIO_REPOSITORIO],
      }),
    ),
    {
      provide: CrearCuentaPersonal,
      useFactory: (usuarios: UsuarioRepositorio, hasher: HasherContrasenas) =>
        new CrearCuentaPersonal(usuarios, hasher),
      inject: [USUARIO_REPOSITORIO, HASHER_CONTRASENAS],
    },
    {
      provide: ListarUsuarios,
      useFactory: (usuarios: UsuarioRepositorio) => new ListarUsuarios(usuarios),
      inject: [USUARIO_REPOSITORIO],
    },
    {
      provide: CambiarRolUsuario,
      useFactory: (usuarios: UsuarioRepositorio) => new CambiarRolUsuario(usuarios),
      inject: [USUARIO_REPOSITORIO],
    },
    {
      provide: DesactivarUsuario,
      useFactory: (usuarios: UsuarioRepositorio) => new DesactivarUsuario(usuarios),
      inject: [USUARIO_REPOSITORIO],
    },
    {
      provide: ReactivarUsuario,
      useFactory: (usuarios: UsuarioRepositorio) => new ReactivarUsuario(usuarios),
      inject: [USUARIO_REPOSITORIO],
    },
  ],
})
export class UsuariosModule {}
