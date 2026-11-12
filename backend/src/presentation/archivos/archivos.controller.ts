import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBody,
  ApiConflictResponse,
  ApiConsumes,
  ApiCreatedResponse,
  ApiOperation,
  ApiPayloadTooLargeResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CargarEscaneo } from '../../application/archivos/cargar-escaneo.use-case';
import { CargarEscaneoDto } from '../../application/archivos/dto/cargar-escaneo.dto';
import { EscaneoCargadoDto } from '../../application/archivos/dto/escaneo-cargado.dto';
import { Autenticado } from '../comun/decoradores/autenticado.decorator';
import { UsuarioActual } from '../comun/decoradores/usuario-actual.decorator';
import { UsuarioAutenticado } from '../comun/solicitud-autenticada';
import { InterceptorEscaneo } from './interceptor-escaneo';

interface ArchivoSubido {
  originalname: string;
  buffer: Buffer;
}

@ApiTags('archivos')
@Controller('archivos')
export class ArchivosController {
  constructor(private readonly cargarEscaneo: CargarEscaneo) {}

  @Post()
  @Autenticado('ADMIN', 'PERSONAL')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(InterceptorEscaneo)
  @ApiOperation({
    summary: 'Cargar el escaneo de una pieza REGISTRADA con tema, autor y palabras clave',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['archivo', 'piezaId', 'tema', 'autor', 'palabrasClave'],
      properties: {
        archivo: {
          type: 'string',
          format: 'binary',
          description: 'JPG, PNG, WEBP, TIFF o PDF de hasta 20 MB',
        },
        piezaId: { type: 'string', format: 'uuid' },
        tema: { type: 'string', example: 'Carnaval' },
        autor: { type: 'string', example: 'Desconocido' },
        palabrasClave: {
          type: 'array',
          items: { type: 'string' },
          example: ['comparsa', 'desfile'],
        },
      },
    },
  })
  @ApiCreatedResponse({
    type: EscaneoCargadoDto,
    description: 'El archivo queda EN_REVISION y la pieza ESCANEADA.',
  })
  @ApiConflictResponse({
    description: 'La pieza ya tiene un escaneo EN_REVISION o no está REGISTRADA.',
  })
  @ApiPayloadTooLargeResponse({ description: 'El escaneo pesa más de 20 MB.' })
  async cargar(
    @UploadedFile() archivo: ArchivoSubido | undefined,
    @Body() datos: CargarEscaneoDto,
    @UsuarioActual() usuario: UsuarioAutenticado,
  ): Promise<EscaneoCargadoDto> {
    if (!archivo) {
      throw new BadRequestException('Falta el archivo del escaneo en el campo «archivo».');
    }
    const escaneo = await this.cargarEscaneo.ejecutar({
      ...datos,
      usuarioId: usuario.id,
      // multer entrega el nombre en latin1; así «Fotografía.pdf» no llega como «FotografÃ­a.pdf»
      nombreOriginal: Buffer.from(archivo.originalname, 'latin1').toString('utf8').slice(0, 200),
      contenido: new Uint8Array(archivo.buffer),
    });
    return EscaneoCargadoDto.desde(escaneo);
  }
}
