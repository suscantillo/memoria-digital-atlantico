import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Res,
  StreamableFile,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBody,
  ApiConflictResponse,
  ApiConsumes,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiProduces,
  ApiPayloadTooLargeResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CargarEscaneo } from '../../application/archivos/cargar-escaneo.use-case';
import { ObtenerContenidoArchivo } from '../../application/archivos/obtener-contenido-archivo.use-case';
import { CargarEscaneoDto } from '../../application/archivos/dto/cargar-escaneo.dto';
import { EscaneoCargadoDto } from '../../application/archivos/dto/escaneo-cargado.dto';
import type { Response } from 'express';
import { Autenticado } from '../comun/decoradores/autenticado.decorator';
import { Publica } from '../comun/decoradores/publica.decorator';
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
  constructor(
    private readonly cargarEscaneo: CargarEscaneo,
    private readonly obtenerContenido: ObtenerContenidoArchivo,
  ) {}

  @Publica()
  @Get(':id/contenido')
  @ApiOperation({
    summary: 'Ver el escaneo aprobado de una pieza publicada (visor del portal)',
  })
  @ApiProduces('image/jpeg', 'image/png', 'image/webp', 'image/tiff', 'application/pdf')
  @ApiOkResponse({ description: 'El archivo, para mostrarlo en el navegador.' })
  @ApiNotFoundResponse({
    description: 'No existe, no está aprobado o su pieza no está publicada o es restringida.',
  })
  async contenido(
    @Param('id') id: string,
    @Res({ passthrough: true }) respuesta: Response,
  ): Promise<StreamableFile> {
    const archivo = await this.obtenerContenido.ejecutar(id);
    respuesta.set({
      // corto: si la pieza se despublica, deja de verse pronto
      'Cache-Control': 'public, max-age=300',
      'X-Content-Type-Options': 'nosniff',
    });
    return new StreamableFile(archivo.flujo, {
      type: archivo.tipoMime,
      length: archivo.tamanoBytes,
      disposition: `inline; filename*=UTF-8''${encodeURIComponent(archivo.nombreOriginal)}`,
    });
  }

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
