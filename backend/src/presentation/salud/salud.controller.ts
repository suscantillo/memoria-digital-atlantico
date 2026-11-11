import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiServiceUnavailableResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Response } from 'express';
import { EstadoSalud, VerificarSalud } from '../../application/salud/verificar-salud.use-case';
import { Publica } from '../comun/decoradores/publica.decorator';

@ApiTags('salud')
@Publica()
@Controller('health')
export class SaludController {
  constructor(private readonly verificarSalud: VerificarSalud) {}

  @Get()
  @ApiOperation({ summary: 'Estado de la API y de la conexión a la base de datos' })
  @ApiOkResponse({ description: 'La API y la base de datos responden.' })
  @ApiServiceUnavailableResponse({ description: 'La base de datos no responde.' })
  async consultar(@Res({ passthrough: true }) respuesta: Response): Promise<EstadoSalud> {
    const salud = await this.verificarSalud.ejecutar();
    respuesta.status(salud.estado === 'ok' ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE);
    return salud;
  }
}
