import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiServiceUnavailableResponse,
  ApiTags,
} from '@nestjs/swagger';
import { PreguntarAsistenteDto } from '../../application/asistente/dto/preguntar-asistente.dto';
import { RespuestaAsistenteDto } from '../../application/asistente/dto/respuesta-asistente.dto';
import { PreguntarAsistente } from '../../application/asistente/preguntar-asistente.use-case';
import { Publica } from '../comun/decoradores/publica.decorator';

@ApiTags('asistente')
@Controller('asistente')
export class AsistenteController {
  constructor(private readonly preguntarAsistente: PreguntarAsistente) {}

  @Publica()
  @Post('preguntas')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Preguntarle a Miga por piezas publicadas del archivo' })
  @ApiOkResponse({ type: RespuestaAsistenteDto })
  @ApiServiceUnavailableResponse({
    description:
      'El asistente de IA no está configurado o no respondió; el portal usa su buscador.',
  })
  preguntar(@Body() cuerpo: PreguntarAsistenteDto): Promise<RespuestaAsistenteDto> {
    return this.preguntarAsistente.ejecutar(cuerpo);
  }
}
