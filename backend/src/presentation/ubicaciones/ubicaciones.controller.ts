import { Body, Controller, Get, HttpCode, HttpStatus, Post, Query } from '@nestjs/common';
import {
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CrearUbicacion } from '../../application/ubicaciones/crear-ubicacion.use-case';
import { CrearUbicacionDto } from '../../application/ubicaciones/dto/crear-ubicacion.dto';
import { ListarUbicacionesDto } from '../../application/ubicaciones/dto/listar-ubicaciones.dto';
import { UbicacionDto } from '../../application/ubicaciones/dto/ubicacion.dto';
import { UbicacionesPaginadasDto } from '../../application/ubicaciones/dto/ubicaciones-paginadas.dto';
import { ListarUbicaciones } from '../../application/ubicaciones/listar-ubicaciones.use-case';
import { Autenticado } from '../comun/decoradores/autenticado.decorator';

@ApiTags('ubicaciones')
@Controller('ubicaciones')
export class UbicacionesController {
  constructor(
    private readonly crearUbicacion: CrearUbicacion,
    private readonly listarUbicaciones: ListarUbicaciones,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Listar ubicaciones con paginación, filtros y orden' })
  @ApiOkResponse({ type: UbicacionesPaginadasDto })
  listar(@Query() consulta: ListarUbicacionesDto): Promise<UbicacionesPaginadasDto> {
    return this.listarUbicaciones.ejecutar(consulta);
  }

  @Post()
  @Autenticado('ADMIN', 'PERSONAL')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Registrar una ubicación física (depósito / estantería / caja)' })
  @ApiCreatedResponse({ type: UbicacionDto })
  @ApiConflictResponse({ description: 'Ya existe una ubicación con esa terna.' })
  crear(@Body() datos: CrearUbicacionDto): Promise<UbicacionDto> {
    return this.crearUbicacion.ejecutar(datos);
  }
}
