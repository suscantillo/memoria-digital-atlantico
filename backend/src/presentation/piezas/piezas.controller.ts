import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CrearPieza } from '../../application/piezas/crear-pieza.use-case';
import { CrearPiezaDto } from '../../application/piezas/dto/crear-pieza.dto';
import { PiezaDto } from '../../application/piezas/dto/pieza.dto';
import { UsuarioActual } from '../comun/decoradores/usuario-actual.decorator';
import { Autenticado } from '../comun/decoradores/autenticado.decorator';
import { UsuarioAutenticado } from '../comun/solicitud-autenticada';

@ApiTags('piezas')
@Controller('piezas')
export class PiezasController {
  constructor(private readonly crearPieza: CrearPieza) {}

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
}
