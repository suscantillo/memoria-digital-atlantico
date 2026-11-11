import { Body, Controller, Get, HttpCode, HttpStatus, Post } from '@nestjs/common';
import {
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CerrarSesion } from '../../application/auth/cerrar-sesion.use-case';
import { IniciarSesionDto } from '../../application/auth/dto/iniciar-sesion.dto';
import { RefrescarSesionDto } from '../../application/auth/dto/refrescar-sesion.dto';
import { SesionIniciadaDto } from '../../application/auth/dto/sesion-iniciada.dto';
import { UsuarioDto } from '../../application/auth/dto/usuario.dto';
import { IniciarSesion } from '../../application/auth/iniciar-sesion.use-case';
import { ObtenerPerfil } from '../../application/auth/obtener-perfil.use-case';
import { RefrescarSesion } from '../../application/auth/refrescar-sesion.use-case';
import { Autenticado } from '../comun/decoradores/autenticado.decorator';
import { Publica } from '../comun/decoradores/publica.decorator';
import { UsuarioActual } from '../comun/decoradores/usuario-actual.decorator';
import { UsuarioAutenticado } from '../comun/solicitud-autenticada';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly iniciarSesion: IniciarSesion,
    private readonly refrescarSesion: RefrescarSesion,
    private readonly cerrarSesion: CerrarSesion,
    private readonly obtenerPerfil: ObtenerPerfil,
  ) {}

  @Post('ingresar')
  @Publica()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Iniciar sesión con correo y contraseña' })
  @ApiOkResponse({ type: SesionIniciadaDto })
  @ApiUnauthorizedResponse({ description: 'Correo o contraseña incorrectos.' })
  ingresar(@Body() datos: IniciarSesionDto): Promise<SesionIniciadaDto> {
    return this.iniciarSesion.ejecutar(datos);
  }

  @Post('refrescar')
  @Publica()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Renovar el token de acceso (rota el token de refresco)' })
  @ApiOkResponse({ type: SesionIniciadaDto })
  @ApiUnauthorizedResponse({ description: 'Token de refresco inválido, revocado o expirado.' })
  refrescar(@Body() datos: RefrescarSesionDto): Promise<SesionIniciadaDto> {
    return this.refrescarSesion.ejecutar(datos);
  }

  @Post('salir')
  @Publica()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Cerrar sesión (revoca el token de refresco)' })
  @ApiNoContentResponse()
  salir(@Body() datos: RefrescarSesionDto): Promise<void> {
    return this.cerrarSesion.ejecutar(datos);
  }

  @Get('yo')
  @Autenticado()
  @ApiOperation({ summary: 'Datos del usuario autenticado' })
  @ApiOkResponse({ type: UsuarioDto })
  yo(@UsuarioActual() usuario: UsuarioAutenticado): Promise<UsuarioDto> {
    return this.obtenerPerfil.ejecutar(usuario.id);
  }
}
