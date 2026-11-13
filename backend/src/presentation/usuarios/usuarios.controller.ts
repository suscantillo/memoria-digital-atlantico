import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CambiarRolUsuario } from '../../application/usuarios/cambiar-rol-usuario.use-case';
import {
  DesactivarCuentaPublica,
  ListarCuentasPublicas,
  ReactivarCuentaPublica,
} from '../../application/usuarios/cuentas-publicas.use-case';
import {
  CuentaPublicaDto,
  CuentasPublicasPaginadasDto,
} from '../../application/usuarios/dto/cuenta-publica.dto';
import { CrearCuentaPersonal } from '../../application/usuarios/crear-cuenta-personal.use-case';
import { CambiarRolUsuarioDto } from '../../application/usuarios/dto/cambiar-rol-usuario.dto';
import { CrearCuentaPersonalDto } from '../../application/usuarios/dto/crear-cuenta-personal.dto';
import { ListarUsuariosDto } from '../../application/usuarios/dto/listar-usuarios.dto';
import {
  UsuarioAdministradoDto,
  UsuariosPaginadosDto,
} from '../../application/usuarios/dto/usuario-administrado.dto';
import { ListarUsuarios } from '../../application/usuarios/listar-usuarios.use-case';
import { ReactivarUsuario } from '../../application/usuarios/reactivar-usuario.use-case';
import { DesactivarUsuario } from '../../application/usuarios/desactivar-usuario.use-case';
import { UsuarioActual } from '../comun/decoradores/usuario-actual.decorator';
import { Autenticado } from '../comun/decoradores/autenticado.decorator';
import { UsuarioAutenticado } from '../comun/solicitud-autenticada';

@ApiTags('usuarios')
@Controller('usuarios')
@Autenticado('ADMIN')
export class UsuariosController {
  constructor(
    private readonly crearCuentaPersonal: CrearCuentaPersonal,
    private readonly listarUsuarios: ListarUsuarios,
    private readonly cambiarRolUsuario: CambiarRolUsuario,
    private readonly desactivarUsuario: DesactivarUsuario,
    private readonly reactivarUsuario: ReactivarUsuario,
    private readonly listarCuentasPublicas: ListarCuentasPublicas,
    private readonly desactivarCuentaPublica: DesactivarCuentaPublica,
    private readonly reactivarCuentaPublica: ReactivarCuentaPublica,
  ) {}

  @Get('publico')
  @ApiOperation({ summary: 'Listar las cuentas PUBLICO del portal con paginación y búsqueda' })
  @ApiOkResponse({ type: CuentasPublicasPaginadasDto })
  listarPublico(@Query() consulta: ListarUsuariosDto): Promise<CuentasPublicasPaginadasDto> {
    return this.listarCuentasPublicas.ejecutar(consulta);
  }

  @Patch('publico/:id/desactivar')
  @ApiOperation({ summary: 'Desactivar una cuenta del portal y revocar sus sesiones' })
  @ApiOkResponse({ type: CuentaPublicaDto })
  desactivarPublico(@Param('id', ParseUUIDPipe) id: string): Promise<CuentaPublicaDto> {
    return this.desactivarCuentaPublica.ejecutar(id);
  }

  @Patch('publico/:id/reactivar')
  @ApiOperation({ summary: 'Reactivar una cuenta del portal' })
  @ApiOkResponse({ type: CuentaPublicaDto })
  reactivarPublico(@Param('id', ParseUUIDPipe) id: string): Promise<CuentaPublicaDto> {
    return this.reactivarCuentaPublica.ejecutar(id);
  }

  @Get()
  @ApiOperation({ summary: 'Listar cuentas del personal con paginación y búsqueda' })
  @ApiOkResponse({ type: UsuariosPaginadosDto })
  listar(@Query() consulta: ListarUsuariosDto): Promise<UsuariosPaginadosDto> {
    return this.listarUsuarios.ejecutar(consulta);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear una cuenta de PERSONAL' })
  @ApiCreatedResponse({ type: UsuarioAdministradoDto })
  @ApiConflictResponse({ description: 'Ya existe una cuenta con ese correo.' })
  crear(@Body() datos: CrearCuentaPersonalDto): Promise<UsuarioAdministradoDto> {
    return this.crearCuentaPersonal.ejecutar(datos);
  }

  @Patch(':id/rol')
  @ApiOperation({ summary: 'Cambiar el rol de una cuenta del personal' })
  @ApiOkResponse({ type: UsuarioAdministradoDto })
  cambiarRol(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() datos: CambiarRolUsuarioDto,
    @UsuarioActual() administrador: UsuarioAutenticado,
  ): Promise<UsuarioAdministradoDto> {
    return this.cambiarRolUsuario.ejecutar(id, datos.rol, administrador.id);
  }

  @Patch(':id/desactivar')
  @ApiOperation({ summary: 'Desactivar una cuenta y revocar sus sesiones' })
  @ApiOkResponse({ type: UsuarioAdministradoDto })
  desactivar(
    @Param('id', ParseUUIDPipe) id: string,
    @UsuarioActual() administrador: UsuarioAutenticado,
  ): Promise<UsuarioAdministradoDto> {
    return this.desactivarUsuario.ejecutar(id, administrador.id);
  }

  @Patch(':id/reactivar')
  @ApiOperation({ summary: 'Reactivar una cuenta desactivada' })
  @ApiOkResponse({ type: UsuarioAdministradoDto })
  reactivar(@Param('id', ParseUUIDPipe) id: string): Promise<UsuarioAdministradoDto> {
    return this.reactivarUsuario.ejecutar(id);
  }
}
