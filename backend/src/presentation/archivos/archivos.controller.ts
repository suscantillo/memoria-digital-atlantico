import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Header,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
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
  ApiPayloadTooLargeResponse,
  ApiProduces,
  ApiTags,
} from '@nestjs/swagger';
import { AprobarEscaneo } from '../../application/archivos/aprobar-escaneo.use-case';
import { CargarEscaneo } from '../../application/archivos/cargar-escaneo.use-case';
import { AprobarEscaneoDto } from '../../application/archivos/dto/aprobar-escaneo.dto';
import {
  ArchivoDigitalDto,
  ArchivosPaginadosDto,
} from '../../application/archivos/dto/archivo-digital.dto';
import { CargarEscaneoDto } from '../../application/archivos/dto/cargar-escaneo.dto';
import { EscaneoCargadoDto } from '../../application/archivos/dto/escaneo-cargado.dto';
import { ListarArchivosDto } from '../../application/archivos/dto/listar-archivos.dto';
import { RechazarEscaneoDto } from '../../application/archivos/dto/rechazar-escaneo.dto';
import { ListarArchivos } from '../../application/archivos/listar-archivos.use-case';
import { ObtenerContenidoArchivo } from '../../application/archivos/obtener-contenido-archivo.use-case';
import { RechazarEscaneo } from '../../application/archivos/rechazar-escaneo.use-case';
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
  constructor(
    private readonly cargarEscaneo: CargarEscaneo,
    private readonly listarArchivos: ListarArchivos,
    private readonly obtenerContenido: ObtenerContenidoArchivo,
    private readonly aprobarEscaneo: AprobarEscaneo,
    private readonly rechazarEscaneo: RechazarEscaneo,
  ) {}

  @Get()
  @Autenticado('ADMIN', 'PERSONAL')
  @ApiOperation({
    summary: 'Listar escaneos; con estado=EN_REVISION es la cola de control de calidad',
  })
  @ApiOkResponse({ type: ArchivosPaginadosDto })
  listar(@Query() consulta: ListarArchivosDto): Promise<ArchivosPaginadosDto> {
    return this.listarArchivos.ejecutar(consulta);
  }

  @Get(':id/contenido')
  @Autenticado('ADMIN', 'PERSONAL')
  @Header('Cache-Control', 'private, no-store')
  @Header('X-Content-Type-Options', 'nosniff')
  @ApiOperation({ summary: 'Ver el escaneo para revisarlo' })
  @ApiProduces('image/jpeg', 'image/png', 'image/webp', 'image/tiff', 'application/pdf')
  @ApiOkResponse({ description: 'El archivo, con el tipo que se reconoció al cargarlo.' })
  @ApiNotFoundResponse({ description: 'El archivo no existe.' })
  async contenido(@Param('id', ParseUUIDPipe) id: string): Promise<StreamableFile> {
    const archivo = await this.obtenerContenido.ejecutar(id);
    return new StreamableFile(archivo.contenido, {
      type: archivo.tipoMime,
      disposition: `inline; filename*=UTF-8''${encodeURIComponent(archivo.nombreOriginal)}`,
      length: archivo.contenido.length,
    });
  }

  @Post(':id/aprobar')
  @Autenticado('ADMIN', 'PERSONAL')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Aprobar un escaneo EN_REVISION: la pieza queda PUBLICADA' })
  @ApiOkResponse({ type: ArchivoDigitalDto })
  @ApiNotFoundResponse({ description: 'El archivo no existe.' })
  @ApiConflictResponse({ description: 'El escaneo ya fue revisado.' })
  aprobar(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() _criterios: AprobarEscaneoDto,
    @UsuarioActual() usuario: UsuarioAutenticado,
  ): Promise<ArchivoDigitalDto> {
    return this.aprobarEscaneo.ejecutar(id, usuario.id);
  }

  @Post(':id/rechazar')
  @Autenticado('ADMIN', 'PERSONAL')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Rechazar un escaneo EN_REVISION con motivo: la pieza vuelve a REGISTRADA',
  })
  @ApiOkResponse({ type: ArchivoDigitalDto })
  @ApiNotFoundResponse({ description: 'El archivo no existe.' })
  @ApiConflictResponse({ description: 'El escaneo ya fue revisado.' })
  rechazar(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() datos: RechazarEscaneoDto,
    @UsuarioActual() usuario: UsuarioAutenticado,
  ): Promise<ArchivoDigitalDto> {
    return this.rechazarEscaneo.ejecutar(id, usuario.id, datos.motivoRechazo);
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
