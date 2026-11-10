import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
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
import { CrearCuentaPersonal } from '../../application/usuarios/crear-cuenta-personal.use-case';
import { CambiarRolUsuarioDto } from '../../application/usuarios/dto/cambiar-rol-usuario.dto';
import { CrearCuentaPersonalDto } from '../../application/usuarios/dto/crear-cuenta-personal.dto';
import { ListarUsuariosDto } from '../../application/usuarios/dto/listar-usuarios.dto';
import {
  UsuarioAdministradoDto,
  UsuariosPaginadosDto,
} from '../../application/usuarios/dto/usuario-administrado.dto';
import { ListarUsuarios } from '../../application/usuarios/listar-usuarios.use-case';
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
  ) {}

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
    @Param('id') id: string,
    @Body() datos: CambiarRolUsuarioDto,
    @UsuarioActual() administrador: UsuarioAutenticado,
  ): Promise<UsuarioAdministradoDto> {
    return this.cambiarRolUsuario.ejecutar(id, datos.rol, administrador.id);
  }

  @Patch(':id/desactivar')
  @ApiOperation({ summary: 'Desactivar una cuenta y revocar sus sesiones' })
  @ApiOkResponse({ type: UsuarioAdministradoDto })
  desactivar(
    @Param('id') id: string,
    @UsuarioActual() administrador: UsuarioAutenticado,
  ): Promise<UsuarioAdministradoDto> {
    return this.desactivarUsuario.ejecutar(id, administrador.id);
  }
}
