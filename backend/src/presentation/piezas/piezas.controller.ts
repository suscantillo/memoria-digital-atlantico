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
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { CrearPieza } from '../../application/piezas/crear-pieza.use-case';
import { CrearPiezaDto } from '../../application/piezas/dto/crear-pieza.dto';
import { EditarPiezaDto } from '../../application/piezas/dto/editar-pieza.dto';
import { FichaPiezaDto } from '../../application/piezas/dto/ficha-pieza.dto';
import { PiezaDto } from '../../application/piezas/dto/pieza.dto';
import { EditarPieza } from '../../application/piezas/editar-pieza.use-case';
import { ObtenerFichaPieza } from '../../application/piezas/obtener-ficha-pieza.use-case';
import { UsuarioActual } from '../comun/decoradores/usuario-actual.decorator';
import { Autenticado } from '../comun/decoradores/autenticado.decorator';
import { UsuarioAutenticado } from '../comun/solicitud-autenticada';

const ESQUEMA_FICHA_PIEZA = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    codigo: { type: 'string', example: 'MDA-2026-0011' },
    titulo: { type: 'string' },
    descripcion: { type: 'string', nullable: true },
    tipo: { type: 'string', enum: ['DOCUMENTO', 'FOTOGRAFIA', 'PERIODICO'] },
    estado: { type: 'string', enum: ['REGISTRADA', 'ESCANEADA', 'REVISADA', 'PUBLICADA'] },
    anio: { type: 'integer' },
    ubicacion: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid' },
        deposito: { type: 'string' },
        estanteria: { type: 'string' },
        caja: { type: 'string' },
      },
    },
    eventos: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          usuarioId: { type: 'string', format: 'uuid', nullable: true },
          usuarioNombre: { type: 'string', nullable: true },
          accion: { type: 'string' },
          detalle: { type: 'string', nullable: true },
          creadoEn: { type: 'string', format: 'date-time' },
        },
      },
    },
    creadoEn: { type: 'string', format: 'date-time' },
    actualizadoEn: { type: 'string', format: 'date-time' },
  },
};

@ApiTags('piezas')
@Controller('piezas')
export class PiezasController {
  constructor(
    private readonly crearPieza: CrearPieza,
    private readonly obtenerFichaPieza: ObtenerFichaPieza,
    private readonly editarPieza: EditarPieza,
  ) {}

  @Post()
  @Autenticado('ADMIN', 'PERSONAL')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Registrar una pieza y crear su evento inicial' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['tipo', 'titulo', 'anio', 'ubicacionId'],
      properties: {
        tipo: { type: 'string', enum: ['DOCUMENTO', 'FOTOGRAFIA', 'PERIODICO'] },
        titulo: { type: 'string', minLength: 1 },
        anio: { type: 'integer', minimum: 1500, maximum: 2100 },
        ubicacionId: {
          type: 'string',
          format: 'uuid',
          description: 'Ubicación que contiene la caja.',
        },
      },
    },
  })
  @ApiCreatedResponse({
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid' },
        codigo: { type: 'string', example: 'MDA-2026-0011' },
        titulo: { type: 'string' },
        tipo: { type: 'string', enum: ['DOCUMENTO', 'FOTOGRAFIA', 'PERIODICO'] },
        estado: { type: 'string', example: 'REGISTRADA' },
        anio: { type: 'integer', minimum: 1500, maximum: 2100 },
        ubicacionId: { type: 'string', format: 'uuid' },
        creadoEn: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Tipo, título, año o ubicación inválidos.' })
  crear(
    @Body() datos: CrearPiezaDto,
    @UsuarioActual() usuario: UsuarioAutenticado,
  ): Promise<PiezaDto> {
    return this.crearPieza.ejecutar(datos, usuario.id);
  }

  @Get(':id')
  @Autenticado('ADMIN', 'PERSONAL')
  @ApiOperation({ summary: 'Consultar la ficha interna de una pieza y su historial' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ schema: ESQUEMA_FICHA_PIEZA })
  @ApiNotFoundResponse({ description: 'La pieza no existe.' })
  obtener(@Param('id', ParseUUIDPipe) id: string): Promise<FichaPiezaDto> {
    return this.obtenerFichaPieza.ejecutar(id);
  }

  @Patch(':id')
  @Autenticado('ADMIN', 'PERSONAL')
  @ApiOperation({ summary: 'Editar el título o la descripción de una pieza' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiBody({
    schema: {
      type: 'object',
      minProperties: 1,
      properties: {
        titulo: { type: 'string', minLength: 1 },
        descripcion: { type: 'string', maxLength: 5000 },
      },
    },
  })
  @ApiOkResponse({ schema: ESQUEMA_FICHA_PIEZA })
  @ApiBadRequestResponse({ description: 'Debes indicar un título o descripción válidos.' })
  @ApiNotFoundResponse({ description: 'La pieza no existe.' })
  editar(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() datos: EditarPiezaDto,
    @UsuarioActual() usuario: UsuarioAutenticado,
  ): Promise<FichaPiezaDto> {
    return this.editarPieza.ejecutar(id, datos, usuario.id);
  }
}
